import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-regista-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './regista-detail.html',
  styleUrls: ['./regista-detail.css']
})
export class RegistaDetail implements OnInit {
  regista: any = null;

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
}