import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Hotel, HotelsResponse, Room, RoomsResponse } from '../models';

// Service pour gérer les communications avec l'API concernant les hôtels
// Permet de récupérer, créer, modifier et supprimer des hôtels et des chambres
@Injectable({
  providedIn: 'root'
})
export class HotelService {
  // URLs de base pour les requêtes API
  private apiUrl = `${environment.apiUrl}/hotels`;
  private roomsUrl = `${environment.apiUrl}/rooms`;

  constructor(private http: HttpClient) {}

  // --------------------------------------------------------------------------
  // HÔTELS
  // --------------------------------------------------------------------------

  // Récupère la liste des hôtels avec des filtres optionnels
  // Filtres possibles : ville, étoiles, équipements, pagination (page, limite)
  getHotels(filters?: {
    city?: string;
    stars?: number;
    amenities?: string;
    page?: number;
    limit?: number;
  }): Observable<HotelsResponse> {
    let params = new HttpParams();
    
    // Si des filtres sont fournis, on les ajoute aux paramètres de l'URL
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    // Envoie une requête GET à /api/hotels
    return this.http.get<HotelsResponse>(this.apiUrl, { params });
  }

  // Récupère les détails d'un hôtel spécifique grâce à son ID
  getHotel(id: string): Observable<{ success: boolean; hotel: Hotel }> {
    return this.http.get<{ success: boolean; hotel: Hotel }>(`${this.apiUrl}/${id}`);
  }

  // Récupère uniquement les hôtels appartenant à l'utilisateur connecté (pour les hôteliers)
  getMyHotels(): Observable<{ success: boolean; count: number; hotels: Hotel[] }> {
    return this.http.get<{ success: boolean; count: number; hotels: Hotel[] }>(`${this.apiUrl}/user/my-hotels`);
  }

  // Crée un nouvel hôtel (nécessite d'être connecté en tant qu'hôtelier ou admin)
  createHotel(hotel: Partial<Hotel>): Observable<{ success: boolean; message: string; hotel: Hotel }> {
    return this.http.post<{ success: boolean; message: string; hotel: Hotel }>(this.apiUrl, hotel);
  }

  // Met à jour les informations d'un hôtel existant
  updateHotel(id: string, hotel: Partial<Hotel>): Observable<{ success: boolean; message: string; hotel: Hotel }> {
    return this.http.put<{ success: boolean; message: string; hotel: Hotel }>(`${this.apiUrl}/${id}`, hotel);
  }

  // Supprime un hôtel
  deleteHotel(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  // --------------------------------------------------------------------------
  // CHAMBRES (ROOMS)
  // --------------------------------------------------------------------------

  // Récupère toutes les chambres associées à un hôtel spécifique
  // Accepte aussi des filtres comme le prix ou la capacité
  getRoomsByHotel(hotelId: string, filters?: {
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    capacity?: number;
  }): Observable<RoomsResponse> {
    let params = new HttpParams();
    
    // Ajout des filtres aux paramètres s'ils existent
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<RoomsResponse>(`${this.roomsUrl}/hotel/${hotelId}`, { params });
  }

  // Récupère les détails d'une chambre spécifique
  getRoom(id: string): Observable<{ success: boolean; room: Room }> {
    return this.http.get<{ success: boolean; room: Room }>(`${this.roomsUrl}/${id}`);
  }

  // Crée une nouvelle chambre pour un hôtel
  createRoom(room: Partial<Room>): Observable<{ success: boolean; message: string; room: Room }> {
    return this.http.post<{ success: boolean; message: string; room: Room }>(this.roomsUrl, room);
  }

  // Met à jour une chambre existante
  updateRoom(id: string, room: Partial<Room>): Observable<{ success: boolean; message: string; room: Room }> {
    return this.http.put<{ success: boolean; message: string; room: Room }>(`${this.roomsUrl}/${id}`, room);
  }

  // Supprime une chambre
  deleteRoom(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.roomsUrl}/${id}`);
  }
}
