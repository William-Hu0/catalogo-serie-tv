import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-regista-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './regista-detail.html',
  styleUrls: ['./regista-detail.css']
})
export class RegistaDetail implements OnInit {
  regista: any = null;
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
    console.log('ID Regista estratto:', id);

    if (id) {
      this.apiService.getRegistaDettaglio(id).subscribe({
        next: (dati) => {
          console.log('Dati regista ricevuti con successo:', dati);
          this.regista = dati;
          this.cdr.detectChanges(); // <-- Sveglia Angular all'arrivo dei dati
        },
        error: (err) => console.error('Errore caricamento dettaglio regista:', err)
      });
    }
  }

  attivaModifica(): void {
    this.modifficaAttiva = true;
    this.formModifica = {
      nome: this.regista.nome,
      cognome: this.regista.cognome,
      nazionalita: this.regista.nazionalita,
      bio: this.regista.bio
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
    if (!this.regista || !this.regista.id_regista) {
      this.messaggioError = 'ID regista non trovato';
      return;
    }

    this.staCaricando = true;
    this.messaggioSuccess = '';
    this.messaggioError = '';

    this.apiService.updateRegista(this.regista.id_regista, this.formModifica).subscribe({
      next: (risposta) => {
        console.log('Regista aggiornato con successo:', risposta);
        this.messaggioSuccess = 'Regista aggiornato con successo! ✅';
        
        // Aggiorna i dati locali
        this.regista = { ...this.regista, ...this.formModifica };
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