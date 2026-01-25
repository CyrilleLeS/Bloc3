import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of, catchError } from 'rxjs'; 
import { environment } from '../../environments/environment';
import { User, AuthResponse } from '../models';
import { jwtDecode } from 'jwt-decode';

// Service d'Authentification
// C'est le gardien de l'application : il gère tout ce qui concerne la connexion, 
// l'inscription et l'identité de l'utilisateur.

// Types de données (Interfaces) pour structurer nos réponses
interface DecodedToken {
  id: string;
  role: string;
  exp: number; // Date d'expiration
}

interface UserProfileResponse {
  success: boolean;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  // BehaviorSubject est une variable spéciale qui garde en mémoire la dernière valeur.
  // Ici, on stocke l'utilisateur connecté. S'il n'y a personne, c'est null.
  // Tous les composants qui s'abonnent à "currentUser$" sauront instantanément si qqn est connecté.
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  // --------------------------------------------------------------------------
  // GESTION DU CHARGEMENT INITIAL (APP INITIALIZER)
  // --------------------------------------------------------------------------

  // Cette méthode est appelée au démarrage de l'application (dans app.config.ts ou app.module.ts)
  // Elle vérifie s'il y a un token sauvegardé et essaie de reconnecter l'utilisateur automatiquement.
  public loadUserFromToken(): Observable<UserProfileResponse | null> {
    const token = this.getToken();
    
    // Si on a un token et qu'il n'est pas périmé
    if (token && !this.isTokenExpired(token)) {
      // On demande au serveur "C'est qui ce token ?" (getProfile)
      return this.getProfile().pipe(
        tap((res) => {
          // Si le serveur répond OK, on diffuse l'utilisateur à toute l'app
          this.currentUserSubject.next(res.user);
        }),
        catchError(() => {
          // Si le serveur dit "Token invalide" (ex: compte supprimé), on nettoie tout
          this.logout();
          return of(null); // On dit à l'app "Personne n'est connecté"
        })
      );
    }
    
    // Pas de token ? Alors personne n'est connecté.
    return of(null); 
  }

  // --------------------------------------------------------------------------
  // ACTIONS UTILISATEUR (API)
  // --------------------------------------------------------------------------

  // Inscription
  register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      // "tap" permet d'exécuter une action sans modifier la réponse
      tap(res => {
        // On sauvegarde le token reçu
        this.setToken(res.token);
        // On met à jour l'utilisateur courant pour que l'interface change (ex: menu)
        this.currentUserSubject.next(res.user);
      })
    );
  }

  // Connexion
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => {
        this.setToken(res.token);
        this.currentUserSubject.next(res.user);
      })
    );
  }

  // Déconnexion
  logout(): void {
    // On efface le token du stockage local
    localStorage.removeItem('token');
    // On dit à toute l'app "Il n'y a plus d'utilisateur"
    this.currentUserSubject.next(null);
  }

  // Récupérer son propre profil (via API)
  getProfile(): Observable<{ success: boolean; user: User }> {
    return this.http.get<{ success: boolean; user: User }>(`${this.apiUrl}/profile`);
  }

  // Mettre à jour son profil
  updateProfile(data: Partial<User>): Observable<{ success: boolean; user: User }> {
    return this.http.put<{ success: boolean; user: User }>(`${this.apiUrl}/profile`, data).pipe(
      tap(res => this.currentUserSubject.next(res.user))
    );
  }

  // --------------------------------------------------------------------------
  // GESTION DU TOKEN (JWT)
  // --------------------------------------------------------------------------

  // Récupère le token stocké dans le navigateur
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Sauvegarde le token dans le navigateur
  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Vérifie si le token est périmé
  isTokenExpired(token: string): boolean {
    try {
      // On décode le token pour lire sa date d'expiration (.exp)
      const decoded = jwtDecode<DecodedToken>(token);
      // On compare avec l'heure actuelle (Date.now() est en ms, exp en secondes)
      return decoded.exp < Date.now() / 1000;
    } catch {
      // Si on n'arrive pas à lire le token, on considère qu'il est invalide
      return true;
    }
  }

  // Est-ce que l'utilisateur est connecté ?
  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  // Récupère l'objet utilisateur actuel sans observable (valeur instantanée)
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // --------------------------------------------------------------------------
  // GESTION DES RÔLES
  // --------------------------------------------------------------------------

  // Vérifie si l'utilisateur a l'un des rôles demandés
  hasRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user !== null && roles.includes(user.role);
  }

  // Raccourcis pratiques pour les composants
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
