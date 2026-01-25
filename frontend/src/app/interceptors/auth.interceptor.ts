import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Intercepteur HTTP d'Authentification
// Ce service s'intercale dans TOUTES les requêtes HTTP sortantes.
// Son but : Ajouter automatiquement le token JWT dans les headers.

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // 1. On récupère le token stocké localement
    const token = this.authService.getToken();

    // 2. Si un token existe, on l'ajoute à la requête
    if (token) {
      // On clone la requête car elles sont immuables par défaut
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}` // Standard OAuth2 "Bearer <token>"
        }
      });
    }

    // 3. On laisse passer la requête et on surveille la réponse
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Gestion globale des erreurs
        
        // Si le serveur répond "401 Unauthorized" (Token invalide ou expiré)
        if (error.status === 401) {
          // On déconnecte proprement l'utilisateur
          this.authService.logout();
          // On le renvoie vers la page de connexion
          this.router.navigate(['/auth/login']);
        }
        
        // On propage l'erreur pour que le composant puisse l'afficher si besoin
        return throwError(() => error);
      })
    );
  }
}
