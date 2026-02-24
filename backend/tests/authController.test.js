const authController = require('../controllers/authController');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Mock (simulation) du modèle User
jest.mock('../models/User');

// Mock de express-validator
jest.mock('express-validator', () => ({
  validationResult: jest.fn()
}));

describe('Auth Controller - Tests Unitaires', () => {
  let req, res;

  // Avant chaque test, on réinitialise les objets req et res
  beforeEach(() => {
    req = {
      body: {},
      user: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('register (Inscription)', () => {
    it('devrait créer un utilisateur et retourner un token (Succès)', async () => {
      // --- Arrange (Préparation) ---
      req.body = {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        password: 'password123'
      };

      // Simuler qu'il n'y a pas d'erreurs de validation
      validationResult.mockReturnValue({ isEmpty: () => true });
      
      // Simuler que l'utilisateur n'existe pas encore
      User.findOne.mockResolvedValue(null);
      
      // Simuler la création réussie
      const mockUser = {
        _id: 'userid123',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        role: 'client',
        generateAuthToken: jest.fn().mockReturnValue('mock-token')
      };
      User.create.mockResolvedValue(mockUser);

      // --- Act (Action) ---
      await authController.register(req, res);

      // --- Assert (Vérification) ---
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        token: 'mock-token',
        message: 'Inscription réussie'
      }));
    });

    it('devrait échouer si l&apos;email est déjà utilisé', async () => {
      // --- Arrange ---
      req.body = { email: 'existant@example.com' };
      validationResult.mockReturnValue({ isEmpty: () => true });
      
      // Simuler qu'un utilisateur est trouvé avec cet email
      User.findOne.mockResolvedValue({ email: 'existant@example.com' });

      // --- Act ---
      await authController.register(req, res);

      // --- Assert ---
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Un compte avec cet email existe déjà.'
      }));
    });
  });

  describe('login (Connexion)', () => {
    it('devrait connecter l &apos; utilisateur avec des identifiants valides', async () => {
      // --- Arrange ---
      req.body = { email: 'jean@example.com', password: 'password123' };
      validationResult.mockReturnValue({ isEmpty: () => true });

      const mockUser = {
        _id: 'userid123',
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true),
        generateAuthToken: jest.fn().mockReturnValue('mock-token'),
        // Simuler la méthode select('+password')
        select: jest.fn().mockReturnThis() 
      };
      
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      // --- Act ---
      await authController.login(req, res);

      // --- Assert ---
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        token: 'mock-token'
      }));
    });

    it('devrait échouer si le mot de passe est incorrect', async () => {
      // --- Arrange ---
      req.body = { email: 'jean@example.com', password: 'mauvais-password' };
      validationResult.mockReturnValue({ isEmpty: () => true });

      const mockUser = {
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(false),
        select: jest.fn().mockReturnThis()
      };
      
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      // --- Act ---
      await authController.login(req, res);

      // --- Assert ---
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Email ou mot de passe incorrect.'
      }));
    });
  });
});
