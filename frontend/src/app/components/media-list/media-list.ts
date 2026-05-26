import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-media-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './media-list.html',
  styleUrls: ['./media-list.css']
})
export class MediaListComponent implements OnInit {
  filtroTitolo: string = '';
  filtroGenere: string = '';
  filtroAnno: string = '';
  filtroTipo: string = '';
  filtroPiattaforma: string = '';

  elencoMedia: any[] = [];
  elencoPiattaforme: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.caricaPiattaforme(); 
    this.caricaCatalogo();
  }

  caricaPiattaforme(): void { 
    this.apiService.getPiattaforme().subscribe({
      next: (data) => { this.elencoPiattaforme = data; },
      error: (err) => console.error('Errore caricamento piattaforme:', err)
    });
  }

  caricaCatalogo(): void {
    const filtri: any = {};
    if (this.filtroTitolo?.trim()) filtri.titolo = this.filtroTitolo.trim();
    if (this.filtroGenere)        filtri.id_genere = this.filtroGenere;
    if (this.filtroAnno)          filtri.anno = String(this.filtroAnno);
    if (this.filtroTipo)          filtri.tipo = this.filtroTipo;
    if (this.filtroPiattaforma)   filtri.id_piattaforma = String(this.filtroPiattaforma);

    this.apiService.getMedia(filtri).subscribe({
      next: (data) => { this.elencoMedia = data; },
      error: (err) => console.error('Errore caricamento catalogo:', err)
    });
  }

  eliminaFilm(id: number): void {
    if (confirm('Sei sicuro di voler eliminare permanentemente questo contenuto?')) {
      this.apiService.deleteMedia(id).subscribe({
        next: () => this.caricaCatalogo(),
        error: (err) => console.error('Errore eliminazione:', err)
      });
    }
  }
}