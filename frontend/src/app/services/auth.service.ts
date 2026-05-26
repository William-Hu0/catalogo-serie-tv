import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private storageKey = 'catalogo-current-user';
  private currentUserSubject = new BehaviorSubject<any>(this.loadCurrentUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private apiService: ApiService) {}

  private loadCurrentUser(): any {
    const saved = localStorage.getItem(this.storageKey);
    return saved ? JSON.parse(saved) : null;
  }

  get currentUser(): any {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  login(username: string, password: string): Observable<any> {
    return this.apiService.login({ username, password }).pipe(
      tap((user) => {
        localStorage.setItem(this.storageKey, JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.currentUserSubject.next(null);
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.apiService.registerUser({ username, email, password });
  }
}
