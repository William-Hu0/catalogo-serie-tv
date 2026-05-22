import { Routes } from '@angular/router';
import { MediaListComponent } from './components/media-list/media-list';
import { MediaDetailComponent } from './components/media-detail/media-detail';

export const routes: Routes = [
  { path: '', component: MediaListComponent },
  { path: 'media/:id', component: MediaDetailComponent }
];