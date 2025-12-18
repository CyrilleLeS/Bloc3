import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of, catchError } from 'rxjs'; 
import { environment } from '../../environments/environment';
import { User, AuthResponse } from '../models';
import { jwtDecode } from 'jwt-decode';

//service important de l'authentification
//plusieurs import necessaire pour garantir une sécurité d'auth.
//jwtdecode pour le check du token
//behaviorsubject --> Il stocke la dernière valeur émise à ses consommateurs, et chaque fois qu'un nouvel Observateur s'abonne, 
//il reçoit immédiatement la « valeur actuelle » du BehaviorSubject

interface DecodedToken {
  id: string;
  role: string;
  exp: number;
}

@Injectable({
  providedIn: 'root'
})

 // Gère tout le cycle de vie de l'authentification :
 // 1. État : Diffuse l'utilisateur courant à toute l'app via un Observable (BehaviorSubject).
 // 2. API : Gère le Login, Register et la mise à jour du profil.
 // 3. Sécurité : Stocke, récupère et vérifie l'expiration du token JWT (jwt-decode).
 // 4. Permissions : Fournit des méthodes pour vérifier les rôles (Admin, Hotelier, Client).
 
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
  }

public loadUserFromToken(): Observable<any> {
    const token = this.getToken();
    
    if (token && !this.isTokenExpired(token)) {
      // On retourne l'observable pour qu'Angular puisse l'attendre
      return this.getProfile().pipe(
        tap((res) => this.currentUserSubject.next(res.user)),
        catchError(() => {
          // Si le token est invalide côté serveur, on déconnecte
          this.logout();
          // On retourne 'null' pour dire "c'est fini, on peut démarrer l'app quand même"
          return of(null); 
        })
      );
    }
    
    // S'il n'y a pas de token, on retourne immédiatement un observable vide
    // pour dire à Angular de ne pas attendre pour rien.
    return of(null); 
  }

  register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(res => {
        this.setToken(res.token);
        this.currentUserSubject.next(res.user);
      })
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => {
        this.setToken(res.token);
        this.currentUserSubject.next(res.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  getProfile(): Observable<{ success: boolean; user: User }> {
    return this.http.get<{ success: boolean; user: User }>(`${this.apiUrl}/profile`);
  }

  updateProfile(data: Partial<User>): Observable<{ success: boolean; user: User }> {
    return this.http.put<{ success: boolean; user: User }>(`${this.apiUrl}/profile`, data).pipe(
      tap(res => this.currentUserSubject.next(res.user))
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp < Date.now() / 1000;
    } catch {
      return true;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user !== null && roles.includes(user.role);
  }

  isClient(): boolean {
    return this.hasRole(['client']);
  }

  isHotelier(): boolean {
    return this.hasRole(['hotelier']);
  }

  isAdmin(): boolean {
    return this.hasRole(['admin']);
  }
}