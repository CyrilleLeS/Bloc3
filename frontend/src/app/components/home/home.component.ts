import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../services/hotel.service';
import { Hotel } from '../../models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule,],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  featuredHotels: Hotel[] = [];
  loading = true;
  searchCity = '';

  constructor(
    private hotelService: HotelService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFeaturedHotels();
  }

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

  onSearch(): void {
    if (this.searchCity.trim()) {
      this.router.navigate(['/hotels'], { queryParams: { city: this.searchCity } });
    } else {
      this.router.navigate(['/hotels']);
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
}