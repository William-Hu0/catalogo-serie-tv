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
  elencoMedia: any[] = [];
  filtroTitolo: string = '';
  filtroGenere: string = '';
  filtroAnno: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.caricaCatalogo();
  }

  caricaCatalogo(): void {
    this.apiService.getMedia(this.filtroTitolo, this.filtroGenere, this.filtroAnno).subscribe({
      next: (dati) => this.elencoMedia = dati,
      error: (err) => console.error(err)
    });
  }

  eliminaFilm(id: number): void {
    if (confirm('Vuoi davvero eliminare questo contenuto?')) {
      this.apiService.deleteMedia(id).subscribe(() => {
        alert('Eliminato con successo!');
        this.caricaCatalogo();
      });
    }
  }
}