import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../services/api'; // Controlla che questo percorso sia corretto nel tuo progetto

@Component({
  selector: 'app-piattaforma-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './piattaforma-detail.html',
  styleUrls: ['./piattaforma-detail.css']
})
export class PiattaformaDetail implements OnInit {
  piattaforma: any = null;
  mediaFiltrato: any[] = [];
  filtroTipo: 'tutti' | 'Film' | 'SerieTV' = 'tutti';
  isLoading: boolean = true;
  errore: string = '';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.caricaPiattaforma(id);
      } else {
        this.errore = 'ID piattaforma non valido o mancante nell\'URL.';
        this.isLoading = false;
      }
    });
  }

  private caricaPiattaforma(id: number): void {
    this.isLoading = true;
    this.errore = '';
    
    this.apiService.getPiattaformaDettaglio(id).subscribe({
      next: (dati) => {
        if (dati) {
          this.piattaforma = dati;
          // Uniforma il campo tipo per evitare disallineamenti ('Serie TV' -> 'SerieTV')
          if (this.piattaforma.media) {
            this.piattaforma.media = this.piattaforma.media.map((m: any) => ({
              ...m,
              tipo: m.tipo && m.tipo.replace(/\s+/g, '') === 'Film' ? 'Film' : 'SerieTV'
            }));
          }
          this.applicaFiltro();
        } else {
          this.errore = 'Nessun dato restituito dal server.';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore nel caricamento della piattaforma:', err);
        this.errore = 'Impossibile connettersi al database o dati non trovati.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setFiltro(tipo: 'tutti' | 'Film' | 'SerieTV'): void {
    this.filtroTipo = tipo;
    this.applicaFiltro();
  }

  private applicaFiltro(): void {
    if (!this.piattaforma || !this.piattaforma.media) {
      this.mediaFiltrato = [];
      return;
    }

    if (this.filtroTipo === 'tutti') {
      this.mediaFiltrato = this.piattaforma.media;
    } else {
      this.mediaFiltrato = this.piattaforma.media.filter(
        (m: any) => m.tipo === this.filtroTipo
      );
    }
  }

  get countFilm(): number {
    return this.piattaforma?.media?.filter((m: any) => m.tipo === 'Film').length ?? 0;
  }

  get countSerie(): number {
    return this.piattaforma?.media?.filter((m: any) => m.tipo === 'SerieTV').length ?? 0;
  }
}