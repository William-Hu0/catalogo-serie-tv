Architettura del Progetto
Il progetto è stato sviluppato in coppia utilizzando una struttura fullstack composta da database, backend e frontend.
 Abbiamo scelto il livello di difficoltà Difficile, realizzando un sistema completo dedicato alle serie TV con circa 10 entità collegate tra loro.
Ci siamo organizzati dividendo il lavoro principalmente tra frontend e backend:
uno di noi si è occupato principalmente dello sviluppo del backend Flask e della gestione delle API REST;
l’altro si è occupato dello sviluppo del frontend Angular e dell’interfaccia grafica.
Durante lo sviluppo abbiamo lavorato utilizzando branch separati su GitHub ed effettuando i merge tramite Pull Request.
 Nella fase finale di integrazione abbiamo corretto alcuni errori presenti nel frontend per migliorare il funzionamento dell’applicazione e la comunicazione con il backend.
L’applicazione permette la gestione completa dei dati tramite operazioni CRUD:
visualizzazione dei dati,
inserimento,
modifica,
eliminazione dei record.
Il frontend Angular comunica con il backend Flask tramite richieste HTTP alle API REST, mentre il backend interagisce con il database relazionale attraverso query SQL.

Schema ER
Il database è composto da circa 10 entità riguardanti il mondo delle serie TV.
Le principali entità utilizzate sono:
Media
Serie tv
Film
Attori
Registi
Recensioni
Stagione
Utente
Episodio
Piattaforma

Flusso dei Dati
Nel nostro progetto il flusso dei dati avviene tra tre componenti principali:
Frontend Angular
Backend Flask
Database TiDB
Il frontend si occupa della parte grafica e dell’interazione con l’utente, il backend gestisce le API REST e la logica dell’applicazione, mentre TiDB salva e organizza tutti i dati del sistema.
Funzionamento generale del flusso dati
Quando un utente esegue un’azione nell’interfaccia Angular, ad esempio visualizzare una serie TV oppure inserire una recensione, avviene il seguente processo:
L’utente interagisce con il frontend Angular tramite pulsanti, form o liste.
Angular invia una richiesta HTTP al backend Flask attraverso i servizi Angular (HttpClient).
Flask riceve la richiesta tramite una specifica rotta API (GET, POST, PUT, DELETE).
Il backend esegue query SQL sul database TiDB.
TiDB restituisce i dati richiesti oppure salva/modifica/elimina i record.
Flask converte i dati in formato JSON e invia la risposta al frontend.
Angular riceve la risposta e aggiorna dinamicamente l’interfaccia mostrando i dati all’utente.
Il flusso può essere rappresentato così:
Angular (Frontend) → Flask API (Backend) → TiDB (Database) → Flask → Angular

Esempio pratico: visualizzazione di una Serie TV
L’utente clicca su una serie TV nella lista.
Angular invia una richiesta GET al backend.
Flask richiama il database TiDB per recuperare:
informazioni della serie,
stagioni,
episodi,
recensioni,
attori e registi collegati.
TiDB restituisce i dati tramite query con JOIN tra le tabelle.
Flask invia i dati in formato JSON.
Angular mostra tutte le informazioni nella pagina di dettaglio.

Esempio pratico: inserimento di una recensione
L’utente compila il form della recensione.
Angular invia una richiesta POST contenente testo e voto.
Flask controlla i dati ricevuti.
Il backend salva la recensione nel database TiDB collegandola:
all’utente,
al media recensito.
TiDB salva il record nella tabella Recensioni.
Flask restituisce un messaggio di conferma.
Angular aggiorna la lista delle recensioni nella pagina.

Gestione delle relazioni nel database
Il database è stato progettato con relazioni tra le entità principali:
una Serie TV è composta da più Stagioni;
una Stagione contiene più Episodi;
un Media può essere diretto da più Registi;
un Media può avere più Attori;
gli Utenti possono scrivere più Recensioni;
gli Utenti possono essere abbonati a diverse Piattaforme.
Queste relazioni vengono gestite tramite chiavi primarie, chiavi esterne e query SQL con JOIN nel backend Flask.

https://drive.google.com/file/d/1nydyI-UZIyb9ps2CMztApmBLhgPKPlGP/view?usp=sharing

Endpoint
Metodo HTTP
Descrizione
/media
GET
Restituisce la lista completa dei media presenti nel database
/media/<id>
GET
Restituisce i dettagli di un media specifico
/media
POST
Inserisce un nuovo media nel database
/media/<id>
PUT
Modifica le informazioni di un media esistente
/media/<id>
DELETE
Elimina un media dal database
/serie-tv
GET
Restituisce la lista delle serie TV
/serie-tv/<id>
GET
Restituisce i dettagli di una serie TV
/stagioni
GET
Restituisce la lista delle stagioni
/stagioni/<id>
GET
Restituisce i dettagli di una stagione
/episodi
GET
Restituisce la lista degli episodi
/episodi/<id>
GET
Restituisce il dettaglio di un episodio
/attori
GET
Restituisce la lista degli attori
/attori/<id>
GET
Restituisce il dettaglio di un attore
/registi
GET
Restituisce la lista dei registi
/registi/<id>
GET
Restituisce il dettaglio di un regista
/recensioni
GET
Restituisce tutte le recensioni presenti
/recensioni
POST
Inserisce una nuova recensione
/recensioni/<id>
PUT
Modifica una recensione esistente
/recensioni/<id>
DELETE
Elimina una recensione
/utenti
GET
Restituisce la lista degli utenti
/utenti
POST
Inserisce un nuovo utente
/piattaforme
GET
Restituisce la lista delle piattaforme streaming
/piattaforme/<id>
GET
Restituisce i dettagli di una piattaforma
/abbonamenti
GET
Restituisce gli abbonamenti degli utenti alle piattaforme
/search?titolo=
GET
Cerca media tramite titolo
/genre/<genere>
GET
Filtra i media in base al genere




