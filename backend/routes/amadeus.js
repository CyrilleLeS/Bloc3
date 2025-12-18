const express = require('express');
const router = express.Router();
const amadeusController = require('../controllers/amadeusController');

// Recherche de villes (autocomplete)
router.get('/locations/cities', amadeusController.searchCities);

// Villes populaires (pas d'appel API)
router.get('/locations/popular', amadeusController.getPopularCities);

// Recherche d'hôtels par ville
router.get('/hotels/by-city', amadeusController.searchHotelsByCity);

// Recherche d'hôtels par coordonnées GPS
router.get('/hotels/by-geocode', amadeusController.searchHotelsByGeocode);

// Recherche d'offres d'hôtels (prix et disponibilité)
router.get('/hotels/offers', amadeusController.searchHotelOffers);

// Détails d'une offre
router.get('/hotels/offer/:offerId', amadeusController.getHotelOffer);

module.exports = router;