import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { BookingService } from '../../../services/booking.service';
import { User, Booking, Hotel, Room } from '../../../models';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.scss'
})
export class ClientDashboardComponent implements OnInit {
  currentUser: User | null = null;
  recentBookings: Booking[] = [];
  loading = true;

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
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.bookingService.getMyBookings({ limit: 5 }).subscribe({
      next: (res) => {
        this.recentBookings = res.bookings;
        this.stats.totalBookings = res.total || 0;
        
        // Calculer les stats
        this.stats.confirmedBookings = res.bookings.filter(b => b.status === 'confirmed').length;
        this.stats.pendingBookings = res.bookings.filter(b => b.status === 'pending').length;
        this.stats.totalSpent = res.bookings
          .filter(b => b.paymentStatus === 'paid')
          .reduce((sum, b) => sum + b.totalPrice, 0);
        
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getHotelName(booking: Booking): string {
    return typeof booking.hotel === 'object' ? (booking.hotel as Hotel).name : 'Hôtel';
  }

  getRoomName(booking: Booking): string {
    return typeof booking.room === 'object' ? (booking.room as Room).name : 'Chambre';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      cancelled: 'Annulée',
      completed: 'Terminée'
    };
    return labels[status] || status;
  }

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