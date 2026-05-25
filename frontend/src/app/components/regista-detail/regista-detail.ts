import { Component, OnInit } from '@angular/core';
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

  constructor(private route: ActivatedRoute, private apiService: ApiService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.apiService.getRegistaDettaglio(id).subscribe({
      next: (dati) => this.regista = dati,
      error: (errore) => console.error(errore)
    });
  }
}