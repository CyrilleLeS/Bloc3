const User = require('../models/User');
const { validationResult } = require('express-validator');

// Controller qui gère l'Inscription d'un utilisateur
// La route sera --> POST /api/auth/register
// L'acces sera Public
// On fait appel au model user et à express-validator
// le reste fonctionnera sur le même principe
exports.register = async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, role, phone } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Un compte avec cet email existe déjà.' 
      });
    }

    // Créer l'utilisateur
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'client',
      phone
    });

    // Générer le token
    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'inscription.',
      error: error.message 
    });
  }
};

//Connexion d'un utilisateur
//POST /api/auth/login
//Public
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe (inclure le password)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        message: 'Email ou mot de passe incorrect.' 
      });
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Ce compte a été désactivé.' 
      });
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Email ou mot de passe incorrect.' 
      });
    }

    // Générer le token
    const token = user.generateAuthToken();

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la connexion.',
      error: error.message 
    });
  }
};

//Obtenir le profil de l'utilisateur connecté
//GET /api/auth/profile
//Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Erreur profil:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération du profil.' 
    });
  }
};

//Mettre à jour le profil
//PUT /api/auth/profile
//Private
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, phone },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profil mis à jour',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour du profil.' 
    });
  }
};