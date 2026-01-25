import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models';

// Composant Barre de Navigation (Navbar)
// Gère le menu principal, l'affichage conditionnel (Connecté / Non connecté)
// et les menus déroulants pour mobile et profil.

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null; // Utilisateur connecté (ou null)
  isMenuOpen = false;        // Menu mobile ouvert/fermé
  isProfileMenuOpen = false; // Menu profil (avatar) ouvert/fermé

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // On s'abonne aux changements d'état de l'utilisateur
    // Dès que quelqu'un se connecte/déconnecte, la navbar se met à jour
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  // Ouvre/Ferme le menu mobile (Burger)
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Ouvre/Ferme le petit menu sous l'avatar
  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  // Ferme tous les menus (utile quand on clique sur un lien)
  closeMenus(): void {
    this.isMenuOpen = false;
    this.isProfileMenuOpen = false;
  }

  // Déconnexion
  logout(): void {
    this.authService.logout();
    this.closeMenus();
    this.router.navigate(['/']); // Retour à l'accueil
  }

  // Renvoie le lien vers le bon tableau de bord selon le rôle
  getDashboardLink(): string {
    if (!this.currentUser) return '/';
    switch (this.currentUser.role) {
      case 'admin': return '/dashboard/admin';
      case 'hotelier': return '/dashboard/hotelier';
      case 'client': return '/dashboard/client';
      default: return '/';
    }
  }
}
