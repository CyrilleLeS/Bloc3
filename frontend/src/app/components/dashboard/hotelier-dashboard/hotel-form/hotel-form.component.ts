import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HotelService } from '../../../../services/hotel.service';
import { Hotel } from '../../../../models';

@Component({
  selector: 'app-hotel-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './hotel-form.component.html',
  styleUrl: './hotel-form.component.scss'
})
export class HotelFormComponent implements OnInit {
  hotelForm: FormGroup;
  isEditMode = false;
  hotelId: string | null = null;
  loading = false;
  submitting = false;
  error = '';

  amenitiesList = [
    { value: 'wifi', label: '📶 WiFi' },
    { value: 'parking', label: '🅿️ Parking' },
    { value: 'restaurant', label: '🍽️ Restaurant' },
    { value: 'bar', label: '🍸 Bar' },
    { value: 'piscine', label: '🏊 Piscine' },
    { value: 'spa', label: '💆 Spa' },
    { value: 'salle_sport', label: '🏋️ Salle de sport' },
    { value: 'climatisation', label: '❄️ Climatisation' },
    { value: 'room_service', label: '🛎️ Room Service' },
    { value: 'reception_24h', label: '🕐 Réception 24h' },
    { value: 'navette_aeroport', label: '✈️ Navette aéroport' },
    { value: 'animaux_acceptes', label: '🐕 Animaux acceptés' }
  ];

  constructor(
    private fb: FormBuilder,
    private hotelService: HotelService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.hotelForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(2000)]],
      street: ['', Validators.required],
      city: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['France'],
      stars: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      amenities: [[]]
    });
  }

  ngOnInit(): void {
    this.hotelId = this.route.snapshot.paramMap.get('id');
    if (this.hotelId) {
      this.isEditMode = true;
      this.loadHotel();
    }
  }

  loadHotel(): void {
    if (!this.hotelId) return;
    
    this.loading = true;
    this.hotelService.getHotel(this.hotelId).subscribe({
      next: (res) => {
        const hotel = res.hotel;
        this.hotelForm.patchValue({
          name: hotel.name,
          description: hotel.description,
          street: hotel.address.street,
          city: hotel.address.city,
          zipCode: hotel.address.zipCode,
          country: hotel.address.country,
          stars: hotel.stars,
          amenities: hotel.amenities
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger l\'hôtel';
        this.loading = false;
      }
    });
  }

  toggleAmenity(amenity: string): void {
    const amenities = this.hotelForm.get('amenities')?.value || [];
    const index = amenities.indexOf(amenity);
    if (index > -1) {
      amenities.splice(index, 1);
    } else {
      amenities.push(amenity);
    }
    this.hotelForm.patchValue({ amenities });
  }

  isAmenitySelected(amenity: string): boolean {
    const amenities = this.hotelForm.get('amenities')?.value || [];
    return amenities.includes(amenity);
  }

  onSubmit(): void {
    if (this.hotelForm.invalid) return;

    this.submitting = true;
    this.error = '';

    const formValue = this.hotelForm.value;
    const hotelData: Partial<Hotel> = {
      name: formValue.name,
      description: formValue.description,
      address: {
        street: formValue.street,
        city: formValue.city,
        zipCode: formValue.zipCode,
        country: formValue.country
      },
      stars: formValue.stars,
      amenities: formValue.amenities
    };

    const request = this.isEditMode && this.hotelId
      ? this.hotelService.updateHotel(this.hotelId, hotelData)
      : this.hotelService.createHotel(hotelData);

    request.subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/dashboard/hotelier']);
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.error?.message || 'Une erreur est survenue';
      }
    });
  }

  get f() { return this.hotelForm.controls; }
}