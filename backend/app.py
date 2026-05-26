import os
import hashlib
from flask import Flask, jsonify, request
from flask_cors import CORS
import pymysql
from dotenv import load_dotenv

# Carica le variabili d'ambiente dal file .env
load_dotenv()

app = Flask(__name__)

# Configurazione CORS: permette ad Angular di comunicare con Flask senza blocchi di sicurezza
CORS(app)

def get_db_connection():
    """Stabilisce la connessione con il database TiDB Cloud usando pymysql."""
    return pymysql.connect(
        host=os.getenv("TIDB_HOST"),
        port=int(os.getenv("TIDB_PORT", 4000)),
        user=os.getenv("TIDB_USER"),
        password=os.getenv("TIDB_PASSWORD"),
        database=os.getenv("TIDB_DB_NAME"),
        ssl_verify_cert=True,
        ssl_verify_identity=True,
        # Restituisce i record come dizionari (es. {"titolo": "Inception"}) pronti per Angular
        cursorclass=pymysql.cursors.DictCursor
    )

@app.route('/', methods=['GET'])
def home():
    """Rotta di controllo per verificare lo stato del server backend."""
    return jsonify({
        "status": "online",
        "progetto": "Catalogo Serie TV & Film con TiDB Cloud",
        "database": "Connesso con successo"
    }), 200


# =========================================================================
# 🎬 SEZIONE 1: MEDIA (FILM & SERIE TV)
# =========================================================================

# L1 & L2: LISTA MEDIA + FILTRI AVANZATI (TITOLO, GENERE, ANNO, TIPO E PIATTAFORMA)
@app.route('/api/v1/media', methods=['GET'])
def get_all_media():
    try:
        titolo_cercato = request.args.get('titolo')
        id_genere_filtrato = request.args.get('id_genere')
        anno_cercato = request.args.get('anno')
        tipo_cercato = request.args.get('tipo')
        id_piattaforma_filtrato = request.args.get('id_piattaforma')
        
        connection = get_db_connection()
        with connection.cursor() as cursor:
            # Costruiamo la query base per Media
            sql = "SELECT DISTINCT m.* FROM Media m"
            params = []
            
            # Aggiunge JOIN se c'è filtro piattaforma
            if id_piattaforma_filtrato:
                sql += " JOIN Media_Piattaforma mp ON m.id_media = mp.id_media"
            
            sql += " WHERE 1=1"
            
            # Filtro per Titolo
            if titolo_cercato:
                sql += " AND m.titolo LIKE %s"
                params.append(f"%{titolo_cercato}%")
                
            # Filtro per Genere
            if id_genere_filtrato:
                sql += " AND m.id_genere = %s"
                params.append(int(id_genere_filtrato))
                
            # Filtro per Anno di Uscita
            if anno_cercato:
                sql += " AND m.anno_uscita = %s"
                params.append(int(anno_cercato))
            
            # Filtro per Tipo (Film o SerieTV)
            if tipo_cercato:
                if tipo_cercato == 'Film':
                    sql += " AND m.id_media IN (SELECT id_media FROM Film)"
                elif tipo_cercato == 'SerieTV':
                    sql += """ AND (
                        m.id_media IN (SELECT id_media FROM SerieTV) 
                        OR m.id_media IN (SELECT id_media FROM Stagione)
                    )"""
            
            # Filtro per Piattaforma
            if id_piattaforma_filtrato:
                sql += " AND mp.id_piattaforma = %s"
                params.append(int(id_piattaforma_filtrato))
            
            cursor.execute(sql, params)
            result = cursor.fetchall()
            
        connection.close()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# L2: DETTAGLIO MEDIA STRUTTURATO (Riconosce Film/Serie, estrae Regista, Cast, Piattaforme ed eventuali Stagioni)
