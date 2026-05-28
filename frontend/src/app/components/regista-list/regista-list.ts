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
  // Proprietà per la ricerca e la lista
  filtroNomeRegista: string = '';
  elencoRegisti: any[] = [];

  // PROPRIETÀ DI STATO (Seguendo il tuo schema)
  mostraFormAggiungi: boolean = false;
  staSalvando: boolean = false;
  messaggioSuccesso: string = '';
  messaggioErrore: string = '';

  // Modello per l'inserimento del nuovo regista
  nuovoRegista = {
    nome: '',
    cognome: '',
    nazionalita: ''
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.caricaRegisti();
  }

  caricaRegisti(): void {
    const termineRicerca = this.filtroNomeRegista.trim() ? this.filtroNomeRegista.trim() : undefined;
    
    this.apiService.getRegisti(termineRicerca).subscribe({
      next: (data) => {
        this.elencoRegisti = data;
      },
      error: (err) => console.error('Errore caricamento registi:', err)
    });
  }

  // REPLICA SCHEMA: Gestione visibilità del form e reset messaggi
  toggleFormAggiungi(): void {
    this.mostraFormAggiungi = !this.mostraFormAggiungi;
    this.messaggioSuccesso = '';
    this.messaggioErrore = '';
  }

  // REPLICA SCHEMA: Salvataggio con gestione stati, feedback e ricarica tabella
  salvaNuovoRegista(): void {
    if (!this.nuovoRegista.nome.trim()) {
      this.messaggioErrore = 'Il nome è obbligatorio.';
      return;
    }

    this.staSalvando = true;
    this.messaggioSuccesso = '';
    this.messaggioErrore = '';

    // Prepariamo il payload (pulisce gli spazi extra dalle stringhe)
    const payload = {
      nome: this.nuovoRegista.nome.trim(),
      cognome: this.nuovoRegista.cognome.trim() || null,
      nazionalita: this.nuovoRegista.nazionalita.trim() || null
    };

    this.apiService.addRegista(payload).subscribe({
      next: (res) => {
        this.messaggioSuccesso = 'Regista aggiunto con successo nel database cloud!';
        this.staSalvando = false;
        this.mostraFormAggiungi = false;
        this.caricaRegisti(); // Ricarica la tabella aggiornata
        
        // Reset del form
        this.nuovoRegista = {
          nome: '',
          cognome: '',
          nazionalita: ''
        };
      },
      error: (err) => {
        console.error(err);
        this.messaggioErrore = 'Errore durante il salvataggio del regista.';
        this.staSalvando = false;
      }
    });
  }

  eliminaRegista(id: number): void {
    if (confirm('Sei sicuro di voler eliminare questo regista?')) {
      console.log('Elimino regista con ID:', id);
      this.apiService.deleteRegista(id).subscribe(() => this.caricaRegisti());
    }
  }
}