import os
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

#LISTA MEDIA + FILTRI AVANZATI (TITOLO, GENERE E ANNO DI USCITA)
@app.route('/api/media', methods=['GET'])
def get_all_media():
    try:
        titolo_cercato = request.args.get('titolo')
        id_genere_filtrato = request.args.get('id_genere')
        anno_cercato = request.args.get('anno')
        
        connection = get_db_connection()
        with connection.cursor() as cursor:
            sql = "SELECT * FROM Media WHERE 1=1"
            params = []
            
            # Filtro per Titolo (ricerca parziale con LIKE)
            if titolo_cercato:
                sql += " AND titolo LIKE %s"
                params.append(f"%{titolo_cercato}%")
                
            # Filtro per Genere (tramite ID esatto)
            if id_genere_filtrato:
                sql += " AND id_genere = %s"
                params.append(int(id_genere_filtrato))
                
            # Filtro per Anno di Uscita (esatto)
            if anno_cercato and anno_cercato.strip() != "":
                try:
                    sql += " AND anno_uscita = %s"
                    params.append(int(anno_cercato)) # Forza la conversione in numero intero
                except ValueError:
                    pass # Ignora il filtro se l'utente digita caratteri non numerici
                        
            cursor.execute(sql, params)
            result = cursor.fetchall()
        connection.close()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#DETTAGLIO MEDIA STRUTTURATO (Riconosce Film/Serie, estrae Regista, Cast, Piattaforme, Stagioni ed Episodi)
@app.route('/api/media/<int:id_media>', methods=['GET'])
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
            sql_film = "SELECT durata_minuti FROM Film WHERE id_media = %s"
            cursor.execute(sql_film, (id_media,))
            film_data = cursor.fetchone()
            
            if film_data:
                media['tipo'] = 'Film'
                media['durata_minuti'] = film_data['durata_minuti']
                media['stagioni'] = [] # I film non possiedono stagioni
            else:
                media['tipo'] = 'SerieTV'
                
                # 3. Se è una Serie TV, recupera le sue Stagioni nidificate
                sql_stagioni = """
                    SELECT id_stagione, numero_stagione, titolo_stagione 
                    FROM Stagione 
                    WHERE id_media = %s
                    ORDER BY numero_stagione
                """
                cursor.execute(sql_stagioni, (id_media,))
                stagioni = cursor.fetchall()

                # Per ogni singola stagione, recupera i relativi Episodi
                for stagione in stagioni:
                    sql_episodi = """
                        SELECT numero_episodio, titolo_episodio, durata 
                        FROM Episodio 
                        WHERE id_stagione = %s
                        ORDER BY numero_episodio
                    """
                    cursor.execute(sql_episodi, (stagione['id_stagione'],))
                    stagione['episodi'] = cursor.fetchall()

                media['stagioni'] = stagioni

            # 4. Recupera le Piattaforme di Streaming associate (tramite la tabella ponte Media_Piattaforma)
            sql_piattaforme = """
                SELECT p.nome_piattaforma 
                FROM Piattaforma p
                JOIN Media_Piattaforma mp ON p.id_piattaforma = mp.id_piattaforma
                WHERE mp.id_media = %s
            """
            cursor.execute(sql_piattaforme, (id_media,))
            media['piattaforme'] = cursor.fetchall()

            # 5. Recupera gli Attori del Cast associati (tramite la tabella ponte Media_Attore)
            sql_cast = """
                SELECT a.id_attore, a.nome 
                FROM Attore a
                JOIN Media_Attore ma ON a.id_attore = ma.id_attore
                WHERE ma.id_media = %s
            """
            cursor.execute(sql_cast, (id_media,))
            media['cast'] = cursor.fetchall()

        connection.close()
        return jsonify(media), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#CRUD MEDIA (POST, PUT, DELETE)
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


#LISTA ATTORI + FILTRO DI RICERCA SUL NOME
@app.route('/api/attori', methods=['GET'])
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

#DETTAGLIO SINGOLO ATTORE (Destinazione Cross-Link dal Cast)
@app.route('/api/attori/<int:id_attore>', methods=['GET'])
def get_attore_dettaglio(id_attore):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            sql = "SELECT * FROM Attore WHERE id_attore = %s"
            cursor.execute(sql, (id_attore,))
            attore = cursor.fetchone()
        connection.close()
        if attore:
            return jsonify(attore), 200
        return jsonify({"message": "Attore non trovato"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#LISTA REGISTI + FILTRO DI RICERCA SUL NOME
@app.route('/api/registi', methods=['GET'])
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

#DETTAGLIO SINGOLO REGISTA (Destinazione Cross-Link dalla Regia)
@app.route('/api/registi/<int:id_regista>', methods=['GET'])
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


if __name__ == '__main__':
    # host='0.0.0.0' mappa correttamente la porta per l'esterno all'interno di GitHub Codespaces
    app.run(debug=True, host='0.0.0.0', port=5000)