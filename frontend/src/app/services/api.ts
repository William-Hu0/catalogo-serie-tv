import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://localhost:5000'; // cambia poi con codespace

  constructor(private http: HttpClient) {}

  getAllMedia() {
    return this.http.get(`${this.baseUrl}/getAllDataInHtml`);
  }

  getMediaById(id: number) {
    return this.http.get(`${this.baseUrl}/media/${id}`);
  }
}