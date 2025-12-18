import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

//Interface --> Utilisée pour décrire la forme des objets, elle peut être étendue par d'autres interfaces. 
//Presque tout en JavaScript est un objet, et les interfaces sont conçues pour correspondre à leur comportement à l'exécution.
//donc je déclare et définit la "forme" des objets pour l'api amadeus

export interface AmadeusCity {
  name: string;
  iataCode: string;
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

//Ici je gère la relation entre back et frontend
//Les infos seront récupérés dans l'api amadeus configuré dans le backend
//et retourné en this.http

@Injectable({
  providedIn: 'root'
})
export class AmadeusService {
  private apiUrl = `${environment.apiUrl}/amadeus`;

  constructor(private http: HttpClient) {}

  // Rechercher des villes (autocomplete)
  searchCities(keyword: string): Observable<{ success: boolean; count: number; cities: AmadeusCity[] }> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<any>(`${this.apiUrl}/locations/cities`, { params });
  }

  // Obtenir les villes populaires
  getPopularCities(): Observable<{ success: boolean; cities: AmadeusCity[] }> {
    return this.http.get<any>(`${this.apiUrl}/locations/popular`);
  }

  // Rechercher des hôtels par code ville
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

  // Rechercher des hôtels par coordonnées
  searchHotelsByGeocode(latitude: number, longitude: number, radius?: number): Observable<{ success: boolean; count: number; hotels: AmadeusHotel[] }> {
    let params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString());
    
    if (radius) params = params.set('radius', radius.toString());

    return this.http.get<any>(`${this.apiUrl}/hotels/by-geocode`, { params });
  }

  // Rechercher des offres d'hôtels (prix et disponibilité)
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
    
    if (options.adults) params = params.set('adults', options.adults.toString());
    if (options.roomQuantity) params = params.set('roomQuantity', options.roomQuantity.toString());
    if (options.currency) params = params.set('currency', options.currency);
    if (options.priceRange) params = params.set('priceRange', options.priceRange);

    return this.http.get<any>(`${this.apiUrl}/hotels/offers`, { params });
  }

  // Obtenir les détails d'une offre
  getHotelOffer(offerId: string): Observable<{ success: boolean; offer: any }> {
    return this.http.get<any>(`${this.apiUrl}/hotels/offer/${offerId}`);
  }
}