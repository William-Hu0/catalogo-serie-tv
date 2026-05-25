import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-regista-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './regista-list.html',
  styleUrls: ['./regista-list.css']
})
export class RegistaList implements OnInit {
  // PROPRIETÀ RIPRISTINATE
  filtroNomeRegista: string = '';
  elencoRegisti: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.caricaRegisti();
  }

  caricaRegisti(): void {
    const params = this.filtroNomeRegista ? { nome: this.filtroNomeRegista } : {};
    this.apiService.getRegisti(params).subscribe({
      next: (data) => {
        this.elencoRegisti = data;
      },
      error: (err) => console.error('Errore caricamento registi:', err)
    });
  }

  // FUNZIONE MANCANTE RIPRISTINATA
  eliminaRegista(id: number): void {
    if (confirm('Sei sicuro di voler eliminare questo regista?')) {
      console.log('Elimino regista con ID:', id);
      // Se hai la rotta di delete pronta, scommenta sotto:
      // this.apiService.deleteRegista(id).subscribe(() => this.caricaRegisti());
    }
  }
}