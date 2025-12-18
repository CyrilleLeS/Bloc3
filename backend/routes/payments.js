const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Toutes les routes sont protégées
router.use(protect);

// Créer une intention de paiement Stripe
router.post(
  '/create-payment-intent',
  body('bookingId')
    .notEmpty().withMessage('L\'ID de réservation est requis')
    .isMongoId().withMessage('ID de réservation invalide'),
  paymentController.createPaymentIntent
);

// Confirmer le paiement après traitement Stripe
router.post(
  '/confirm',
  body('bookingId').notEmpty().isMongoId(),
  body('paymentIntentId').notEmpty().withMessage('L\'ID du PaymentIntent est requis'),
  paymentController.confirmPayment
);

// Simuler un paiement (pour tests)
router.post(
  '/simulate',
  body('bookingId')
    .notEmpty().withMessage('L\'ID de réservation est requis')
    .isMongoId().withMessage('ID de réservation invalide'),
  paymentController.simulatePayment
);

// Demander un remboursement
router.post(
  '/refund',
  body('bookingId')
    .notEmpty().withMessage('L\'ID de réservation est requis')
    .isMongoId().withMessage('ID de réservation invalide'),
  body('reason')
    .optional()
    .isLength({ max: 500 }).withMessage('La raison ne peut pas dépasser 500 caractères'),
  paymentController.requestRefund
);

module.exports = router;