import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../services/hotel.service';
import { Hotel } from '../../../models';

@Component({
  selector: 'app-hotel-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './hotel-list.component.html',
  styleUrl: './hotel-list.component.scss'
})
export class HotelListComponent implements OnInit {
  hotels: Hotel[] = [];
  loading = true;
  error = '';

  // Filtres
  searchCity = '';
  selectedStars = 0;
  selectedAmenities: string[] = [];

  // Pagination
  currentPage = 1;
  totalPages = 1;
  total = 0;
  limit = 9;

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
    private hotelService: HotelService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchCity = params['city'] || '';
      this.selectedStars = params['stars'] ? +params['stars'] : 0;
      this.currentPage = params['page'] ? +params['page'] : 1;
      this.loadHotels();
    });
  }

  loadHotels(): void {
    this.loading = true;
    this.error = '';

    const filters: any = {
      page: this.currentPage,
      limit: this.limit
    };

    if (this.searchCity) filters.city = this.searchCity;
    if (this.selectedStars > 0) filters.stars = this.selectedStars;
    if (this.selectedAmenities.length > 0) {
      filters.amenities = this.selectedAmenities.join(',');
    }

    this.hotelService.getHotels(filters).subscribe({
      next: (res) => {
        this.hotels = res.hotels;
        this.total = res.total || 0;
        this.totalPages = res.totalPages || 1;
        this.currentPage = res.currentPage || 1;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des hôtels';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.updateUrl();
    this.loadHotels();
  }

  onStarsChange(stars: number): void {
    this.selectedStars = this.selectedStars === stars ? 0 : stars;
    this.currentPage = 1;
    this.updateUrl();
    this.loadHotels();
  }

  toggleAmenity(amenity: string): void {
    const index = this.selectedAmenities.indexOf(amenity);
    if (index > -1) {
      this.selectedAmenities.splice(index, 1);
    } else {
      this.selectedAmenities.push(amenity);
    }
    this.currentPage = 1;
    this.loadHotels();
  }

  isAmenitySelected(amenity: string): boolean {
    return this.selectedAmenities.includes(amenity);
  }

  clearFilters(): void {
    this.searchCity = '';
    this.selectedStars = 0;
    this.selectedAmenities = [];
    this.currentPage = 1;
    this.updateUrl();
    this.loadHotels();
  }

  updateUrl(): void {
    const queryParams: any = {};
    if (this.searchCity) queryParams.city = this.searchCity;
    if (this.selectedStars > 0) queryParams.stars = this.selectedStars;
    if (this.currentPage > 1) queryParams.page = this.currentPage;
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: ''
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateUrl();
      this.loadHotels();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getStars(count: number): number[] {
    return Array(count).fill(0);
  }

  getHotelImage(hotel: Hotel): string {
    return hotel.images && hotel.images.length > 0
      ? hotel.images[0]
      : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
  }

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