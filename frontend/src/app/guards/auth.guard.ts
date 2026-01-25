import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Garde d'Authentification (AuthGuard)
// Ce service agit comme un vigile à l'entrée des routes protégées.
// Il vérifie si l'utilisateur est connecté avant de le laisser passer.

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Méthode appelée automatiquement par le routeur Angular
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    
    // Si l'utilisateur est connecté, on ouvre la barrière (return true)
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // Sinon, on le redirige vers la page de connexion
    // On passe l'URL actuelle en paramètre "returnUrl" pour pouvoir le ramener ici après sa connexion
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    
    // Et on bloque l'accès à la route demandée
    return false;
  }
}
