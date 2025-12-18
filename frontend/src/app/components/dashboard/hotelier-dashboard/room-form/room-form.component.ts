import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HotelService } from '../../../../services/hotel.service';

@Component({
  selector: 'app-room-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './room-form.component.html',
  styleUrl: './room-form.component.scss'
})
export class RoomFormComponent implements OnInit {
  roomForm: FormGroup;
  hotelId: string | null = null;
  hotelName = '';
  submitting = false;
  error = '';

  roomTypes = [
    { value: 'simple', label: 'Simple' },
    { value: 'double', label: 'Double' },
    { value: 'twin', label: 'Twin (2 lits)' },
    { value: 'suite', label: 'Suite' },
    { value: 'familiale', label: 'Familiale' },
    { value: 'deluxe', label: 'Deluxe' }
  ];

  bedTypes = [
    { value: 'simple', label: 'Lit simple' },
    { value: 'double', label: 'Lit double' },
    { value: 'queen', label: 'Queen size' },
    { value: 'king', label: 'King size' },
    { value: 'twin', label: 'Deux lits simples' },
    { value: 'superpose', label: 'Lits superposés' }
  ];

  amenitiesList = [
    { value: 'wifi', label: '📶 WiFi' },
    { value: 'tv', label: '📺 TV' },
    { value: 'climatisation', label: '❄️ Climatisation' },
    { value: 'minibar', label: '🍫 Minibar' },
    { value: 'coffre_fort', label: '🔐 Coffre-fort' },
    { value: 'balcon', label: '🌅 Balcon' },
    { value: 'vue_mer', label: '🌊 Vue mer' },
    { value: 'vue_montagne', label: '⛰️ Vue montagne' },
    { value: 'baignoire', label: '🛁 Baignoire' },
    { value: 'douche', label: '🚿 Douche' },
    { value: 'seche_cheveux', label: '💇 Sèche-cheveux' },
    { value: 'bureau', label: '💼 Bureau' }
  ];

  constructor(
    private fb: FormBuilder,
    private hotelService: HotelService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.roomForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      type: ['double', Validators.required],
      price: [100, [Validators.required, Validators.min(1)]],
      adults: [2, [Validators.required, Validators.min(1)]],
      children: [0, Validators.min(0)],
      size: [25],
      bedType: ['double'],
      quantity: [1, [Validators.required, Validators.min(1)]],
      amenities: [[]]
    });
  }

  ngOnInit(): void {
    this.hotelId = this.route.snapshot.paramMap.get('hotelId');
    if (this.hotelId) {
      this.loadHotelInfo();
    } else {
      this.router.navigate(['/dashboard/hotelier']);
    }
  }

  loadHotelInfo(): void {
    if (!this.hotelId) return;
    this.hotelService.getHotel(this.hotelId).subscribe({
      next: (res) => {
        this.hotelName = res.hotel.name;
      }
    });
  }

  toggleAmenity(amenity: string): void {
    const amenities = this.roomForm.get('amenities')?.value || [];
    const index = amenities.indexOf(amenity);
    if (index > -1) {
      amenities.splice(index, 1);
    } else {
      amenities.push(amenity);
    }
    this.roomForm.patchValue({ amenities });
  }

  isAmenitySelected(amenity: string): boolean {
    const amenities = this.roomForm.get('amenities')?.value || [];
    return amenities.includes(amenity);
  }

  onSubmit(): void {
    if (this.roomForm.invalid || !this.hotelId) return;

    this.submitting = true;
    this.error = '';

    const formValue = this.roomForm.value;
    const roomData = {
      hotel: this.hotelId,
      name: formValue.name,
      description: formValue.description,
      type: formValue.type,
      price: formValue.price,
      capacity: {
        adults: formValue.adults,
        children: formValue.children
      },
      size: formValue.size,
      bedType: formValue.bedType,
      quantity: formValue.quantity,
      amenities: formValue.amenities
    };

    this.hotelService.createRoom(roomData).subscribe({
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

  get f() { return this.roomForm.controls; }
}