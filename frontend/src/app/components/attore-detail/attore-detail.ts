import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-attore-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './attore-detail.html',
  styleUrls: ['./attore-detail.css']
})
export class AttoreDetail implements OnInit {
  attore: any = null;

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
}