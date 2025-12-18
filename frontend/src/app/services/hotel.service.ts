import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Hotel, HotelsResponse, Room, RoomsResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  private apiUrl = `${environment.apiUrl}/hotels`;
  private roomsUrl = `${environment.apiUrl}/rooms`;

  constructor(private http: HttpClient) {}

  // Hotels
  getHotels(filters?: {
    city?: string;
    stars?: number;
    amenities?: string;
    page?: number;
    limit?: number;
  }): Observable<HotelsResponse> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<HotelsResponse>(this.apiUrl, { params });
  }

  getHotel(id: string): Observable<{ success: boolean; hotel: Hotel }> {
    return this.http.get<{ success: boolean; hotel: Hotel }>(`${this.apiUrl}/${id}`);
  }

  getMyHotels(): Observable<{ success: boolean; count: number; hotels: Hotel[] }> {
    return this.http.get<{ success: boolean; count: number; hotels: Hotel[] }>(`${this.apiUrl}/user/my-hotels`);
  }

  createHotel(hotel: Partial<Hotel>): Observable<{ success: boolean; message: string; hotel: Hotel }> {
    return this.http.post<{ success: boolean; message: string; hotel: Hotel }>(this.apiUrl, hotel);
  }

  updateHotel(id: string, hotel: Partial<Hotel>): Observable<{ success: boolean; message: string; hotel: Hotel }> {
    return this.http.put<{ success: boolean; message: string; hotel: Hotel }>(`${this.apiUrl}/${id}`, hotel);
  }

  deleteHotel(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  // Rooms
  getRoomsByHotel(hotelId: string, filters?: {
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    capacity?: number;
  }): Observable<RoomsResponse> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<RoomsResponse>(`${this.roomsUrl}/hotel/${hotelId}`, { params });
  }

  getRoom(id: string): Observable<{ success: boolean; room: Room }> {
    return this.http.get<{ success: boolean; room: Room }>(`${this.roomsUrl}/${id}`);
  }

  createRoom(room: Partial<Room>): Observable<{ success: boolean; message: string; room: Room }> {
    return this.http.post<{ success: boolean; message: string; room: Room }>(this.roomsUrl, room);
  }

  updateRoom(id: string, room: Partial<Room>): Observable<{ success: boolean; message: string; room: Room }> {
    return this.http.put<{ success: boolean; message: string; room: Room }>(`${this.roomsUrl}/${id}`, room);
  }

  deleteRoom(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.roomsUrl}/${id}`);
  }
}