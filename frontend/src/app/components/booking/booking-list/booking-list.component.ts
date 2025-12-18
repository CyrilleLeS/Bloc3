import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../../services/booking.service';
import { Booking, Hotel, Room } from '../../../models';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.scss'
})
export class BookingListComponent implements OnInit {
  bookings: Booking[] = [];
  loading = true;
  error = '';

  // Filtres
  selectedStatus = '';
  statuses = [
    { value: '', label: 'Tous les statuts' },
    { value: 'pending', label: 'En attente' },
    { value: 'confirmed', label: 'Confirmée' },
    { value: 'cancelled', label: 'Annulée' },
    { value: 'completed', label: 'Terminée' }
  ];

  // Pagination
  currentPage = 1;
  totalPages = 1;
  total = 0;

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading = true;
    this.error = '';

    const filters: any = {
      page: this.currentPage,
      limit: 10
    };

    if (this.selectedStatus) {
      filters.status = this.selectedStatus;
    }

    this.bookingService.getMyBookings(filters).subscribe({
      next: (res) => {
        this.bookings = res.bookings;
        this.total = res.total || 0;
        this.totalPages = res.totalPages || 1;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des réservations';
        this.loading = false;
      }
    });
  }

  onStatusChange(): void {
    this.currentPage = 1;
    this.loadBookings();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadBookings();
    }
  }

  getHotelName(booking: Booking): string {
    if (typeof booking.hotel === 'object') {
      return (booking.hotel as Hotel).name;
    }
    return 'Hôtel';
  }

  getRoomName(booking: Booking): string {
    if (typeof booking.room === 'object') {
      return (booking.room as Room).name;
    }
    return 'Chambre';
  }

  getHotelImage(booking: Booking): string {
    if (typeof booking.hotel === 'object') {
      const hotel = booking.hotel as Hotel;
      return hotel.images && hotel.images.length > 0
        ? hotel.images[0]
        : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400';
    }
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400';
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

  getPaymentStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'Non payé',
      paid: 'Payé',
      refunded: 'Remboursé',
      failed: 'Échoué'
    };
    return labels[status] || status;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getPages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}