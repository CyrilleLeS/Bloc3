import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AmadeusService, AmadeusCity, AmadeusHotel, AmadeusHotelOffer } from '../../services/amadeus.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

// Composant de Recherche Avancée (Amadeus)
// Permet de chercher des hôtels dans le monde entier via l'API Amadeus.
// Fonctionne en 3 étapes :
// 1. Recherche de la ville
// 2. Recherche des hôtels dans cette ville
// 3. Recherche des offres (prix) pour les hôtels sélectionnés

@Component({
  selector: 'app-amadeus-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './amadeus-search.component.html',
  styleUrl: './amadeus-search.component.scss'
})
export class AmadeusSearchComponent implements OnInit {
  // Données de recherche Ville
  citySearch = ''; // Ce que l'utilisateur tape
  citySuggestions: AmadeusCity[] = []; // Suggestions d'autocomplétion
  popularCities: AmadeusCity[] = [];   // Villes par défaut
  selectedCity: AmadeusCity | null = null; // Ville choisie
  showSuggestions = false; // Afficher/Masquer la liste

  // Données de Dates
  checkInDate = '';
  checkOutDate = '';
  adults = 2;

  // Résultats
  hotels: AmadeusHotel[] = []; // Liste des hôtels trouvés (sans prix)
  hotelOffers: AmadeusHotelOffer[] = []; // Liste des offres (avec prix)

  // États de chargement et erreurs
  loadingCities = false;
  loadingHotels = false;
  loadingOffers = false;
  error = '';

  // Gestion des étapes de l'interface
  // search = Choix ville/dates
  // hotels = Liste des hôtels trouvés
  // offers = Liste des prix
  step: 'search' | 'hotels' | 'offers' = 'search';

  // "Subject" pour gérer la frappe clavier (debounce)
  private searchSubject = new Subject<string>();
  minDate: string; // Pour empêcher de choisir une date passée

  constructor(private amadeusService: AmadeusService) {
    // Initialisation des dates par défaut
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    
    // Arrivée = Demain
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.checkInDate = tomorrow.toISOString().split('T')[0];
    
    // Départ = Après-demain
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    this.checkOutDate = dayAfter.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    // Chargement initial
    this.loadPopularCities();

    // Configuration de la recherche intelligente
    // On attend 300ms après la dernière frappe avant de lancer la recherche
    // pour éviter de bombarder l'API à chaque lettre.
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(keyword => {
      this.searchCities(keyword);
    });
  }

  // Charge les villes populaires
  loadPopularCities(): void {
    this.amadeusService.getPopularCities().subscribe({
      next: (res) => {
        this.popularCities = res.cities;
      }
    });
  }

  // Appelé à chaque frappe dans le champ ville
  onCityInput(): void {
    if (this.citySearch.length >= 2) {
      this.searchSubject.next(this.citySearch);
      this.showSuggestions = true;
    } else {
      this.citySuggestions = [];
      this.showSuggestions = false;
    }
  }

  // Lance la recherche de ville via le service
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

  // Sélection d'une ville dans la liste
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

  // ÉTAPE 2 : Rechercher les hôtels dans la ville choisie
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
        this.hotels = res.hotels.slice(0, 20); // On limite à 20 résultats pour l'instant
        this.step = 'hotels'; // On passe à l'étape suivante
        this.loadingHotels = false;
      },
      error: (err) => {
        this.error = 'Erreur lors de la recherche des hôtels';
        this.loadingHotels = false;
      }
    });
  }

  // ÉTAPE 3 : Rechercher les offres (prix) pour les hôtels trouvés
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

    // On prend les 5 premiers hôtels de la liste pour chercher leurs prix
    // (L'API Amadeus limite le nombre d'hôtels par requête)
    const hotelIds = this.hotels.slice(0, 5).map(h => h.hotelId).join(',');

    this.amadeusService.searchHotelOffers({
      hotelIds,
      checkInDate: this.checkInDate,
      checkOutDate: this.checkOutDate,
      adults: this.adults
    }).subscribe({
      next: (res) => {
        this.hotelOffers = res.offers;
        this.step = 'offers'; // On passe à l'affichage des offres
        this.loadingOffers = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la recherche des offres';
        this.loadingOffers = false;
      }
    });
  }

  // Retour à l'étape précédente
  goBack(): void {
    if (this.step === 'offers') {
      this.step = 'hotels';
    } else if (this.step === 'hotels') {
      this.step = 'search';
    }
  }

  // Tout remettre à zéro
  resetSearch(): void {
    this.step = 'search';
    this.selectedCity = null;
    this.citySearch = '';
    this.hotels = [];
    this.hotelOffers = [];
    this.error = '';
  }

  // Utilitaire pour afficher les étoiles
  getStars(rating: string | undefined): number[] {
    const count = rating ? parseInt(rating) : 0;
    return Array(count).fill(0);
  }

  // Vérifie si une étoile doit être colorée (pour le template)
  isStarFilled(index: number, rating: string | undefined): boolean {
    if (!rating) return false;
    return index < parseInt(rating);
  }
}
