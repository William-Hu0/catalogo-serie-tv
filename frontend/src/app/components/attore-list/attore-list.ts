import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-attore-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './attore-list.html',
  styleUrls: ['./attore-list.css']
})
export class AttoreList implements OnInit {
  filtroNome: string = '';
  elencoAttori: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.caricaAttori();
  }

  caricaAttori(): void {
    const params = this.filtroNome ? { nome: this.filtroNome } : {};
    this.apiService.getAttori(params).subscribe({
      next: (data) => {
        this.elencoAttori = data;
      },
      error: (err) => console.error('Errore caricamento attori:', err)
    });
  }

  // FUNZIONE MANCANTE RIPRISTINATA
  eliminaAttore(id: number): void {
    if (confirm('Sei sicuro di voler eliminare questo attore?')) {
      console.log('Elimino attore con ID:', id);
      // Se hai implementato la delete nel service, scommenta la riga sotto:
      // this.apiService.deleteAttore(id).subscribe(() => this.caricaAttori());
    }
  }
}