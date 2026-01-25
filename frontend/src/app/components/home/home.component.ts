import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../services/hotel.service';
import { Hotel } from '../../models';

// Composant Page d'Accueil (Home)
// C'est la vitrine du site. Elle affiche une barre de recherche rapide
// et une sélection d'hôtels en vedette.

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], // Imports nécessaires
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  featuredHotels: Hotel[] = []; // Liste des hôtels mis en avant
  loading = true; // État de chargement
  searchCity = ''; // Valeur du champ de recherche

  constructor(
    private hotelService: HotelService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFeaturedHotels();
  }

  // Charge les 6 premiers hôtels pour les afficher en vitrine
  loadFeaturedHotels(): void {
    this.hotelService.getHotels({ limit: 6 }).subscribe({
      next: (res) => {
        this.featuredHotels = res.hotels;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // Lancé quand on clique sur "Rechercher"
  onSearch(): void {
    if (this.searchCity.trim()) {
      // Redirection vers la page de liste avec le filtre ville
      this.router.navigate(['/hotels'], { queryParams: { city: this.searchCity } });
    } else {
      // Si vide, on va juste sur la liste complète
      this.router.navigate(['/hotels']);
    }
  }

  // Utilitaire pour afficher les étoiles
  getStars(count: number): number[] {
    return Array(count).fill(0);
  }

  // Récupère l'image principale ou une image par défaut
  getHotelImage(hotel: Hotel): string {
    return hotel.images && hotel.images.length > 0 
      ? hotel.images[0] 
      : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
  }
}
