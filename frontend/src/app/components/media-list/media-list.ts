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
  // Variabili collegate tramite [(ngModel)] al tuo HTML
  filtroTitolo: string = '';
  filtroGenere: string = '';
  filtroAnno: string = '';
  filtroTipo: string = '';
  
  elencoMedia: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.caricaCatalogo();
  }

caricaCatalogo(): void {
    const filtri: any = {};

    if (this.filtroTitolo && this.filtroTitolo.trim()) {
      filtri.titolo = this.filtroTitolo.trim();
    }
    if (this.filtroGenere) {
      filtri.id_genere = this.filtroGenere;
    }
    if (this.filtroAnno) {
      filtri.anno = String(this.filtroAnno);
    }
    
    if (this.filtroTipo) {
      filtri.tipo = this.filtroTipo;
    }

    this.apiService.getMedia(filtri).subscribe({
      next: (data) => {
        console.log('Catalogo caricato con successo:', data);
        this.elencoMedia = data;
      },
      error: (err) => {
        console.error('Errore durante il caricamento del catalogo:', err);
      }
    });
}
  eliminaFilm(id: number): void {
    if (confirm('Sei sicuro di voler eliminare permanentemente questo contenuto?')) {
      this.apiService.deleteMedia(id).subscribe({
        next: () => {
          console.log('Media eliminato:', id);
          this.caricaCatalogo(); // Rinfresca la tabella
        },
        error: (err) => console.error('Errore eliminazione:', err)
      });
    }
  }
}