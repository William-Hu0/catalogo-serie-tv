import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  mode: 'login' | 'register' = 'login';
  form: any = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  messaggioSuccess = '';
  messaggioError = '';
  staCaricando = false;

  constructor(private authService: AuthService, private router: Router) {}

  switchMode(mode: 'login' | 'register'): void {
    this.mode = mode;
    this.messaggioSuccess = '';
    this.messaggioError = '';
  }

  submit(): void {
    this.messaggioSuccess = '';
    this.messaggioError = '';

    if (this.mode === 'login') {
      this.login();
    } else {
      this.register();
    }
  }

  private login(): void {
    if (!this.form.username || !this.form.password) {
      this.messaggioError = 'Inserisci username e password.';
      return;
    }

    this.staCaricando = true;
    this.authService.login(this.form.username.trim(), this.form.password).subscribe({
      next: () => {
        this.messaggioSuccess = 'Accesso effettuato con successo!';
        this.staCaricando = false;
        this.router.navigate(['/media']);
      },
      error: (err) => {
        console.error('Errore login:', err);
        this.messaggioError = 'Credenziali non valide. Riprova.';
        this.staCaricando = false;
      }
    });
  }

  private register(): void {
    if (!this.form.username || !this.form.email || !this.form.password || !this.form.confirmPassword) {
      this.messaggioError = 'Compila tutti i campi del modulo di registrazione.';
      return;
    }

    if (this.form.password !== this.form.confirmPassword) {
      this.messaggioError = 'Le password non coincidono.';
      return;
    }

    this.staCaricando = true;
    this.authService.register(this.form.username.trim(), this.form.email.trim(), this.form.password).subscribe({
      next: () => {
        this.messaggioSuccess = 'Registrazione completata! Ora effettua il login.';
        this.mode = 'login';
        this.form.password = '';
        this.form.confirmPassword = '';
        this.staCaricando = false;
      },
      error: (err) => {
        console.error('Errore registrazione:', err);
        this.messaggioError = 'Errore durante la registrazione. Riprova con un altro username o email.';
        this.staCaricando = false;
      }
    });
  }
}
