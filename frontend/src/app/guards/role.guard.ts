import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Garde des Rôles (RoleGuard)
// Vérifie si l'utilisateur a le droit d'accéder à une page spécifique
// selon son rôle (Client, Hôtelier, Admin).

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // 1. D'abord, on vérifie si l'utilisateur est connecté
    if (!this.authService.isAuthenticated()) {
      // Si non, direction la page de connexion
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    // 2. On regarde quels rôles sont autorisés pour cette page
    // (Défini dans app.routes.ts via la propriété 'data')
    const requiredRoles = route.data['roles'] as string[];
    
    // Si aucun rôle n'est spécifié, c'est ouvert à tous les connectés
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 3. On vérifie si l'utilisateur a l'un des rôles requis
    if (this.authService.hasRole(requiredRoles)) {
      return true; // Accès autorisé !
    }

    // 4. Si connecté mais mauvais rôle -> Redirection accueil
    this.router.navigate(['/']);
    return false;
  }
}
