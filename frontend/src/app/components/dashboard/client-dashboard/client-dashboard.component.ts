import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { BookingService } from '../../../services/booking.service';
import { User, Booking, Hotel, Room } from '../../../models';

// Tableau de Bord Client
// C'est la page d'accueil personnelle du client une fois connecté.
// Il peut y voir un résumé de ses réservations et ses statistiques.

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.scss'
})
export class ClientDashboardComponent implements OnInit {
  currentUser: User | null = null; // L'utilisateur connecté
  recentBookings: Booking[] = [];  // Ses dernières réservations
  loading = true; // État de chargement des données

  // Statistiques simples pour l'affichage
  stats = {
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    totalSpent: 0
  };

  constructor(
    private authService: AuthService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    // 1. On récupère qui est connecté
    this.currentUser = this.authService.getCurrentUser();
    // 2. On charge les données du tableau de bord
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // On demande les 5 dernières réservations
    this.bookingService.getMyBookings({ limit: 5 }).subscribe({
      next: (res) => {
        this.recentBookings = res.bookings;
        this.stats.totalBookings = res.total || 0;
        
        // Calcul des statistiques côté client (pourrait aussi être fait côté serveur)
        this.stats.confirmedBookings = res.bookings.filter(b => b.status === 'confirmed').length;
        this.stats.pendingBookings = res.bookings.filter(b => b.status === 'pending').length;
        
        // Calcul du total dépensé (somme des résas payées)
        this.stats.totalSpent = res.bookings
          .filter(b => b.paymentStatus === 'paid')
          .reduce((sum, b) => sum + b.totalPrice, 0);
        
        this.loading = false;
      },
      error: () => {
        this.loading = false; // Même en cas d'erreur, on arrête le chargement
      }
    });
  }

  // Helpers pour afficher proprement les noms (gère le cas où l'objet est peuplé ou juste un ID)
  getHotelName(booking: Booking): string {
    return typeof booking.hotel === 'object' ? (booking.hotel as Hotel).name : 'Hôtel';
  }

  getRoomName(booking: Booking): string {
    return typeof booking.room === 'object' ? (booking.room as Room).name : 'Chambre';
  }

  // Formatage de la date en français
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  // Traduction des statuts pour l'affichage
  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      cancelled: 'Annulée',
      completed: 'Terminée'
    };
    return labels[status] || status;
  }

  // Classes CSS pour les badges de couleur selon le statut
  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      pending: 'badge-warning',
      confirmed: 'badge-success',
      cancelled: 'badge-danger',
      completed: 'badge-info'
    };
    return classes[status] || 'badge-secondary';
  }
}
