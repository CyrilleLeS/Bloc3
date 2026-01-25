const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validator');
const { protect } = require('../middleware/auth');

// Validation pour l'inscription
const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('Le prénom est requis')
    .isLength({ max: 50 }).withMessage('Le prénom ne peut pas dépasser 50 caractères'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ max: 50 }).withMessage('Le nom ne peut pas dépasser 50 caractères'),
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Veuillez fournir un email valide')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis')
    .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('role')
    .optional()
    .isIn(['client', 'hotelier']).withMessage('Rôle invalide')
];

// Validation pour la connexion
const loginValidation = [
body('email')
  .isEmail().withMessage('Email invalide')
  .matches(/\.(com|fr|net|org|be|ch|edu|gov)$/i)
  .withMessage('L\'email doit se terminer par une extension autorisée (.com, .fr, .net, .org, .be, .ch, .edu, .gov)')
  .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis')
];

// Routes publiques
router.post('/register',
  [
    body('firstName').trim().notEmpty().withMessage('Le prénom est requis'),
    body('lastName').trim().notEmpty().withMessage('Le nom est requis'),
    body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit faire 6 caractères minimum'),
    validate
  ],
  authController.register
);
router.post('/login',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Le mot de passe est requis'),
    validate
  ],
  authController.login
);

// Routes protégées
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);

module.exports = router;