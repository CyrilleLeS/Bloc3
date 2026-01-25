import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Booking, BookingsResponse } from '../models';

// Service de Réservation (Booking)
// Gère tout ce qui est lié à la prise de rendez-vous :
// - Vérifier si une chambre est libre
// - Créer la réservation
// - Gérer le paiement
// - Annuler ou modifier une réservation

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;
  private paymentsUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  // --------------------------------------------------------------------------
  // DISPONIBILITÉ & CRÉATION
  // --------------------------------------------------------------------------

  // Demande au serveur si une chambre est libre pour les dates données
  checkAvailability(roomId: string, checkIn: string, checkOut: string): Observable<{
    success: boolean;
    available: boolean;
    roomId: string;
    checkIn: string;
    checkOut: string;
  }> {
    // On passe les infos dans l'URL (paramètres GET)
    const params = new HttpParams()
      .set('roomId', roomId)
      .set('checkIn', checkIn)
      .set('checkOut', checkOut);
    
    return this.http.get<any>(`${this.apiUrl}/check-availability`, { params });
  }

  // Envoie la demande de réservation définitive au serveur
  createBooking(booking: {
    room: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: { adults: number; children: number };
    specialRequests?: string;
  }): Observable<{ success: boolean; message: string; booking: Booking }> {
    return this.http.post<{ success: boolean; message: string; booking: Booking }>(this.apiUrl, booking);
  }

  // --------------------------------------------------------------------------
  // LECTURE
  // --------------------------------------------------------------------------

  // Récupère la liste de MES réservations (pour le client)
  getMyBookings(filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Observable<BookingsResponse> {
    let params = new HttpParams();
    // Ajout des filtres si nécessaire (ex: voir seulement les annulées)
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<BookingsResponse>(`${this.apiUrl}/my-bookings`, { params });
  }

  // Récupère les réservations reçues pour un hôtel (pour l'hôtelier)
  getHotelBookings(hotelId: string, filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Observable<BookingsResponse> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<BookingsResponse>(`${this.apiUrl}/hotel/${hotelId}`, { params });
  }

  // Récupère le détail d'une seule réservation
  getBooking(id: string): Observable<{ success: boolean; booking: Booking }> {
    return this.http.get<{ success: boolean; booking: Booking }>(`${this.apiUrl}/${id}`);
  }

  // --------------------------------------------------------------------------
  // ACTIONS
  // --------------------------------------------------------------------------

  // Annuler une réservation avec un motif
  cancelBooking(id: string, reason?: string): Observable<{ success: boolean; message: string; booking: Booking }> {
    return this.http.put<{ success: boolean; message: string; booking: Booking }>(
      `${this.apiUrl}/${id}/cancel`,
      { reason }
    );
  }

  // Changer le statut (ex: valider manuellement) - Pour Hôtelier/Admin
  updateBookingStatus(id: string, status: string): Observable<{ success: boolean; message: string; booking: Booking }> {
    return this.http.put<{ success: boolean; message: string; booking: Booking }>(
      `${this.apiUrl}/${id}/status`,
      { status }
    );
  }

  // --------------------------------------------------------------------------
  // PAIEMENTS
  // --------------------------------------------------------------------------

  // Simule un paiement (pour tester sans carte bancaire)
  simulatePayment(bookingId: string): Observable<{
    success: boolean;
    message: string;
    booking: Booking;
  }> {
    return this.http.post<any>(`${this.paymentsUrl}/simulate`, { bookingId });
  }

  // Initialise un vrai paiement Stripe
  createPaymentIntent(bookingId: string): Observable<{
    success: boolean;
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
  }> {
    return this.http.post<any>(`${this.paymentsUrl}/create-payment-intent`, { bookingId });
  }

  // Demande un remboursement
  requestRefund(bookingId: string, reason?: string): Observable<{
    success: boolean;
    message: string;
    booking: Booking;
  }> {
    return this.http.post<any>(`${this.paymentsUrl}/refund`, { bookingId, reason });
  }
}