@app.route('/api/v1/media/<int:id_media>', methods=['GET'])
def get_media_dettaglio(id_media):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            
            # 1. Recupera i dati base del Media e del suo Regista (tramite la tabella ponte Media_Regista)
            sql_media = """
                SELECT m.*, r.nome AS nome_regista, r.id_regista
                FROM Media m
                LEFT JOIN Media_Regista mr ON m.id_media = mr.id_media
                LEFT JOIN Regista r ON mr.id_regista = r.id_regista
                WHERE m.id_media = %s
            """
            cursor.execute(sql_media, (id_media,))
            media = cursor.fetchone()
            
            if not media:
                connection.close()
                return jsonify({"message": "Contenuto non trovato"}), 404

            # 2. Controllo Polimorfismo: Verifica se si tratta di un Film o di una Serie TV
            sql_film = "SELECT * FROM Film WHERE id_media = %s"
            cursor.execute(sql_film, (id_media,))
            film_data = cursor.fetchone()
            
            if film_data:
                media['tipo'] = 'Film'
                media['durata_minuti'] = film_data.get('durata_min')
                media['stagioni'] = [] # I film non possiedono stagioni
            else:
                media['tipo'] = 'SerieTV'
                
                # 3. Se non è un film, cerca le stagioni collegate alla Serie TV
                sql_stagioni = "SELECT * FROM Stagione WHERE id_media = %s"
                cursor.execute(sql_stagioni, (id_media,))
                stagioni = cursor.fetchall()

                # Per ogni singola stagione, recupera i relativi Episodi
                for stagione in stagioni:
                    sql_episodi = "SELECT * FROM Episodio WHERE id_stagione = %s"
                    cursor.execute(sql_episodi, (stagione.get('id_stagione'),))
                    stagione['episodi'] = cursor.fetchall()

                media['stagioni'] = stagioni

            # 4. Recupera le Piattaforme di Streaming associate (tramite la tabella ponte Media_Piattaforma)
            sql_piattaforme = """
                SELECT p.* FROM Piattaforma p
                JOIN Media_Piattaforma mp ON p.id_piattaforma = mp.id_piattaforma
                WHERE mp.id_media = %s
            """
            cursor.execute(sql_piattaforme, (id_media,))
            media['piattaforme'] = cursor.fetchall()

            # 5. Recupera gli Attori del Cast associati (tramite la tabella ponte Media_Attore)
            sql_cast = """
                SELECT a.* FROM Attore a
                JOIN Media_Attore ma ON a.id_attore = ma.id_attore
                WHERE ma.id_media = %s
            """
            cursor.execute(sql_cast, (id_media,))
            media['cast'] = cursor.fetchall()
            
            # 6. Recupera le Recensioni degli utenti (Corretto il campo r.testo in base al CSV)
            sql_recensioni = """
                SELECT u.username AS utente, r.voto AS stelle, r.testo AS commento 
                FROM Recensione r
                JOIN Utente u ON r.id_utente = u.id_utente
                WHERE r.id_media = %s
            """
            cursor.execute(sql_recensioni, (id_media,))
            media['recensioni'] = cursor.fetchall()
            
        connection.close()
        return jsonify(media), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# L3: CRUD MEDIA (POST, PUT, DELETE)
