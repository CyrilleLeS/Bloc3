import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HotelListComponent } from './hotel-list.component';
import { HotelService } from '../../../services/hotel.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';

describe('HotelListComponent', () => {
  let component: HotelListComponent;
  let fixture: ComponentFixture<HotelListComponent>;
  let hotelServiceSpy: jasmine.SpyObj<HotelService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('HotelService', ['getHotels']);

    await TestBed.configureTestingModule({
      imports: [HotelListComponent, RouterTestingModule, FormsModule],
      providers: [
        { provide: HotelService, useValue: spy },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({})
          }
        }
      ]
    }).compileComponents();

    hotelServiceSpy = TestBed.inject(HotelService) as jasmine.SpyObj<HotelService>;
    fixture = TestBed.createComponent(HotelListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load hotels on init', () => {
    const dummyResponse = {
      success: true,
      count: 1,
      hotels: [{ _id: '1', name: 'Test Hotel', address: { city: 'Paris' }, stars: 4, amenities: [], description: 'desc' } as any],
      total: 1,
      totalPages: 1,
      currentPage: 1
    };
    hotelServiceSpy.getHotels.and.returnValue(of(dummyResponse));

    fixture.detectChanges(); // triggers ngOnInit

    expect(component.loading).toBeFalse();
    expect(component.hotels.length).toBe(1);
    expect(component.hotels[0].name).toBe('Test Hotel');
  });

  it('should handle error when loading hotels fails', () => {
    hotelServiceSpy.getHotels.and.returnValue(throwError(() => new Error('API Error')));

    fixture.detectChanges(); // triggers ngOnInit

    expect(component.loading).toBeFalse();
    expect(component.error).toBe('Erreur lors du chargement des hôtels');
  });
});
