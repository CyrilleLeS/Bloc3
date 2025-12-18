import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../../services/booking.service';
import { Booking, Hotel, Room } from '../../../models';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './booking-detail.component.html',
  styleUrl: './booking-detail.component.scss'
})
export class BookingDetailComponent implements OnInit {
  booking: Booking | null = null;
  loading = true;
  error = '';
  actionLoading = false;
  actionMessage = '';
  actionError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBooking(id);
    }
  }

  loadBooking(id: string): void {
    this.loading = true;
    this.bookingService.getBooking(id).subscribe({
      next: (res) => {
        this.booking = res.booking;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Réservation non trouvée';
        this.loading = false;
      }
    });
  }

  getHotel(): Hotel | null {
    if (this.booking && typeof this.booking.hotel === 'object') {
      return this.booking.hotel as Hotel;
    }
    return null;
  }

  getRoom(): Room | null {
    if (this.booking && typeof this.booking.room === 'object') {
      return this.booking.room as Room;
    }
    return null;
  }

  getHotelImage(): string {
    const hotel = this.getHotel();
    if (hotel && hotel.images && hotel.images.length > 0) {
      return hotel.images[0];
    }
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
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
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      cancelled: 'status-cancelled',
      completed: 'status-completed'
    };
    return classes[status] || '';
  }

  getPaymentStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'En attente de paiement',
      paid: 'Payé',
      refunded: 'Remboursé',
      failed: 'Échoué'
    };
    return labels[status] || status;
  }

  canPay(): boolean {
    return this.booking !== null &&
           this.booking.status !== 'cancelled' &&
           this.booking.paymentStatus === 'pending';
  }

  canCancel(): boolean {
    return this.booking !== null &&
           ['pending', 'confirmed'].includes(this.booking.status) &&
           this.booking.paymentStatus !== 'refunded';
  }

  simulatePayment(): void {
    if (!this.booking) return;

    this.actionLoading = true;
    this.actionMessage = '';
    this.actionError = '';

    this.bookingService.simulatePayment(this.booking._id).subscribe({
      next: (res) => {
        this.actionLoading = false;
        this.actionMessage = 'Paiement effectué avec succès !';
        this.loadBooking(this.booking!._id);
      },
      error: (err) => {
        this.actionLoading = false;
        this.actionError = err.error?.message || 'Erreur lors du paiement';
      }
    });
  }

  cancelBooking(): void {
    if (!this.booking) return;

    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }

    this.actionLoading = true;
    this.actionMessage = '';
    this.actionError = '';

    this.bookingService.cancelBooking(this.booking._id).subscribe({
      next: (res) => {
        this.actionLoading = false;
        this.actionMessage = 'Réservation annulée avec succès';
        this.loadBooking(this.booking!._id);
      },
      error: (err) => {
        this.actionLoading = false;
        this.actionError = err.error?.message || 'Erreur lors de l\'annulation';
      }
    });
  }

  requestRefund(): void {
    if (!this.booking) return;

    if (!confirm('Êtes-vous sûr de vouloir demander un remboursement ?')) {
      return;
    }

    this.actionLoading = true;
    this.actionMessage = '';
    this.actionError = '';

    this.bookingService.requestRefund(this.booking._id).subscribe({
      next: (res) => {
        this.actionLoading = false;
        this.actionMessage = 'Remboursement effectué avec succès';
        this.loadBooking(this.booking!._id);
      },
      error: (err) => {
        this.actionLoading = false;
        this.actionError = err.error?.message || 'Erreur lors du remboursement';
      }
    });
  }
}