import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Booking, BookingsResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;
  private paymentsUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  // Vérifier disponibilité
  checkAvailability(roomId: string, checkIn: string, checkOut: string): Observable<{
    success: boolean;
    available: boolean;
    roomId: string;
    checkIn: string;
    checkOut: string;
  }> {
    const params = new HttpParams()
      .set('roomId', roomId)
      .set('checkIn', checkIn)
      .set('checkOut', checkOut);
    return this.http.get<any>(`${this.apiUrl}/check-availability`, { params });
  }

  // Créer une réservation
  createBooking(booking: {
    room: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: { adults: number; children: number };
    specialRequests?: string;
  }): Observable<{ success: boolean; message: string; booking: Booking }> {
    return this.http.post<{ success: boolean; message: string; booking: Booking }>(this.apiUrl, booking);
  }

  // Récupérer mes réservations
  getMyBookings(filters?: {
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
    return this.http.get<BookingsResponse>(`${this.apiUrl}/my-bookings`, { params });
  }

  // Récupérer les réservations d'un hôtel (hotelier)
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

  // Récupérer une réservation
  getBooking(id: string): Observable<{ success: boolean; booking: Booking }> {
    return this.http.get<{ success: boolean; booking: Booking }>(`${this.apiUrl}/${id}`);
  }

  // Annuler une réservation
  cancelBooking(id: string, reason?: string): Observable<{ success: boolean; message: string; booking: Booking }> {
    return this.http.put<{ success: boolean; message: string; booking: Booking }>(
      `${this.apiUrl}/${id}/cancel`,
      { reason }
    );
  }

  // Mettre à jour le statut (hotelier/admin)
  updateBookingStatus(id: string, status: string): Observable<{ success: boolean; message: string; booking: Booking }> {
    return this.http.put<{ success: boolean; message: string; booking: Booking }>(
      `${this.apiUrl}/${id}/status`,
      { status }
    );
  }

  // Paiements
  simulatePayment(bookingId: string): Observable<{
    success: boolean;
    message: string;
    booking: Booking;
  }> {
    return this.http.post<any>(`${this.paymentsUrl}/simulate`, { bookingId });
  }

  createPaymentIntent(bookingId: string): Observable<{
    success: boolean;
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
  }> {
    return this.http.post<any>(`${this.paymentsUrl}/create-payment-intent`, { bookingId });
  }

  requestRefund(bookingId: string, reason?: string): Observable<{
    success: boolean;
    message: string;
    booking: Booking;
  }> {
    return this.http.post<any>(`${this.paymentsUrl}/refund`, { bookingId, reason });
  }
}