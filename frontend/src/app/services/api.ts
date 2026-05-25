import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  private baseUrl = '/api';

  constructor(private http: HttpClient) { }

  getMedia(titolo?: string, idGenere?: string, anno?: string): Observable<any[]> {
    let params = new HttpParams();
    if (titolo && titolo.trim()) params = params.set('titolo', titolo);
    if (idGenere && idGenere.trim()) params = params.set('id_genere', idGenere);
    if (anno && anno.trim()) params = params.set('anno', anno);
    return this.http.get<any[]>(`${this.baseUrl}/v1/media`, { params });
  }

  getMediaDettaglio(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/v1/media/${id}`);
  }

  deleteMedia(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/v3/media/${id}`);
  }

  getAttori(nome?: string): Observable<any[]> {
    let params = new HttpParams();
    if (nome) params = params.set('nome', nome);
    return this.http.get<any[]>(`${this.baseUrl}/v1/attori`, { params });
  }

  getAttoreDettaglio(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/v1/attori/${id}`);
  }

  getRegisti(nome?: string): Observable<any[]> {
    let params = new HttpParams();
    if (nome) params = params.set('nome', nome);
    return this.http.get<any[]>(`${this.baseUrl}/v1/registi`, { params });
  }

  getRegistaDettaglio(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/v1/registi/${id}`);
  }
}