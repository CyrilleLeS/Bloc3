const amadeus = require('../config/amadeus');

// cette fonction gère la recherche des hôtels par ville via l'api amadeus
// la route sera ---> GET /api/amadeus/hotels/by-city
// l'accès sera public
// Pour les fonctions suivantes, le schéma sera le même: on envoi une requête,
// des if pour déterminer la réponse et un res en .json + message d'erreur au cas ou
exports.searchHotelsByCity = async (req, res) => {
  try {
    const { cityCode, radius = 5, radiusUnit = 'KM', ratings, amenities } = req.query;

    if (!cityCode) {
      return res.status(400).json({ message: 'Le code ville (cityCode) est requis' });
    }

    const params = {
      cityCode: cityCode.toUpperCase(),
      radius: parseInt(radius),
      radiusUnit
    };

    if (ratings) {
      params.ratings = ratings; // ex: "3,4,5"
    }

    if (amenities) {
      params.amenities = amenities; // ex: "SWIMMING_POOL,SPA"
    }

    const response = await amadeus.referenceData.locations.hotels.byCity.get(params);

    res.json({
      success: true,
      count: response.data.length,
      hotels: response.data.map(hotel => ({
        hotelId: hotel.hotelId,
        name: hotel.name,
        chainCode: hotel.chainCode,
        iataCode: hotel.iataCode,
        dupeId: hotel.dupeId,
        geoCode: hotel.geoCode,
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

// Rechercher des hôtels par coordonnées GPS
// GET /api/amadeus/hotels/by-geocode
// Public
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

// Rechercher des offres d'hôtels (prix et disponibilité)
// GET /api/amadeus/hotels/offers
// Public
exports.searchHotelOffers = async (req, res) => {
  try {
    const {
      hotelIds,
      checkInDate,
      checkOutDate,
      adults = 1,
      roomQuantity = 1,
      currency = 'EUR',
      priceRange,
      boardType
    } = req.query;

    if (!hotelIds) {
      return res.status(400).json({ message: 'hotelIds est requis' });
    }

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Les dates de check-in et check-out sont requises' });
    }

    const params = {
      hotelIds: hotelIds, // Peut être une liste: "HOTEL1,HOTEL2"
      checkInDate,
      checkOutDate,
      adults: parseInt(adults),
      roomQuantity: parseInt(roomQuantity),
      currency
    };

    if (priceRange) {
      params.priceRange = priceRange; // ex: "100-300"
    }

    if (boardType) {
      params.boardType = boardType; // ROOM_ONLY, BREAKFAST, etc.
    }

    const response = await amadeus.shopping.hotelOffersSearch.get(params);

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

// Obtenir les détails d'une offre spécifique
// GET /api/amadeus/hotels/offer/:offerId
// Public
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

// Rechercher des villes (autocomplete)
// GET /api/amadeus/locations/cities
// Public
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

// Obtenir les codes IATA des villes populaires
// GET /api/amadeus/locations/popular
// Public
exports.getPopularCities = async (req, res) => {
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