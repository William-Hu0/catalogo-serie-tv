import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api'; // Verifica che il percorso del file api.ts sia esatto

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
  staCaricando: boolean = false;
  messaggioSuccess: string = '';
  messaggioError: string = '';

  constructor(
    private route: ActivatedRoute, 
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1. Estrae l'ID numerico passato nell'URL (es. /media/4 -> id = 4)
    const id = Number(this.route.snapshot.paramMap.get('id'));
    console.log('ID estratto dalla route:', id);
    
    // 2. Chiamata al servizio per ottenere l'oggetto strutturato
    if (id) {
      // <--- IL TUO BLOCCO INSERITO QUI AL POSTO DI QUELLO VECCHIO --->
      this.apiService.getMediaDettaglio(id).subscribe({
        next: (dati) => {
          console.log('Dati dettaglio ricevuti con successo dal database:', dati);
          this.film = dati;
          
          // Cambia detectChanges() con markForCheck()
          this.cdr.markForCheck(); 
        },
        error: (err) => {
          console.error('Errore durante il caricamento del dettaglio media:', err);
        }
      });
    }
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