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
  mostraFormAggiungi: boolean = false;
  staSalvando: boolean = false;
  messaggioSuccesso: string = '';
  messaggioErrore: string = '';

  nuovoAttore = {
    nome: '',
    cognome: '',
    nazionalita: '',
    bio: ''
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.caricaAttori();
  }

  caricaAttori(): void {
    const termineRicerca = this.filtroNome.trim() ? this.filtroNome.trim() : undefined;
    this.apiService.getAttori(termineRicerca).subscribe({
      next: (data) => {
        this.elencoAttori = data;
      },
      error: (err) => console.error(err)
    });
  }

  toggleFormAggiungi(): void {
    this.mostraFormAggiungi = !this.mostraFormAggiungi;
    this.messaggioSuccesso = '';
    this.messaggioErrore = '';
  }

  salvaNuovoAttore(): void {
    if (!this.nuovoAttore.nome.trim()) {
      this.messaggioErrore = 'Il nome è obbligatorio.';
      return;
    }

    this.staSalvando = true;
    this.messaggioSuccesso = '';
    this.messaggioErrore = '';

    const payload = {
      nome: this.nuovoAttore.nome.trim(),
      cognome: this.nuovoAttore.cognome.trim() || null,
      nazionalita: this.nuovoAttore.nazionalita.trim() || null,
      bio: this.nuovoAttore.bio.trim() || null
    };

    this.apiService.addAttore(payload).subscribe({
      next: () => {
        this.messaggioSuccesso = 'Attore aggiunto con successo nel database cloud!';
        this.staSalvando = false;
        this.mostraFormAggiungi = false;
        this.caricaAttori();
        this.nuovoAttore = { nome: '', cognome: '', nazionalita: '', bio: '' };
      },
      error: (err) => {
        console.error(err);
        this.messaggioErrore = "Errore durante il salvataggio.";
        this.staSalvando = false;
      }
    });
  }

  eliminaAttore(id: number): void {
    if (confirm('Sei sicuro di voler eliminare questo attore?')) {
      this.apiService.deleteAttore(id).subscribe({
        next: () => {
          this.caricaAttori();
        },
        error: (err) => console.error(err)
      });
    }
  }
}