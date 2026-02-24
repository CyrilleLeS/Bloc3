import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HotelService } from './hotel.service';
import { environment } from '../../environments/environment';

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
    // Vérifie qu'il n'y a pas de requêtes HTTP non gérées
    httpMock.verify();
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  // --- Test de récupération de la liste des hôtels ---
  it('devrait récupérer la liste des hôtels via une requête GET', () => {
    const dummyResponse = {
      success: true,
      count: 2,
      hotels: [
        { _id: '1', name: 'Hôtel Paris', stars: 4 },
        { _id: '2', name: 'Hôtel Lyon', stars: 3 }
      ]
    };

    // On s'abonne à la méthode et on définit ce qu'on attend en retour
    service.getHotels().subscribe(response => {
      expect(response.hotels.length).toBe(2);
      expect(response.hotels[0].name).toBe('Hôtel Paris');
    });

    // On intercepte la requête HTTP envoyée par le service
    const req = httpMock.expectOne(`${environment.apiUrl}/hotels`);
    expect(req.request.method).toBe('GET');
    
    // On simule la réponse du serveur
    req.flush(dummyResponse);
  });

  // --- Test de la création d'un hôtel ---
  it('devrait envoyer une requête POST pour créer un hôtel', () => {
    const newHotel = { name: 'Nouvel Hôtel', city: 'Marseille' };
    const dummyResponse = {
      success: true,
      message: 'Hôtel créé',
      hotel: { _id: '123', ...newHotel }
    };

    service.createHotel(newHotel).subscribe(response => {
      expect(response.success).toBe(true);
      expect(response.hotel._id).toBe('123');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/hotels`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newHotel);
    
    req.flush(dummyResponse);
  });

  // --- Test des filtres de recherche ---
  it('devrait ajouter les filtres de recherche dans l\'URL', () => {
    const filters = { city: 'Nice', stars: 5 };

    service.getHotels(filters).subscribe();

    // On vérifie que les paramètres "city" et "stars" sont bien présents dans l'URL
    const req = httpMock.expectOne(request => 
      request.url === `${environment.apiUrl}/hotels` &&
      request.params.get('city') === 'Nice' &&
      request.params.get('stars') === '5'
    );
    
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, hotels: [] });
  });
});
