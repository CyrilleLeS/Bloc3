import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { HotelService } from '../../../services/hotel.service';
import { User, Hotel, DashboardStats } from '../../../models';

// Tableau de Bord Administrateur
// Vue d'ensemble complète du système (Super-Admin)
// Permet de gérer les utilisateurs, les hôtels et de voir les stats globales.

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats | null = null; // Stats globales (KPIs)
  users: User[] = [];   // Liste des utilisateurs
  hotels: Hotel[] = []; // Liste des hôtels
  
  loading = true;
  activeTab = 'overview'; // Onglet actif (Vue d'ensemble / Utilisateurs / Hôtels)
  
  // Filtres pour la liste des utilisateurs
  userRoleFilter = '';
  userSearchTerm = '';

  constructor(
    private userService: UserService,
    private hotelService: HotelService
  ) {}

  ngOnInit(): void {
    // Chargement parallèle des données
    this.loadDashboardStats();
    this.loadUsers();
    this.loadHotels();
  }

  // Charge les KPIs (Total utilisateurs, Revenus, etc.)
  loadDashboardStats(): void {
    this.userService.getDashboardStats().subscribe({
      next: (res) => {
        this.stats = res.stats;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // Charge la liste des utilisateurs avec filtres
  loadUsers(): void {
    const filters: any = { limit: 20 }; // On limite à 20 pour éviter de surcharger la page
    if (this.userRoleFilter) filters.role = this.userRoleFilter;
    if (this.userSearchTerm) filters.search = this.userSearchTerm;

    this.userService.getUsers(filters).subscribe({
      next: (res) => {
        this.users = res.users;
      }
    });
  }

  // Charge la liste des hôtels
  loadHotels(): void {
    this.hotelService.getHotels({ limit: 20 }).subscribe({
      next: (res) => {
        this.hotels = res.hotels;
      }
    });
  }

  // Appelé quand on change les filtres utilisateurs
  onUserFilterChange(): void {
    this.loadUsers();
  }

  // Changer le rôle d'un utilisateur (ex: promouvoir un Client en Hôtelier)
  updateUserRole(user: User, newRole: string): void {
    this.userService.updateUser(user._id, { role: newRole } as any).subscribe({
      next: (res) => {
        user.role = newRole as 'client' | 'hotelier' | 'admin';
      }
    });
  }

  // Activer/Désactiver un compte utilisateur (Ban)
  toggleUserStatus(user: User): void {
    this.userService.updateUser(user._id, { isActive: !user.isActive } as any).subscribe({
      next: (res) => {
        user.isActive = !user.isActive;
      }
    });
  }

  // Supprimer définitivement un utilisateur
  deleteUser(user: User): void {
    if (!confirm(`Supprimer l'utilisateur ${user.firstName} ${user.lastName} ?`)) {
      return;
    }

    this.userService.deleteUser(user._id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u._id !== user._id);
      }
    });
  }

  // Supprimer un hôtel (Administration)
  deleteHotel(hotel: Hotel): void {
    if (!confirm(`Supprimer l'hôtel "${hotel.name}" ?`)) {
      return;
    }

    this.hotelService.deleteHotel(hotel._id).subscribe({
      next: () => {
        this.hotels = this.hotels.filter(h => h._id !== hotel._id);
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  // Labels pour l'affichage des rôles
  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      client: 'Client',
      hotelier: 'Hôtelier',
      admin: 'Admin'
    };
    return labels[role] || role;
  }

  // Couleurs des badges de rôle
  getRoleClass(role: string): string {
    const classes: { [key: string]: string } = {
      client: 'badge-info',    // Bleu
      hotelier: 'badge-warning', // Jaune
      admin: 'badge-danger'    // Rouge
    };
    return classes[role] || 'badge-secondary';
  }
}