@app.route('/api/v3/media', methods=['POST'])
def add_media():
    try:
        data = request.json
        connection = get_db_connection()
        with connection.cursor() as cursor:
            sql = """INSERT INTO Media (titolo, trama, anno_uscita, lingua_orig, voto_medio, id_genere) 
                     VALUES (%s, %s, %s, %s, %s, %s)"""
            cursor.execute(sql, (data['titolo'], data.get('trama'), data.get('anno_uscita'), 
                                 data.get('lingua_orig'), data.get('voto_medio'), data.get('id_genere')))
            connection.commit()
        connection.close()
        return jsonify({"message": "Media inserito con successo!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/v3/media/<int:id_media>', methods=['PUT'])
def update_media(id_media):
    try:
        data = request.json
        connection = get_db_connection()
        with connection.cursor() as cursor:
            sql = """UPDATE Media SET titolo=%s, trama=%s, anno_uscita=%s, lingua_orig=%s, 
                     voto_medio=%s, id_genere=%s WHERE id_media=%s"""
            cursor.execute(sql, (data['titolo'], data.get('trama'), data.get('anno_uscita'), 
                                 data.get('lingua_orig'), data.get('voto_medio'), data.get('id_genere'), id_media))
            connection.commit()
        connection.close()
        return jsonify({"message": "Media aggiornato!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/v3/media/<int:id_media>', methods=['DELETE'])
def delete_media(id_media):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            sql = "DELETE FROM Media WHERE id_media = %s"
            cursor.execute(sql, (id_media,))
            connection.commit()
        connection.close()
        return jsonify({"message": "Media eliminato permanentemente!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================================================================
# 🎭 SEZIONE 2: ATTORI
# =========================================================================

# L1 & L2: LISTA ATTORI + FILTRO DI RICERCA SUL NOME
@app.route('/api/v1/attori', methods=['GET'])
def get_all_attori():
    try:
        nome_cercato = request.args.get('nome')
        connection = get_db_connection()
        with connection.cursor() as cursor:
            sql = "SELECT * FROM Attore WHERE 1=1"
            params = []
            if nome_cercato:
                sql += " AND nome LIKE %s"
                params.append(f"%{nome_cercato}%")
                
            cursor.execute(sql, params)
            result = cursor.fetchall()
        connection.close()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# L2: DETTAGLIO SINGOLO ATTORE (Destinazione Cross-Link dal Cast)
@app.route('/api/v1/attori/<int:id_attore>', methods=['GET'])
def get_attore_dettaglio(id_attore):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            # 1. Recupera i dati anagrafici e la BIO dell'attore
            sql_attore = "SELECT id_attore, nome, cognome, nazionalita, bio FROM Attore WHERE id_attore = %s"
            cursor.execute(sql_attore, (id_attore,))
            attore = cursor.fetchone()
            
            if attore:
                # 2. Recupera la filmografia unendo Media e la tabella pivot Media_Attore
                sql_filmografia = """
                    SELECT m.id_media, m.titolo, m.anno_uscita
                    FROM Media m
                    JOIN Media_Attore ma ON m.id_media = ma.id_media
                    WHERE ma.id_attore = %s
                """
                cursor.execute(sql_filmografia, (id_attore,))
                filmografia = cursor.fetchall()
                
                # Mappatura del tipo per Angular controllando la tabella Film o SerieTV
                for item in filmografia:
                    sql_check_film = "SELECT 1 FROM Film WHERE id_media = %s"
                    cursor.execute(sql_check_film, (item.get('id_media'),))
                    if cursor.fetchone():
                        item['tipo'] = 'Film'
                    else:
                        item['tipo'] = 'SerieTV'
                
                # Alleghiamo l'array mappato all'oggetto attore
                attore['filmografia'] = filmografia
                
        connection.close()
        
        if attore:
            return jsonify(attore), 200
        return jsonify({"message": "Attore non trovato"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================================================================
# 🎥 SEZIONE 3: REGISTI
# =========================================================================

# L1 & L2: LISTA REGISTI + FILTRO DI RICERCA SUL NOME
@app.route('/api/v1/registi', methods=['GET'])
def get_all_registi():
    try:
        nome_cercato = request.args.get('nome')
        connection = get_db_connection()
        with connection.cursor() as cursor:
            sql = "SELECT * FROM Regista WHERE 1=1"
            params = []
            if nome_cercato:
                sql += " AND nome LIKE %s"
                params.append(f"%{nome_cercato}%")
                
            cursor.execute(sql, params)
            result = cursor.fetchall()
        connection.close()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# L2: DETTAGLIO SINGOLO REGISTA (Destinazione Cross-Link dalla Regia)
@app.route('/api/v1/registi/<int:id_regista>', methods=['GET'])
def get_regista_dettaglio(id_regista):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            sql = "SELECT * FROM Regista WHERE id_regista = %s"
            cursor.execute(sql, (id_regista,))
            regista = cursor.fetchone()
        connection.close()
        if regista:
            return jsonify(regista), 200
        return jsonify({"message": "Regista non trovato"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================================================================
# 🌐 SEZIONE 3.5: PIATTAFORME
# =========================================================================

@app.route('/api/v1/piattaforme', methods=['GET'])
def get_piattaforme():
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT id_piattaforma, nome FROM Piattaforma ORDER BY nome")
            result = cursor.fetchall()
        connection.close()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# =========================================================================
# 👥 SEZIONE 4: UTENTI (Gestione Community)
# =========================================================================

@app.route('/api/v1/utenti', methods=['GET'])
def get_all_utenti():
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT id_utente, username, email, data_iscrizione, paese, eta FROM Utente ORDER BY id_utente DESC")
            result = cursor.fetchall()
        connection.close()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/v1/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        if not username or not password:
            return jsonify({"error": "Username e password sono obbligatori."}), 400

        password_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()
        connection = get_db_connection()
        with connection.cursor() as cursor:
            sql = "SELECT id_utente, username, email FROM Utente WHERE username = %s AND password_hash = %s"
            cursor.execute(sql, (username, password_hash))
            user = cursor.fetchone()
        connection.close()

        if user:
            return jsonify(user), 200
        return jsonify({"error": "Credenziali non valide."}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/v3/utenti', methods=['POST'])
def add_utente():
    try:
        data = request.json
        password = data.get('password')
        if not password:
            return jsonify({"error": "La password è obbligatoria."}), 400

        password_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()
        connection = get_db_connection()
        with connection.cursor() as cursor:
            sql = "INSERT INTO Utente (username, email, password_hash, data_iscrizione) VALUES (%s, %s, %s, CURDATE())"
            cursor.execute(sql, (data['username'], data['email'], password_hash))
            connection.commit()
        connection.close()
        return jsonify({"message": "Utente registrato con successo!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ⏬ NUOVA ROTTA: MODIFICA UTENTE (PUT) ⏬
@app.route('/api/v3/utenti/<int:id_utente>', methods=['PUT'])
def update_utente(id_utente):
    try:
        data = request.json
        connection = get_db_connection()
        with connection.cursor() as cursor:
            sql = "UPDATE Utente SET username=%s, email=%s WHERE id_utente=%s"
            cursor.execute(sql, (data['username'], data['email'], id_utente))
            connection.commit()
        connection.close()
        return jsonify({"message": "Dati utente aggiornati con successo!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ⏬ NUOVA ROTTA: ELIMINAZIONE UTENTE (DELETE) ⏬
@app.route('/api/v3/utenti/<int:id_utente>', methods=['DELETE'])
def delete_utente(id_utente):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            sql = "DELETE FROM Utente WHERE id_utente = %s"
            cursor.execute(sql, (id_utente,))
            connection.commit()
        connection.close()
        return jsonify({"message": "Utente eliminato permanentemente!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================================================================
# ⭐ SEZIONE 5: RECENSIONI (Feed & Critiche)
# =========================================================================

@app.route('/api/v1/recensioni', methods=['GET'])
def get_all_recensioni():
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            sql = """
                SELECT r.*, u.username, m.titolo 
                FROM Recensione r
                JOIN Utente u ON r.id_utente = u.id_utente
                JOIN Media m ON r.id_media = m.id_media
                ORDER BY r.id_recensione DESC
            """
            cursor.execute(sql)
            result = cursor.fetchall()
        connection.close()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/v3/recensioni', methods=['POST'])
def add_recensione():
    try:
        data = request.json
        connection = get_db_connection()
        with connection.cursor() as cursor:
            # Inserimento con campo data_rec obbligatorio
            sql = """
                INSERT INTO Recensione (voto, testo, id_utente, id_media, data_rec) 
                VALUES (%s, %s, %s, %s, CURDATE())
            """
            cursor.execute(sql, (int(data['voto']), data.get('testo', ''), 
                                 int(data['id_utente']), int(data['id_media'])))
            connection.commit()
        connection.close()
        return jsonify({"message": "Recensione inserita con successo!"}), 201
    except Exception as e:
        if 'Duplicate entry' in str(e):
            return jsonify({"error": "Hai già recensito questo contenuto."}), 409
        return jsonify({"error": str(e)}), 500

# ⏬ NUOVA ROTTA: MODIFICA RECENSIONE (PUT) ⏬
@app.route('/api/v3/recensioni/<int:id_recensione>', methods=['PUT'])
def update_recensione(id_recensione):
    try:
        data = request.json
        connection = get_db_connection()
        with connection.cursor() as cursor:
            # Sincronizzato con l'uso della colonna 'testo' del database
            sql = "UPDATE Recensione SET voto=%s, testo=%s WHERE id_recensione=%s"
            cursor.execute(sql, (int(data['voto']), data.get('testo', ''), id_recensione))
            connection.commit()
        connection.close()
        return jsonify({"message": "Recensione modificata con successo!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ⏬ NUOVA ROTTA: ELIMINAZIONE RECENSIONE (DELETE) ⏬
@app.route('/api/v3/recensioni/<int:id_recensione>', methods=['DELETE'])
def delete_recensione(id_recensione):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            sql = "DELETE FROM Recensione WHERE id_recensione = %s"
            cursor.execute(sql, (id_recensione,))
            connection.commit()
        connection.close()
        return jsonify({"message": "Recensione rimossa con successo!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================================================================
# AVVIO APPLICAZIONE
# =========================================================================
if __name__ == '__main__':
    # host='0.0.0.0' mappa correttamente la porta per l'esterno all'interno di GitHub Codespaces
    app.run(debug=True, host='0.0.0.0', port=5000)