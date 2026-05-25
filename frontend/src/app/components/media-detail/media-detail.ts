import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api'; // Verifica che il percorso del file api.ts sia esatto

@Component({
  selector: 'app-media-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './media-detail.html',
  styleUrls: ['./media-detail.css']
})
export class MediaDetail implements OnInit {
  // Conterrà l'oggetto media completo (Film o Serie) inviato da Flask
  film: any = null;

  constructor(
    private route: ActivatedRoute, 
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // 1. Estrae l'ID numerico passato nell'URL (es. /media/4 -> id = 4)
    const id = Number(this.route.snapshot.paramMap.get('id'));
    console.log('ID estratto dalla route:', id);
    
    // 2. Chiamata al servizio per ottenere l'oggetto strutturato
    if (id) {
      this.apiService.getMediaDettaglio(id).subscribe({
        next: (dati) => {
          console.log('Dati dettaglio ricevuti con successo dal database:', dati);
          this.film = dati;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Errore durante il caricamento del dettaglio media:', err);
        }
      });
    }
  }
}