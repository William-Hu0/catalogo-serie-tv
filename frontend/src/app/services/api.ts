import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  // CORREZIONE PER CODESPACES: Usiamo il percorso relativo per attivare il proxy.conf.json
  private baseUrl = '/api';

  constructor(private http: HttpClient) { }

  
  // 🎬 SEZIONE 1: MEDIA (FILM & SERIE TV)

  // Ottiene l'elenco includendo il filtro correttivo sul "tipo" (Film o SerieTV)
  getMedia(filtri?: any): Observable<any[]> {
    let params = new HttpParams();
    if (filtri) {
      if (filtri.titolo) params = params.set('titolo', filtri.titolo);
      if (filtri.id_genere) params = params.set('id_genere', filtri.id_genere);
      if (filtri.anno) params = params.set('anno', filtri.anno);
      if (filtri.tipo) params = params.set('tipo', filtri.tipo);
      if (filtri.id_piattaforma) params = params.set('id_piattaforma', filtri.id_piattaforma);
    }
    return this.http.get<any[]>(`${this.baseUrl}/v1/media`, { params });
  }

  getMediaDettaglio(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/v1/media/${id}`);
  }

  addMedia(media: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/v3/media`, media);
  }

  updateMedia(id: number, media: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/v3/media/${id}`, media);
  }

  addRecensione(recensione: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/v3/recensioni`, recensione);
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/v1/login`, credentials);
  }

  registerUser(user: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/v3/utenti`, user);
  }

  deleteMedia(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/v3/media/${id}`);
  }

 
  // 🎭 SEZIONE 2: ATTORI (CRUD COMPLETO)

  getAttori(nome?: string): Observable<any[]> {
    let params = new HttpParams();
    if (nome) params = params.set('nome', nome);
    return this.http.get<any[]>(`${this.baseUrl}/v1/attori`, { params });
  }

  getAttoreDettaglio(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/v1/attori/${id}`);
  }

  //Inserimento Attore (POST)
  addAttore(attore: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/v3/attori`, attore);
  }

  //Modifica Attore (PUT)
  updateAttore(id: number, attore: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/v3/attori/${id}`, attore);
  }

  //Eliminazione Attore (DELETE)
  deleteAttore(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/v3/attori/${id}`);
  }

 
  // 🎥 SEZIONE 3: REGISTI (CRUD COMPLETO)
  
  getRegisti(nome?: string): Observable<any[]> {
    let params = new HttpParams();
    if (nome) params = params.set('nome', nome);
    return this.http.get<any[]>(`${this.baseUrl}/v1/registi`, { params });
  }

  getRegistaDettaglio(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/v1/registi/${id}`);
  }

  //Inserimento Regista (POST)
  addRegista(regista: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/v3/registi`, regista);
  }

  //Modifica Regista (PUT)
  updateRegista(id: number, regista: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/v3/registi/${id}`, regista);
  }

  //Eliminazione Regista (DELETE)
  deleteRegista(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/v3/registi/${id}`);
  }

  getPiattaforme(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/v1/piattaforme`);
  }

  getPiattaformaDettaglio(id: number): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/v1/piattaforme/${id}`);
}

}