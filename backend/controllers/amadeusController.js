const amadeus = require('../config/amadeus');

// Contrôleur Amadeus (API Externe)
// Ce fichier sert de "passerelle" entre notre application et Amadeus (fournisseur de données de voyage).
// Il permet de chercher des vrais hôtels, des villes et des offres en temps réel.

// --------------------------------------------------------------------------
// RECHERCHE D'HÔTELS (GÉOGRAPHIQUE)
// --------------------------------------------------------------------------

// 1. Recherche par ville (Code IATA, ex: PAR pour Paris)
// Route: GET /api/amadeus/hotels/by-city
// Accès: Public
exports.searchHotelsByCity = async (req, res) => {
  try {
    const { cityCode, radius = 5, radiusUnit = 'KM', ratings, amenities } = req.query;

    if (!cityCode) {
      return res.status(400).json({ message: 'Le code ville (cityCode) est requis' });
    }

    // Construction des paramètres pour Amadeus
    const params = {
      cityCode: cityCode.toUpperCase(),
      radius: parseInt(radius),
      radiusUnit
    };

    if (ratings) {
      params.ratings = ratings; // Filtre par étoiles (ex: "3,4,5")
    }

    if (amenities) {
      params.amenities = amenities; // Filtre par équipements (ex: "SWIMMING_POOL")
    }

    // Appel à l'API Amadeus
    const response = await amadeus.referenceData.locations.hotels.byCity.get(params);

    // On renvoie une version simplifiée des données au frontend
    res.json({
      success: true,
      count: response.data.length,
      hotels: response.data.map(hotel => ({
        hotelId: hotel.hotelId,
        name: hotel.name,
        chainCode: hotel.chainCode,
        iataCode: hotel.iataCode,
        dupeId: hotel.dupeId,
        geoCode: hotel.geoCode, // Latitude / Longitude
        address: hotel.address,
        distance: hotel.distance,
        lastUpdate: hotel.lastUpdate
      }))
    });
  } catch (error) {
    console.error('Erreur Amadeus searchHotelsByCity:', error);
    res.status(500).json({
      message: 'Erreur lors de la recherche des hôtels',
      error: error.response?.data || error.message
    });
  }
};

// 2. Recherche par coordonnées GPS (Latitude / Longitude)
// Route: GET /api/amadeus/hotels/by-geocode
// Accès: Public
exports.searchHotelsByGeocode = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5, radiusUnit = 'KM' } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude et longitude sont requis' });
    }

    const response = await amadeus.referenceData.locations.hotels.byGeocode.get({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius: parseInt(radius),
      radiusUnit
    });

    res.json({
      success: true,
      count: response.data.length,
      hotels: response.data
    });
  } catch (error) {
    console.error('Erreur Amadeus searchHotelsByGeocode:', error);
    res.status(500).json({
      message: 'Erreur lors de la recherche des hôtels',
      error: error.response?.data || error.message
    });
  }
};

// --------------------------------------------------------------------------
// RECHERCHE D'OFFRES (PRIX & DISPO)
// --------------------------------------------------------------------------

