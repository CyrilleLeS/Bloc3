import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HotelService } from './hotel.service';
import { environment } from '../../environments/environment';
import { Hotel } from '../models';

describe('HotelService', () => {
  let service: HotelService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HotelService]
    });
    service = TestBed.inject(HotelService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve hotels via GET', () => {
    const dummyHotels: any = {
      success: true,
      count: 2,
      hotels: [
        { _id: '1', name: 'Hotel One', address: { city: 'Paris', country: 'France' } },
        { _id: '2', name: 'Hotel Two', address: { city: 'Lyon', country: 'France' } }
      ]
    };

    service.getHotels().subscribe(response => {
      expect(response.hotels.length).toBe(2);
      expect(response.hotels).toEqual(dummyHotels.hotels);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/hotels`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyHotels);
  });
});
