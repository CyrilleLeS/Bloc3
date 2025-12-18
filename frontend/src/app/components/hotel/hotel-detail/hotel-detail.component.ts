import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HotelService } from '../../../services/hotel.service';
import { AuthService } from '../../../services/auth.service';
import { Hotel, Room } from '../../../models';

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hotel-detail.component.html',
  styleUrl: './hotel-detail.component.scss'
})
export class HotelDetailComponent implements OnInit {
  hotel: Hotel | null = null;
  rooms: Room[] = [];
  loading = true;
  error = '';
  selectedImage = '';

  amenityIcons: { [key: string]: string } = {
    wifi: '📶',
    parking: '🅿️',
    restaurant: '🍽️',
    bar: '🍸',
    piscine: '🏊',
    spa: '💆',
    salle_sport: '🏋️',
    climatisation: '❄️',
    room_service: '🛎️',
    reception_24h: '🕐',
    navette_aeroport: '✈️',
    animaux_acceptes: '🐕'
  };

  roomAmenityIcons: { [key: string]: string } = {
    wifi: '📶',
    tv: '📺',
    climatisation: '❄️',
    minibar: '🍫',
    coffre_fort: '🔐',
    balcon: '🌅',
    vue_mer: '🌊',
    vue_montagne: '⛰️',
    baignoire: '🛁',
    douche: '🚿',
    seche_cheveux: '💇',
    bureau: '💼',
    canape: '🛋️'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hotelService: HotelService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadHotel(id);
    }
  }

  loadHotel(id: string): void {
    this.loading = true;
    this.hotelService.getHotel(id).subscribe({
      next: (res) => {
        this.hotel = res.hotel;
        this.selectedImage = this.getHotelImage(this.hotel);
        this.loadRooms(id);
      },
      error: (err) => {
        this.error = 'Hôtel non trouvé';
        this.loading = false;
      }
    });
  }

  loadRooms(hotelId: string): void {
    this.hotelService.getRoomsByHotel(hotelId).subscribe({
      next: (res) => {
        this.rooms = res.rooms;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  selectImage(image: string): void {
    this.selectedImage = image;
  }

  getHotelImage(hotel: Hotel): string {
    return hotel.images && hotel.images.length > 0
      ? hotel.images[0]
      : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
  }

  getRoomImage(room: Room): string {
    return room.images && room.images.length > 0
      ? room.images[0]
      : 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800';
  }

  getStars(count: number): number[] {
    return Array(count).fill(0);
  }

  getAmenityIcon(amenity: string): string {
    return this.amenityIcons[amenity] || '✓';
  }

  getRoomAmenityIcon(amenity: string): string {
    return this.roomAmenityIcons[amenity] || '✓';
  }

  formatAmenity(amenity: string): string {
    return amenity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  bookRoom(room: Room): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: `/book/${room._id}` }
      });
      return;
    }
    this.router.navigate(['/book', room._id]);
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}