// Trouve les prix et disponibilités pour une liste d'hôtels donnée
// Route: GET /api/amadeus/hotels/offers
// Accès: Public
exports.searchHotelOffers = async (req, res) => {
  try {
    const {
      hotelIds,    // IDs des hôtels trouvés précédemment
      checkInDate,
      checkOutDate,
      adults = 1,
      roomQuantity = 1,
      currency = 'EUR',
      priceRange,
      boardType
    } = req.query;

    // Validation des champs obligatoires
    if (!hotelIds) {
      return res.status(400).json({ message: 'hotelIds est requis' });
    }
    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Les dates de check-in et check-out sont requises' });
    }

    // Paramètres de la recherche
    const params = {
      hotelIds: hotelIds, // Peut être une liste séparée par des virgules
      checkInDate,
      checkOutDate,
      adults: parseInt(adults),
      roomQuantity: parseInt(roomQuantity),
      currency
    };

    if (priceRange) params.priceRange = priceRange;
    if (boardType) params.boardType = boardType;

    // Appel Amadeus
    const response = await amadeus.shopping.hotelOffersSearch.get(params);

    // Structuration de la réponse pour le frontend
    res.json({
      success: true,
      count: response.data.length,
      offers: response.data.map(hotel => ({
        hotelId: hotel.hotel.hotelId,
        name: hotel.hotel.name,
        chainCode: hotel.hotel.chainCode,
        cityCode: hotel.hotel.cityCode,
        latitude: hotel.hotel.latitude,
        longitude: hotel.hotel.longitude,
        address: hotel.hotel.address,
        rating: hotel.hotel.rating,
        amenities: hotel.hotel.amenities,
        media: hotel.hotel.media,
        offers: hotel.offers.map(offer => ({
          id: offer.id,
          checkInDate: offer.checkInDate,
          checkOutDate: offer.checkOutDate,
          roomType: offer.room?.type,
          roomDescription: offer.room?.description?.text,
          beds: offer.room?.typeEstimated?.beds,
          bedType: offer.room?.typeEstimated?.bedType,
          guests: offer.guests?.adults,
          price: {
            currency: offer.price?.currency,
            total: offer.price?.total,
            base: offer.price?.base
          },
          policies: {
            cancellation: offer.policies?.cancellation,
            paymentType: offer.policies?.paymentType
          }
        }))
      }))
    });
  } catch (error) {
    console.error('Erreur Amadeus searchHotelOffers:', error);
    res.status(500).json({
      message: 'Erreur lors de la recherche des offres',
      error: error.response?.data || error.message
    });
  }
};

// Obtenir le détail d'une offre unique (pour finaliser la résa)
// Route: GET /api/amadeus/hotels/offer/:offerId
// Accès: Public
exports.getHotelOffer = async (req, res) => {
  try {
    const { offerId } = req.params;

    const response = await amadeus.shopping.hotelOfferSearch(offerId).get();

    res.json({
      success: true,
      offer: response.data
    });
  } catch (error) {
    console.error('Erreur Amadeus getHotelOffer:', error);
    res.status(500).json({
      message: 'Erreur lors de la récupération de l\'offre',
      error: error.response?.data || error.message
    });
  }
};

// --------------------------------------------------------------------------
// UTILITAIRES (VILLES)
// --------------------------------------------------------------------------

// Autocomplétion : Trouver une ville par mot-clé
// Route: GET /api/amadeus/locations/cities
// Accès: Public
exports.searchCities = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword || keyword.length < 2) {
      return res.status(400).json({ message: 'Le mot-clé doit contenir au moins 2 caractères' });
    }

    const response = await amadeus.referenceData.locations.get({
      keyword,
      subType: 'CITY'
    });

    res.json({
      success: true,
      count: response.data.length,
      cities: response.data.map(city => ({
        name: city.name,
        iataCode: city.iataCode,
        address: city.address,
        geoCode: city.geoCode
      }))
    });
  } catch (error) {
    console.error('Erreur Amadeus searchCities:', error);
    res.status(500).json({
      message: 'Erreur lors de la recherche des villes',
      error: error.response?.data || error.message
    });
  }
};

// Liste des villes populaires (pour l'accueil)
// Route: GET /api/amadeus/locations/popular
// Accès: Public
exports.getPopularCities = async (req, res) => {
  // Liste statique pour l'instant (pour éviter de consommer trop de quotas API)
  const popularCities = [
    { name: 'Paris', iataCode: 'PAR', country: 'France' },
    { name: 'Londres', iataCode: 'LON', country: 'Royaume-Uni' },
    { name: 'New York', iataCode: 'NYC', country: 'États-Unis' },
    { name: 'Tokyo', iataCode: 'TYO', country: 'Japon' },
    { name: 'Barcelone', iataCode: 'BCN', country: 'Espagne' },
    { name: 'Rome', iataCode: 'ROM', country: 'Italie' },
    { name: 'Amsterdam', iataCode: 'AMS', country: 'Pays-Bas' },
    { name: 'Berlin', iataCode: 'BER', country: 'Allemagne' },
    { name: 'Dubai', iataCode: 'DXB', country: 'Émirats Arabes Unis' },
    { name: 'Nice', iataCode: 'NCE', country: 'France' },
    { name: 'Lyon', iataCode: 'LYS', country: 'France' },
    { name: 'Marseille', iataCode: 'MRS', country: 'France' }
  ];

  res.json({
    success: true,
    cities: popularCities
  });
};
