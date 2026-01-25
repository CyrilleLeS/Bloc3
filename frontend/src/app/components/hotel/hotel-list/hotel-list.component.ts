import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../services/hotel.service';
import { Hotel } from '../../../models';

// Composant pour afficher la liste des hôtels
// Gère l'affichage, le filtrage (ville, étoiles, équipements) et la pagination
@Component({
  selector: 'app-hotel-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './hotel-list.component.html',
  styleUrl: './hotel-list.component.scss'
})
export class HotelListComponent implements OnInit {
  // Liste des hôtels récupérés
  hotels: Hotel[] = [];
  // État de chargement (vrai tant que les données ne sont pas arrivées)
  loading = true;
  // Message d'erreur s'il y a un problème
  error = '';

  // Filtres sélectionnés par l'utilisateur
  searchCity = '';
  selectedStars = 0;
  selectedAmenities: string[] = [];

  // Variables pour la pagination
  currentPage = 1;
  totalPages = 1;
  total = 0;
  limit = 9; // Nombre d'hôtels par page

  // Liste des équipements disponibles pour le filtre
  amenitiesList = [
    { value: 'wifi', label: '📶 WiFi' },
    { value: 'parking', label: '🅿️ Parking' },
    { value: 'restaurant', label: '🍽️ Restaurant' },
    { value: 'piscine', label: '🏊 Piscine' },
    { value: 'spa', label: '💆 Spa' },
    { value: 'salle_sport', label: '🏋️ Salle de sport' },
    { value: 'climatisation', label: '❄️ Climatisation' },
    { value: 'room_service', label: '🛎️ Room Service' }
  ];

  constructor(
    private hotelService: HotelService, // Service pour appeler l'API
    private route: ActivatedRoute,      // Pour lire les paramètres de l'URL actuelle
    private router: Router              // Pour changer l'URL (navigation)
  ) {}

  // Initialisation du composant
  ngOnInit(): void {
    // On écoute les changements dans l'URL (query params)
    // Cela permet de garder les filtres si on rafraîchit la page ou si on partage le lien
    this.route.queryParams.subscribe(params => {
      this.searchCity = params['city'] || '';
      this.selectedStars = params['stars'] ? +params['stars'] : 0;
      this.currentPage = params['page'] ? +params['page'] : 1;
      
      // Une fois les paramètres récupérés, on charge les hôtels
      this.loadHotels();
    });
  }

  // Fonction principale pour charger les hôtels depuis le serveur
  loadHotels(): void {
    this.loading = true;
    this.error = '';

    // Préparation des filtres à envoyer à l'API
    const filters: any = {
      page: this.currentPage,
      limit: this.limit
    };

    if (this.searchCity) filters.city = this.searchCity;
    if (this.selectedStars > 0) filters.stars = this.selectedStars;
    if (this.selectedAmenities.length > 0) {
      filters.amenities = this.selectedAmenities.join(',');
    }

    // Appel au service
    this.hotelService.getHotels(filters).subscribe({
      next: (res) => {
        // Succès : on met à jour la liste et les infos de pagination
        this.hotels = res.hotels;
        this.total = res.total || 0;
        this.totalPages = res.totalPages || 1;
        this.currentPage = res.currentPage || 1;
        this.loading = false;
      },
      error: (err) => {
        // Erreur : on affiche un message à l'utilisateur
        this.error = 'Erreur lors du chargement des hôtels';
        this.loading = false;
      }
    });
  }

  // Déclenché quand l'utilisateur lance une recherche par ville
  onSearch(): void {
    this.currentPage = 1; // Retour à la première page
    this.updateUrl();     // Mise à jour de l'URL
    this.loadHotels();    // Rechargement des données
  }

  // Déclenché quand l'utilisateur clique sur un filtre d'étoiles
  onStarsChange(stars: number): void {
    // Si on clique sur la même note, on désélectionne (0), sinon on prend la nouvelle note
    this.selectedStars = this.selectedStars === stars ? 0 : stars;
    this.currentPage = 1;
    this.updateUrl();
    this.loadHotels();
  }

  // Gestion de la sélection multiple des équipements
  toggleAmenity(amenity: string): void {
    const index = this.selectedAmenities.indexOf(amenity);
    if (index > -1) {
      // Si déjà présent, on l'enlève
      this.selectedAmenities.splice(index, 1);
    } else {
      // Sinon on l'ajoute
      this.selectedAmenities.push(amenity);
    }
    this.currentPage = 1;
    this.loadHotels(); // Note: on ne met pas à jour l'URL pour les équipements (choix de design)
  }

  // Vérifie si un équipement est sélectionné (pour le style du bouton)
  isAmenitySelected(amenity: string): boolean {
    return this.selectedAmenities.includes(amenity);
  }

  // Réinitialise tous les filtres
  clearFilters(): void {
    this.searchCity = '';
    this.selectedStars = 0;
    this.selectedAmenities = [];
    this.currentPage = 1;
    this.updateUrl();
    this.loadHotels();
  }

  // Met à jour l'URL du navigateur sans recharger la page
  // Permet de synchroniser l'URL avec l'état actuel (ville, page, étoiles)
  updateUrl(): void {
    const queryParams: any = {};
    if (this.searchCity) queryParams.city = this.searchCity;
    if (this.selectedStars > 0) queryParams.stars = this.selectedStars;
    if (this.currentPage > 1) queryParams.page = this.currentPage;
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: '' // Remplace les paramètres existants
    });
  }

  // Changement de page pour la pagination
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateUrl();
      this.loadHotels();
      // Remonte en haut de la page pour une meilleure UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Utilitaire pour afficher les étoiles dans le HTML (boucle)
  getStars(count: number): number[] {
    return Array(count).fill(0);
  }

  // Retourne l'image de l'hôtel ou une image par défaut si aucune n'est disponible
  getHotelImage(hotel: Hotel): string {
    return hotel.images && hotel.images.length > 0
      ? hotel.images[0]
      : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
  }

  // Calcule les pages à afficher dans la pagination (ex: 1 2 [3] 4 5)
  getPages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}
