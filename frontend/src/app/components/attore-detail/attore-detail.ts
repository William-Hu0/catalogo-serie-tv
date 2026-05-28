import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-attore-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './attore-detail.html',
  styleUrls: ['./attore-detail.css']
})
export class AttoreDetail implements OnInit {
  attore: any = null;
  modifficaAttiva: boolean = false;
  formModifica: any = {};
  staCaricando: boolean = false;
  messaggioSuccess: string = '';
  messaggioError: string = '';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef // <-- Forza l'aggiornamento grafico
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    console.log('ID Attore estratto:', id);

    if (id) {
      this.apiService.getAttoreDettaglio(id).subscribe({
        next: (dati) => {
          console.log('Dati attore ricevuti con successo:', dati);
          this.attore = dati;
          this.cdr.detectChanges(); // <-- Sveglia Angular all'arrivo dei dati
        },
        error: (err) => console.error('Errore caricamento dettaglio attore:', err)
      });
    }
  }

  attivaModifica(): void {
    this.modifficaAttiva = true;
    this.formModifica = {
      nome: this.attore.nome,
      cognome: this.attore.cognome,
      nazionalita: this.attore.nazionalita,
      bio: this.attore.bio
    };
    this.messaggioSuccess = '';
    this.messaggioError = '';
  }

  annullaModifica(): void {
    this.modifficaAttiva = false;
    this.formModifica = {};
    this.messaggioSuccess = '';
    this.messaggioError = '';
  }

  salvaModifica(): void {
    if (!this.attore || !this.attore.id_attore) {
      this.messaggioError = 'ID attore non trovato';
      return;
    }

    this.staCaricando = true;
    this.messaggioSuccess = '';
    this.messaggioError = '';

    this.apiService.updateAttore(this.attore.id_attore, this.formModifica).subscribe({
      next: (risposta) => {
        console.log('Attore aggiornato con successo:', risposta);
        this.messaggioSuccess = 'Attore aggiornato con successo! ✅';
        
        // Aggiorna i dati locali
        this.attore = { ...this.attore, ...this.formModifica };
        this.modifficaAttiva = false;
        this.staCaricando = false;

        // Nascondi il messaggio dopo 2 secondi
        setTimeout(() => {
          this.messaggioSuccess = '';
        }, 2000);
      },
      error: (err) => {
        console.error('Errore durante l\'aggiornamento:', err);
        this.messaggioError = 'Errore nell\'aggiornamento. Riprova più tardi.';
        this.staCaricando = false;
      }
    });
  }
}