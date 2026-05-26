import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';
import { ActivatedRoute } from '@angular/router';
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

  // ⏬ NUOVI STATI PER LA CREAZIONE DI UN MEDIA ⏬
  mostraFormAggiungi: boolean = false;
  staSalvando: boolean = false;
  messaggioSuccesso: string = '';
  messaggioErrore: string = '';

  nuovoMedia: any = {
    titolo: '',
    trama: '',
    anno_uscita: new Date().getFullYear(),
    lingua_orig: 'IT',
    voto_medio: 0.0,
    id_genere: ''
  };

  constructor(private apiService: ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.caricaPiattaforme();
    
    // Legge i parametri passati dall'URL ed applica i filtri prima di caricare il catalogo
    this.route.queryParams.subscribe(params => {
      if (params['piattaforma']) {
        this.filtroPiattaforma = params['piattaforma'];
      }
      if (params['tipo']) {
        this.filtroTipo = params['tipo']; // Imposterà automaticamente la tendina su 'SerieTV'
      }
      this.caricaCatalogo(); 
    });
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
    if (this.filtroGenere) filtri.id_genere = this.filtroGenere;
    if (this.filtroAnno) filtri.anno = String(this.filtroAnno);
    if (this.filtroTipo) filtri.tipo = this.filtroTipo;
    if (this.filtroPiattaforma) filtri.id_piattaforma = this.filtroPiattaforma;

    this.apiService.getMedia(filtri).subscribe({
      next: (data) => this.elencoMedia = data,
      error: (err) => console.error(err)
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

  toggleFormAggiungi(): void {
    this.mostraFormAggiungi = !this.mostraFormAggiungi;
    this.messaggioSuccesso = '';
    this.messaggioErrore = '';
  }

  salvaNuovoMedia(): void {
    if (!this.nuovoMedia.titolo.trim()) {
      this.messaggioErrore = 'Il titolo è obbligatorio.';
      return;
    }

    this.staSalvando = true;
    this.messaggioSuccesso = '';
    this.messaggioErrore = '';

    // Convertiamo i valori numerici prima dell'invio
    const payload = {
      ...this.nuovoMedia,
      anno_uscita: this.nuovoMedia.anno_uscita ? Number(this.nuovoMedia.anno_uscita) : null,
      voto_medio: this.nuovoMedia.voto_medio ? Number(this.nuovoMedia.voto_medio) : 0.0,
      id_genere: this.nuovoMedia.id_genere ? Number(this.nuovoMedia.id_genere) : null
    };

    this.apiService.addMedia(payload).subscribe({
      next: (res) => {
        this.messaggioSuccesso = 'Contenuto aggiunto con successo nel database cloud!';
        this.staSalvando = false;
        this.mostraFormAggiungi = false;
        this.caricaCatalogo(); // Ricarica la tabella aggiornata
        
        // Reset del form
        this.nuovoMedia = {
          titolo: '',
          trama: '',
          anno_uscita: new Date().getFullYear(),
          lingua_orig: 'IT',
          voto_medio: 0.0,
          id_genere: ''
        };
      },
      error: (err) => {
        console.error(err);
        this.messaggioErrore = 'Errore durante il salvataggio del contenuto.';
        this.staSalvando = false;
      }
    });
  }
}