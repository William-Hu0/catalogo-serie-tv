import { Component, OnInit } from '@angular/core';
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

  constructor(private route: ActivatedRoute, private apiService: ApiService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.apiService.getAttoreDettaglio(id).subscribe({
      next: (dati) => this.attore = dati,
      error: (errore) => console.error(errore)
    });
  }
}