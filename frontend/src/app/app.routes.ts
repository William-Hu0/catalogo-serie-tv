import { Routes } from '@angular/router';
import { MediaListComponent } from './components/media-list/media-list';
import { MediaDetail } from './components/media-detail/media-detail'; // <-- Sistemato senza la 'l' finale per allinearsi al tuo file 'media-detai.ts'
import { AttoreList } from './components/attore-list/attore-list';
import { AttoreDetail } from './components/attore-detail/attore-detail';
import { RegistaList } from './components/regista-list/regista-list';
import { RegistaDetail } from './components/regista-detail/regista-detail';
import { LoginComponent } from './components/login/login';
import { PiattaformaDetail } from './piattaforma-detail/piattaforma-detail'; // <-- Importa il componente PiattaformaDetail
export const routes: Routes = [
  { path: '', redirectTo: 'media', pathMatch: 'full' },
  { path: 'media', component: MediaListComponent },
  { path: 'media/:id', component: MediaDetail },
  { path: 'attori', component: AttoreList },
  { path: 'attori/:id', component: AttoreDetail },
  { path: 'registi', component: RegistaList },
  { path: 'registi/:id', component: RegistaDetail },
  { path: 'login', component: LoginComponent },
  { path: 'piattaforme/:id', component: PiattaformaDetail },
  { path: '**', redirectTo: 'media' }
];