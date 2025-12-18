const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const roomController = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/auth');

// Validation pour création/modification de chambre
const roomValidation = [
  body('hotel')
    .notEmpty().withMessage('L\'ID de l\'hôtel est requis')
    .isMongoId().withMessage('ID d\'hôtel invalide'),
  body('name')
    .trim()
    .notEmpty().withMessage('Le nom de la chambre est requis')
    .isLength({ max: 100 }).withMessage('Le nom ne peut pas dépasser 100 caractères'),
  body('type')
    .notEmpty().withMessage('Le type de chambre est requis')
    .isIn(['simple', 'double', 'twin', 'suite', 'familiale', 'deluxe'])
    .withMessage('Type de chambre invalide'),
  body('price')
    .notEmpty().withMessage('Le prix est requis')
    .isFloat({ min: 0 }).withMessage('Le prix doit être positif'),
  body('capacity.adults')
    .optional()
    .isInt({ min: 1 }).withMessage('La capacité adultes doit être au moins 1'),
  body('quantity')
    .optional()
    .isInt({ min: 1 }).withMessage('La quantité doit être au moins 1')
];

// Routes publiques
router.get('/hotel/:hotelId', roomController.getRoomsByHotel);
router.get('/:id', roomController.getRoom);

// Routes protégées (hotelier et admin)
router.post(
  '/',
  protect,
  authorize('hotelier', 'admin'),
  roomValidation,
  roomController.createRoom
);

router.put(
  '/:id',
  protect,
  authorize('hotelier', 'admin'),
  roomController.updateRoom
);

router.delete(
  '/:id',
  protect,
  authorize('hotelier', 'admin'),
  roomController.deleteRoom
);

module.exports = router;