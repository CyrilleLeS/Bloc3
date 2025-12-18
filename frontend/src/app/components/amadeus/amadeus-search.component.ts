import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AmadeusService, AmadeusCity, AmadeusHotel, AmadeusHotelOffer } from '../../services/amadeus.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-amadeus-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './amadeus-search.component.html',
  styleUrl: './amadeus-search.component.scss'
})
export class AmadeusSearchComponent implements OnInit {
  // Recherche ville
  citySearch = '';
  citySuggestions: AmadeusCity[] = [];
  popularCities: AmadeusCity[] = [];
  selectedCity: AmadeusCity | null = null;
  showSuggestions = false;

  // Dates
  checkInDate = '';
  checkOutDate = '';
  adults = 2;

  // Résultats
  hotels: AmadeusHotel[] = [];
  hotelOffers: AmadeusHotelOffer[] = [];

  // États
  loadingCities = false;
  loadingHotels = false;
  loadingOffers = false;
  error = '';

  // Étape actuelle
  step: 'search' | 'hotels' | 'offers' = 'search';

  private searchSubject = new Subject<string>();
  minDate: string;

  constructor(private amadeusService: AmadeusService) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    
    // Date par défaut : demain
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.checkInDate = tomorrow.toISOString().split('T')[0];
    
    // Date départ : après-demain
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    this.checkOutDate = dayAfter.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadPopularCities();

    // Debounce sur la recherche de villes
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(keyword => {
      this.searchCities(keyword);
    });
  }

  loadPopularCities(): void {
    this.amadeusService.getPopularCities().subscribe({
      next: (res) => {
        this.popularCities = res.cities;
      }
    });
  }

  onCityInput(): void {
    if (this.citySearch.length >= 2) {
      this.searchSubject.next(this.citySearch);
      this.showSuggestions = true;
    } else {
      this.citySuggestions = [];
      this.showSuggestions = false;
    }
  }

  searchCities(keyword: string): void {
    this.loadingCities = true;
    this.amadeusService.searchCities(keyword).subscribe({
      next: (res) => {
        this.citySuggestions = res.cities;
        this.loadingCities = false;
      },
      error: () => {
        this.loadingCities = false;
      }
    });
  }

  selectCity(city: AmadeusCity): void {
    this.selectedCity = city;
    this.citySearch = city.name;
    this.showSuggestions = false;
    this.citySuggestions = [];
  }

  selectPopularCity(city: AmadeusCity): void {
    this.selectedCity = city;
    this.citySearch = city.name;
  }

  searchHotels(): void {
    if (!this.selectedCity) {
      this.error = 'Veuillez sélectionner une ville';
      return;
    }

    this.loadingHotels = true;
    this.error = '';
    this.hotels = [];

    this.amadeusService.searchHotelsByCity(this.selectedCity.iataCode).subscribe({
      next: (res) => {
        this.hotels = res.hotels.slice(0, 20); // Limiter à 20
        this.step = 'hotels';
        this.loadingHotels = false;
      },
      error: (err) => {
        this.error = 'Erreur lors de la recherche des hôtels';
        this.loadingHotels = false;
      }
    });
  }

  searchOffers(): void {
    if (this.hotels.length === 0) {
      this.error = 'Aucun hôtel sélectionné';
      return;
    }

    if (!this.checkInDate || !this.checkOutDate) {
      this.error = 'Veuillez sélectionner les dates';
      return;
    }

    this.loadingOffers = true;
    this.error = '';
    this.hotelOffers = [];

    // Prendre les 5 premiers hôtels pour la recherche d'offres
    const hotelIds = this.hotels.slice(0, 5).map(h => h.hotelId).join(',');

    this.amadeusService.searchHotelOffers({
      hotelIds,
      checkInDate: this.checkInDate,
      checkOutDate: this.checkOutDate,
      adults: this.adults
    }).subscribe({
      next: (res) => {
        this.hotelOffers = res.offers;
        this.step = 'offers';
        this.loadingOffers = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la recherche des offres';
        this.loadingOffers = false;
      }
    });
  }

  goBack(): void {
    if (this.step === 'offers') {
      this.step = 'hotels';
    } else if (this.step === 'hotels') {
      this.step = 'search';
    }
  }

  resetSearch(): void {
    this.step = 'search';
    this.selectedCity = null;
    this.citySearch = '';
    this.hotels = [];
    this.hotelOffers = [];
    this.error = '';
  }

  getStars(rating: string | undefined): number[] {
    const count = rating ? parseInt(rating) : 0;
    return Array(count).fill(0);
  }
}