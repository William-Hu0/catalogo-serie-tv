import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-media-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './media-list.html'
})
export class MediaListComponent implements OnInit {

  media: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getAllMedia().subscribe((data: any) => {
      this.media = data;
    });
  }
}