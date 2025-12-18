const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Toutes les routes sont protégées et réservées aux admins
router.use(protect);
router.use(authorize('admin'));

// Validation pour création d'utilisateur
const createUserValidation = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('Le prénom est requis'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Le nom est requis'),
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis')
    .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('role')
    .optional()
    .isIn(['client', 'hotelier', 'admin']).withMessage('Rôle invalide')
];

// Validation pour mise à jour d'utilisateur
const updateUserValidation = [
  body('firstName')
    .optional()
    .trim()
    .notEmpty().withMessage('Le prénom ne peut pas être vide'),
  body('lastName')
    .optional()
    .trim()
    .notEmpty().withMessage('Le nom ne peut pas être vide'),
  body('role')
    .optional()
    .isIn(['client', 'hotelier', 'admin']).withMessage('Rôle invalide'),
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive doit être un booléen')
];

// Dashboard stats
router.get('/stats/dashboard', userController.getDashboardStats);

// CRUD utilisateurs
router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.post('/', createUserValidation, userController.createUser);
router.put('/:id', updateUserValidation, userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;