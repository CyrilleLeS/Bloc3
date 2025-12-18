const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const hotelController = require('../controllers/hotelController');
const { protect, authorize } = require('../middleware/auth');

// Validation pour création/modification d'hôtel
const hotelValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Le nom de l\'hôtel est requis')
    .isLength({ max: 100 }).withMessage('Le nom ne peut pas dépasser 100 caractères'),
  body('description')
    .trim()
    .notEmpty().withMessage('La description est requise')
    .isLength({ max: 2000 }).withMessage('La description ne peut pas dépasser 2000 caractères'),
  body('address.street')
    .trim()
    .notEmpty().withMessage('L\'adresse est requise'),
  body('address.city')
    .trim()
    .notEmpty().withMessage('La ville est requise'),
  body('address.zipCode')
    .trim()
    .notEmpty().withMessage('Le code postal est requis'),
  body('address.country')
    .optional()
    .trim(),
  body('stars')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Les étoiles doivent être entre 1 et 5'),
  body('amenities')
    .optional()
    .isArray().withMessage('Les équipements doivent être un tableau')
];

// Routes publiques
router.get('/', hotelController.getHotels);
router.get('/:id', hotelController.getHotel);

// Routes protégées (hotelier et admin)
router.post(
  '/',
  protect,
  authorize('hotelier', 'admin'),
  hotelValidation,
  hotelController.createHotel
);

router.put(
  '/:id',
  protect,
  authorize('hotelier', 'admin'),
  hotelController.updateHotel
);

router.delete(
  '/:id',
  protect,
  authorize('hotelier', 'admin'),
  hotelController.deleteHotel
);

// Route pour récupérer ses propres hôtels (hotelier)
router.get(
  '/user/my-hotels',
  protect,
  authorize('hotelier', 'admin'),
  hotelController.getMyHotels
);

module.exports = router;