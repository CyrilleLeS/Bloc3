import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Service Amadeus (Frontend)
// Ce service fait le lien avec notre backend, qui lui-même parle à l'API Amadeus.
// Il sert à chercher des villes, des hôtels et des offres de prix.

// --------------------------------------------------------------------------
// INTERFACES (Modèles de données)
// --------------------------------------------------------------------------

// Structure d'une ville (pour l'autocomplétion)
export interface AmadeusCity {
  name: string;
  iataCode: string; // Code aéroport (ex: PAR, NYC)
  country?: string;
  address?: {
    cityName: string;
    countryName: string;
  };
  geoCode?: {
    latitude: number;
    longitude: number;
  };
}

// Structure d'un hôtel (Info générale)
export interface AmadeusHotel {
  hotelId: string;
  name: string;
  chainCode?: string;
  iataCode?: string;
  geoCode?: {
    latitude: number;
    longitude: number;
  };
  address?: {
    countryCode: string;
  };
  distance?: {
    value: number;
    unit: string;
  };
}

// Structure d'un hôtel AVEC des offres de prix
export interface AmadeusHotelOffer {
  hotelId: string;
  name: string;
  chainCode?: string;
  cityCode?: string;
  latitude?: number;
  longitude?: number;
  address?: any;
  rating?: string;
  amenities?: string[];
  media?: any[];
  offers: AmadeusOffer[];
}

// Structure d'une offre précise (Chambre + Prix)
export interface AmadeusOffer {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  roomType?: string;
  roomDescription?: string;
  beds?: number;
  bedType?: string;
  guests?: number;
  price: {
    currency: string;
    total: string;
    base?: string;
  };
  policies?: {
    cancellation?: any;
    paymentType?: string;
  };
}

// --------------------------------------------------------------------------
// SERVICE
// --------------------------------------------------------------------------

@Injectable({
  providedIn: 'root'
})
export class AmadeusService {
  private apiUrl = `${environment.apiUrl}/amadeus`;

  constructor(private http: HttpClient) {}

  // 1. Recherche de villes (Autocomplete)
  // Utile pour la barre de recherche "Où allez-vous ?"
  searchCities(keyword: string): Observable<{ success: boolean; count: number; cities: AmadeusCity[] }> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<any>(`${this.apiUrl}/locations/cities`, { params });
  }

  // 2. Villes populaires
  // Pour afficher des suggestions sur la page d'accueil
  getPopularCities(): Observable<{ success: boolean; cities: AmadeusCity[] }> {
    return this.http.get<any>(`${this.apiUrl}/locations/popular`);
  }

  // 3. Recherche d'hôtels par code ville
  // Trouve tous les hôtels dans une zone, sans forcément avoir les prix
  searchHotelsByCity(cityCode: string, options?: {
    radius?: number;
    radiusUnit?: string;
    ratings?: string;
    amenities?: string;
  }): Observable<{ success: boolean; count: number; hotels: AmadeusHotel[] }> {
    let params = new HttpParams().set('cityCode', cityCode);
    
    if (options) {
      if (options.radius) params = params.set('radius', options.radius.toString());
      if (options.radiusUnit) params = params.set('radiusUnit', options.radiusUnit);
      if (options.ratings) params = params.set('ratings', options.ratings);
      if (options.amenities) params = params.set('amenities', options.amenities);
    }

    return this.http.get<any>(`${this.apiUrl}/hotels/by-city`, { params });
  }

  // 4. Recherche d'hôtels par coordonnées GPS
  searchHotelsByGeocode(latitude: number, longitude: number, radius?: number): Observable<{ success: boolean; count: number; hotels: AmadeusHotel[] }> {
    let params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString());
    
    if (radius) params = params.set('radius', radius.toString());

    return this.http.get<any>(`${this.apiUrl}/hotels/by-geocode`, { params });
  }

  // 5. Recherche d'offres (Prix & Dispo)
  // C'est l'étape la plus importante : trouver les chambres disponibles et leurs prix
  searchHotelOffers(options: {
    hotelIds: string;
    checkInDate: string;
    checkOutDate: string;
    adults?: number;
    roomQuantity?: number;
    currency?: string;
    priceRange?: string;
  }): Observable<{ success: boolean; count: number; offers: AmadeusHotelOffer[] }> {
    let params = new HttpParams()
      .set('hotelIds', options.hotelIds)
      .set('checkInDate', options.checkInDate)
      .set('checkOutDate', options.checkOutDate);
    
    // Paramètres optionnels
    if (options.adults) params = params.set('adults', options.adults.toString());
    if (options.roomQuantity) params = params.set('roomQuantity', options.roomQuantity.toString());
    if (options.currency) params = params.set('currency', options.currency);
    if (options.priceRange) params = params.set('priceRange', options.priceRange);

    return this.http.get<any>(`${this.apiUrl}/hotels/offers`, { params });
  }

  // 6. Détail d'une offre spécifique
  getHotelOffer(offerId: string): Observable<{ success: boolean; offer: any }> {
    return this.http.get<any>(`${this.apiUrl}/hotels/offer/${offerId}`);
  }
}
