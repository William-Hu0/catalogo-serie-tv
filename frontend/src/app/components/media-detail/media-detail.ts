import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api'; // Verifica che il percorso del file api.ts sia esatto
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-media-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './media-detail.html',
  styleUrls: ['./media-detail.css']
})
export class MediaDetail implements OnInit {
  // Conterrà l'oggetto media completo (Film o Serie) inviato da Flask
  film: any = null;
  modifficaAttiva: boolean = false;
  formModifica: any = {};
  reviewForm: any = {
    voto: 8,
    testo: ''
  };
  currentUser: any = null;
  staCaricando: boolean = false;
  isSubmittingReview: boolean = false;
  messaggioSuccess: string = '';
  messaggioError: string = '';

  constructor(
    private route: ActivatedRoute, 
    private apiService: ApiService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1. Estrae l'ID numerico passato nell'URL (es. /media/4 -> id = 4)
    const id = Number(this.route.snapshot.paramMap.get('id'));
    console.log('ID estratto dalla route:', id);
    this.currentUser = this.authService.currentUser;
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    // 2. Chiamata al servizio per ottenere l'oggetto strutturato
    if (id) {
      this.loadMediaDetail(id);
    }
  }

  private loadMediaDetail(id: number): void {
    this.apiService.getMediaDettaglio(id).subscribe({
      next: (dati) => {
        console.log('Dati dettaglio ricevuti con successo dal database:', dati);
        this.film = dati;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Errore durante il caricamento del dettaglio media:', err);
        this.messaggioError = 'Impossibile caricare i dettagli del media. Riprova più tardi.';
      }
    });
  }

  aggiungiRecensione(): void {
    if (!this.currentUser) {
      this.messaggioError = 'Devi accedere con un account per inviare la recensione.';
      return;
    }

    if (!this.film || !this.film.id_media) {
      this.messaggioError = 'ID media non trovato';
      return;
    }

    if (!this.reviewForm.testo || !this.reviewForm.testo.trim()) {
      this.messaggioError = 'Scrivi un commento prima di inviare la recensione.';
      return;
    }

    const voto = Number(this.reviewForm.voto);
    if (isNaN(voto) || voto < 0 || voto > 10) {
      this.messaggioError = 'Il voto deve essere un numero compreso tra 0 e 10.';
      return;
    }

    this.isSubmittingReview = true;
    this.messaggioSuccess = '';
    this.messaggioError = '';

    const nuovaRecensione = {
      voto,
      testo: this.reviewForm.testo.trim(),
      id_utente: this.currentUser.id_utente,
      id_media: this.film.id_media
    };

    this.apiService.addRecensione(nuovaRecensione).subscribe({
      next: () => {
        this.messaggioSuccess = 'Recensione aggiunta con successo! ⭐';
        this.reviewForm = { voto: 8, testo: '' };
        this.loadMediaDetail(this.film.id_media);
        this.isSubmittingReview = false;
        setTimeout(() => {
          this.messaggioSuccess = '';
        }, 2500);
      },
      error: (err) => {
        console.error('Errore durante l\'invio della recensione:', err);
        this.messaggioError = 'Errore inviando la recensione. Riprova più tardi.';
        this.isSubmittingReview = false;
      }
    });
  }

  attivaModifica(): void {
    this.modifficaAttiva = true;
    this.formModifica = {
      titolo: this.film.titolo,
      trama: this.film.trama,
      anno_uscita: this.film.anno_uscita,
      lingua_orig: this.film.lingua_orig,
      voto_medio: this.film.voto_medio,
      id_genere: this.film.id_genere
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
    if (!this.film || !this.film.id_media) {
      this.messaggioError = 'ID media non trovato';
      return;
    }

    this.staCaricando = true;
    this.messaggioSuccess = '';
    this.messaggioError = '';

    this.apiService.updateMedia(this.film.id_media, this.formModifica).subscribe({
      next: (risposta) => {
        console.log('Media aggiornato con successo:', risposta);
        this.messaggioSuccess = 'Media aggiornato con successo! ✅';
        
        // Aggiorna i dati locali
        this.film = { ...this.film, ...this.formModifica };
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