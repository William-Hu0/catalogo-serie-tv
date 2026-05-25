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

  // =========================================================================
  // 🎬 SEZIONE 1: MEDIA
  // =========================================================================
  getMedia(filtri?: any): Observable<any[]> {
    let params = new HttpParams();
    if (filtri) {
      if (filtri.titolo) params = params.set('titolo', filtri.titolo);
      if (filtri.id_genere) params = params.set('id_genere', filtri.id_genere);
      if (filtri.anno) params = params.set('anno', filtri.anno);
    }
    return this.http.get<any[]>(`${this.baseUrl}/v1/media`, { params });
  }

  getMediaDettaglio(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/v1/media/${id}`);
  }

  deleteMedia(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/v3/media/${id}`);
  }

  // =========================================================================
  // 🎭 SEZIONE 2: ATTORI
  // =========================================================================
  getAttori(nome?: string): Observable<any[]> {
    let params = new HttpParams();
    if (nome) params = params.set('nome', nome);
    return this.http.get<any[]>(`${this.baseUrl}/v1/attori`, { params });
  }

  getAttoreDettaglio(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/v1/attori/${id}`);
  }

  // =========================================================================
  // 🎥 SEZIONE 3: REGISTI
  // =========================================================================
  getRegisti(nome?: string): Observable<any[]> {
    let params = new HttpParams();
    if (nome) params = params.set('nome', nome);
    return this.http.get<any[]>(`${this.baseUrl}/v1/registi`, { params });
  }

  getRegistaDettaglio(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/v1/registi/${id}`);
  }
}