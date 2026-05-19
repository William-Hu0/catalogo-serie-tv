# 📑 Relazione Tecnica: Progetto Fullstack JustWatch Clone

## 👥 Suddivisione delle Responsabilità
* **Studente A (Gestione/Admin):** Implementazione delle rotte di inserimento (`POST`), modifica (`PUT`), cancellazione (`DELETE`), creazione del database e relativi form di gestione in Angular.
* **Studente B (Visualizzazione/Ricerca):** Implementazione delle rotte di lettura (`GET`) con filtri, query SQL con `JOIN` per le piattaforme e sviluppo della dashboard principale in Angular.

## 📐 Progettazione delle API REST (Contratto Backend-Frontend)

Di seguito viene riportata la documentazione ufficiale delle API utilizzate per far comunicare il client Angular con il server Flask.

| Endpoint | Metodo HTTP | Descrizione | Richiesta (JSON / Query) | Risposta Corretta (200/201) | Risposta Errore (400/404/500) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/catalogo` | **GET** | Recupera tutti i media con filtri di ricerca | `?cerca=Inception` (Opzionale) | `[ { "id_media": 1, "titolo": "Inception", ... } ]` (200) | `{"error": "Errore interno server"}` (500) |
| `/api/media` | **POST** | Inserisce un nuovo film o serie TV | `{"titolo": "Dune", "anno": 2021, "genere": "Sci-Fi", "tipo": "Film", "id_regista": 1}` | `{"message": "Inserito con successo", "id": 4}` (201) | `{"error": "Dati incompleti o errati"}` (400) |
| `/api/media/<id>` | **PUT** | Modifica un contenuto esistente | `{"titolo": "Dune - Parte 1"}` | `{"message": "Contenuto aggiornato"}` (200) | `{"error": "Media non trovato"}` (404) |
| `/api/media/<id>` | **DELETE** | Elimina un contenuto dal catalogo | *Nessuno* | `{"message": "Contenuto eliminato"}` (200) | `{"error": "Media non trovato"}` (404) |

### 📄 Esempio di Formato JSON di Risposta (`GET /api/catalogo`)
Questo è il formato esatto scambiato tra le due componenti per popolare la griglia dei contenuti con le relative piattaforme di streaming:

```json
[
  {
    "id_media": 1,
    "titolo": "Breaking Bad",
    "anno_uscita": 2008,
    "genere": "Drama",
    "tipo": "Serie TV",
    "regista_nome": "Vince",
    "regista_cognome": "Gilligan",
    "piattaforme": [
      {
        "nome": "Netflix",
        "logo_url": "[https://url-logo.com/netflix.png](https://url-logo.com/netflix.png)",
        "tipo_accesso": "Incluso con abbonamento"
      }
    ]
  }
]