import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-media-detai',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './media-detai.html'
})
export class MediaDetai implements OnInit {

  media: any;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.api.getMediaById(id).subscribe((data) => {
      this.media = data;
    });
  }
}
