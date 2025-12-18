import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { HotelService } from '../../../services/hotel.service';
import { BookingService } from '../../../services/booking.service';
import { User, Hotel, Booking } from '../../../models';

@Component({
  selector: 'app-hotelier-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './hotelier-dashboard.component.html',
  styleUrl: './hotelier-dashboard.component.scss'
})
export class HotelierDashboardComponent implements OnInit {
  currentUser: User | null = null;
  hotels: Hotel[] = [];
  recentBookings: Booking[] = [];
  selectedHotelId: string = '';
  loading = true;
  bookingsLoading = false;

  stats = {
    totalHotels: 0,
    totalRooms: 0,
    totalBookings: 0,
    pendingBookings: 0,
    revenue: 0
  };

  constructor(
    private authService: AuthService,
    private hotelService: HotelService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadHotels();
  }

  loadHotels(): void {
    this.hotelService.getMyHotels().subscribe({
      next: (res) => {
        this.hotels = res.hotels;
        this.stats.totalHotels = res.count;
        
        if (this.hotels.length > 0) {
          this.selectedHotelId = this.hotels[0]._id;
          this.loadHotelBookings(this.selectedHotelId);
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadHotelBookings(hotelId: string): void {
    this.bookingsLoading = true;
    this.bookingService.getHotelBookings(hotelId, { limit: 10 }).subscribe({
      next: (res) => {
        this.recentBookings = res.bookings;
        this.stats.totalBookings = res.total || 0;
        this.stats.pendingBookings = res.bookings.filter(b => b.status === 'pending').length;
        this.stats.revenue = res.bookings
          .filter(b => b.paymentStatus === 'paid')
          .reduce((sum, b) => sum + b.totalPrice, 0);
        
        this.loading = false;
        this.bookingsLoading = false;
      },
      error: () => {
        this.loading = false;
        this.bookingsLoading = false;
      }
    });
  }

  onHotelChange(hotelId: string): void {
    this.selectedHotelId = hotelId;
    this.loadHotelBookings(hotelId);
  }

  confirmBooking(booking: Booking): void {
    this.bookingService.updateBookingStatus(booking._id, 'confirmed').subscribe({
      next: () => {
        booking.status = 'confirmed';
      }
    });
  }

  getGuestName(booking: Booking): string {
    return `${booking.guestInfo.firstName} ${booking.guestInfo.lastName}`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
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

  deleteHotel(hotel: Hotel): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${hotel.name}" ?`)) {
      return;
    }

    this.hotelService.deleteHotel(hotel._id).subscribe({
      next: () => {
        this.hotels = this.hotels.filter(h => h._id !== hotel._id);
        this.stats.totalHotels--;
        
        if (this.selectedHotelId === hotel._id && this.hotels.length > 0) {
          this.selectedHotelId = this.hotels[0]._id;
          this.loadHotelBookings(this.selectedHotelId);
        }
      }
    });
  }
}