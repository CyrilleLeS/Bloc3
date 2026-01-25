const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const bookingController = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

// Validation pour création de réservation
const bookingValidation = [
  body('room')
    .notEmpty().withMessage('L\'ID de la chambre est requis')
    .isMongoId().withMessage('ID de chambre invalide'),
  body('checkInDate')
    .notEmpty().withMessage('La date d\'arrivée est requise')
    .isISO8601().withMessage('Format de date invalide'),
  body('checkOutDate')
    .notEmpty().withMessage('La date de départ est requise')
    .isISO8601().withMessage('Format de date invalide'),
  body('numberOfGuests.adults')
    .optional()
    .isInt({ min: 1 }).withMessage('Il faut au moins 1 adulte'),
  body('numberOfGuests.children')
    .optional()
    .isInt({ min: 0 }).withMessage('Nombre d\'enfants invalide')
];

// Route publique - vérifier disponibilité
router.get('/check-availability', bookingController.checkAvailability);

// Routes protégées (client)
router.post('/',
  protect,
  [
    body('room').isMongoId().withMessage('Identifiant de chambre invalide'),
    body('checkInDate')
      .isISO8601().withMessage('Date d\'arrivée invalide')
      .custom((value) => new Date(value) >= new Date().setHours(0,0,0,0))
      .withMessage('La date d\'arrivée ne peut pas être dans le passé'),
    body('checkOutDate')
      .isISO8601().withMessage('Date de départ invalide')
      .custom((value, { req }) => new Date(value) > new Date(req.body.checkInDate))
      .withMessage('La date de départ doit être après la date d\'arrivée'),
    body('numberOfGuests.adults')
      .isInt({ min: 1 }).withMessage('Il faut au moins 1 adulte'),
    body('numberOfGuests.children')
      .optional()
      .isInt({ min: 0 }).withMessage('Le nombre d\'enfants ne peut pas être négatif'),
    validate // Appel du middleware pour bloquer la requête si une règle échoue
  ],
  bookingController.createBooking
);

router.get(
  '/my-bookings',
  protect,
  bookingController.getMyBookings
);

router.get(
  '/:id',
  protect,
  bookingController.getBooking
);

router.put(
  '/:id/cancel',
  protect,
  bookingController.cancelBooking
);

// Routes protégées (hotelier, admin)
router.get(
  '/hotel/:hotelId',
  protect,
  authorize('hotelier', 'admin'),
  bookingController.getHotelBookings
);

router.put(
  '/:id/status',
  protect,
  authorize('hotelier', 'admin'),
  body('status')
    .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
    .withMessage('Statut invalide'),
  bookingController.updateBookingStatus
);

module.exports = router;