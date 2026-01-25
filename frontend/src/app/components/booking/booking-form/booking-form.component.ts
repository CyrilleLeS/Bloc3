import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HotelService } from '../../../services/hotel.service';
import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';
import { Room, Hotel, User } from '../../../models';

// Composant Formulaire de Réservation
// C'est ici que l'utilisateur choisit ses dates et valide sa demande

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
  
  // États de l'interface
  loading = true;             // Chargement initial des infos de la chambre
  submitting = false;         // Envoi du formulaire en cours
  checkingAvailability = false; // Vérification des dates en cours
  
  error = '';
  availabilityMessage = '';   // Message "Dispo" ou "Pas dispo"
  isAvailable = false;        // Résultat de la vérif de dispo
  
  // Calculs automatiques
  numberOfNights = 0;
  totalPrice = 0;
  
  // Contraintes de dates pour le calendrier HTML
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
    // 1. Configuration des dates limites
    const today = new Date();
    this.minDate = this.formatDate(today); // Pas de résa dans le passé !
    
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1); // Max 1 an à l'avance
    this.maxDate = this.formatDate(maxDate);

    // 2. Création du formulaire
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
    // On récupère l'ID de la chambre depuis l'URL
    const roomId = this.route.snapshot.paramMap.get('roomId');
    
    if (roomId) {
      this.loadRoom(roomId);
    } else {
      this.error = 'Chambre non spécifiée';
      this.loading = false;
    }

    // On surveille les changements de dates pour recalculer le prix en temps réel
    this.bookingForm.get('checkInDate')?.valueChanges.subscribe(() => this.onDatesChange());
    this.bookingForm.get('checkOutDate')?.valueChanges.subscribe(() => this.onDatesChange());
  }

  // Charge les infos de la chambre à réserver
  loadRoom(roomId: string): void {
    this.hotelService.getRoom(roomId).subscribe({
      next: (res) => {
        this.room = res.room;
        if (typeof res.room.hotel === 'object') {
          this.hotel = res.room.hotel as Hotel;
        }
        this.loading = false;

        // On adapte le formulaire à la capacité de la chambre (ex: max 2 adultes)
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

  // Appelé à chaque changement de date
  onDatesChange(): void {
    const checkIn = this.bookingForm.get('checkInDate')?.value;
    const checkOut = this.bookingForm.get('checkOutDate')?.value;

    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      // Si les dates sont logiques (Départ après Arrivée)
      if (checkOutDate > checkInDate) {
        // Calcul du nombre de nuits
        const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
        this.numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Calcul du prix total
        this.totalPrice = this.numberOfNights * (this.room?.price || 0);
        
        // Vérification immédiate de la dispo
        this.checkAvailability();
      } else {
        // Dates invalides
        this.numberOfNights = 0;
        this.totalPrice = 0;
        this.isAvailable = false;
        this.availabilityMessage = '';
      }
    }
  }

  // Vérifie auprès du serveur si c'est libre
  checkAvailability(): void {
    if (!this.room) return;

    const checkIn = this.bookingForm.get('checkInDate')?.value;
    const checkOut = this.bookingForm.get('checkOutDate')?.value;

    this.checkingAvailability = true;
    this.availabilityMessage = '';

    this.bookingService.checkAvailability(this.room._id, checkIn, checkOut).subscribe({
      next: (res) => {
        this.isAvailable = res.available;
        // Feedback visuel pour l'utilisateur
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

  // Validation finale et envoi
  onSubmit(): void {
    if (this.bookingForm.invalid || !this.isAvailable || !this.room) {
      return;
    }

    this.submitting = true;
    this.error = '';

    // Préparation des données pour l'API
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
        // Succès ! On redirige vers le détail de la résa (pour payer par exemple)
        this.router.navigate(['/bookings', res.booking._id]);
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.error?.message || 'Erreur lors de la réservation';
      }
    });
  }

  // Utilitaire pour formater la date au format HTML (YYYY-MM-DD)
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
