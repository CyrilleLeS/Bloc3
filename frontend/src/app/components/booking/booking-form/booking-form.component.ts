import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HotelService } from '../../../services/hotel.service';
import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';
import { Room, Hotel, User } from '../../../models';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.scss'
})
export class BookingFormComponent implements OnInit {
  bookingForm: FormGroup;
  room: Room | null = null;
  hotel: Hotel | null = null;
  currentUser: User | null = null;
  
  loading = true;
  submitting = false;
  checkingAvailability = false;
  error = '';
  availabilityMessage = '';
  isAvailable = false;
  
  numberOfNights = 0;
  totalPrice = 0;
  
  minDate: string;
  maxDate: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private hotelService: HotelService,
    private bookingService: BookingService,
    private authService: AuthService
  ) {
    // Dates min et max
    const today = new Date();
    this.minDate = this.formatDate(today);
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    this.maxDate = this.formatDate(maxDate);

    // Formulaire
    this.bookingForm = this.fb.group({
      checkInDate: ['', Validators.required],
      checkOutDate: ['', Validators.required],
      adults: [1, [Validators.required, Validators.min(1)]],
      children: [0, [Validators.min(0)]],
      specialRequests: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    const roomId = this.route.snapshot.paramMap.get('roomId');
    
    if (roomId) {
      this.loadRoom(roomId);
    } else {
      this.error = 'Chambre non spécifiée';
      this.loading = false;
    }

    // Écouter les changements de dates
    this.bookingForm.get('checkInDate')?.valueChanges.subscribe(() => this.onDatesChange());
    this.bookingForm.get('checkOutDate')?.valueChanges.subscribe(() => this.onDatesChange());
  }

  loadRoom(roomId: string): void {
    this.hotelService.getRoom(roomId).subscribe({
      next: (res) => {
        this.room = res.room;
        if (typeof res.room.hotel === 'object') {
          this.hotel = res.room.hotel as Hotel;
        }
        this.loading = false;

        // Mettre à jour les validateurs de capacité
        this.bookingForm.get('adults')?.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(this.room.capacity.adults)
        ]);
        this.bookingForm.get('children')?.setValidators([
          Validators.min(0),
          Validators.max(this.room.capacity.children)
        ]);
      },
      error: () => {
        this.error = 'Chambre non trouvée';
        this.loading = false;
      }
    });
  }

  onDatesChange(): void {
    const checkIn = this.bookingForm.get('checkInDate')?.value;
    const checkOut = this.bookingForm.get('checkOutDate')?.value;

    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (checkOutDate > checkInDate) {
        const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
        this.numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        this.totalPrice = this.numberOfNights * (this.room?.price || 0);
        this.checkAvailability();
      } else {
        this.numberOfNights = 0;
        this.totalPrice = 0;
        this.isAvailable = false;
        this.availabilityMessage = '';
      }
    }
  }

  checkAvailability(): void {
    if (!this.room) return;

    const checkIn = this.bookingForm.get('checkInDate')?.value;
    const checkOut = this.bookingForm.get('checkOutDate')?.value;

    this.checkingAvailability = true;
    this.availabilityMessage = '';

    this.bookingService.checkAvailability(this.room._id, checkIn, checkOut).subscribe({
      next: (res) => {
        this.isAvailable = res.available;
        this.availabilityMessage = res.available
          ? '✅ Chambre disponible pour ces dates'
          : '❌ Chambre non disponible pour ces dates';
        this.checkingAvailability = false;
      },
      error: () => {
        this.availabilityMessage = '⚠️ Impossible de vérifier la disponibilité';
        this.checkingAvailability = false;
      }
    });
  }

  onSubmit(): void {
    if (this.bookingForm.invalid || !this.isAvailable || !this.room) {
      return;
    }

    this.submitting = true;
    this.error = '';

    const bookingData = {
      room: this.room._id,
      checkInDate: this.bookingForm.get('checkInDate')?.value,
      checkOutDate: this.bookingForm.get('checkOutDate')?.value,
      numberOfGuests: {
        adults: this.bookingForm.get('adults')?.value,
        children: this.bookingForm.get('children')?.value
      },
      specialRequests: this.bookingForm.get('specialRequests')?.value
    };

    this.bookingService.createBooking(bookingData).subscribe({
      next: (res) => {
        this.submitting = false;
        // Rediriger vers la page de détail pour le paiement
        this.router.navigate(['/bookings', res.booking._id]);
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.error?.message || 'Erreur lors de la réservation';
      }
    });
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getRoomImage(): string {
    return this.room?.images && this.room.images.length > 0
      ? this.room.images[0]
      : 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800';
  }

  get f() {
    return this.bookingForm.controls;
  }
}