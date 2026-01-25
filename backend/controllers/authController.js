const User = require('../models/User');
const { validationResult } = require('express-validator');

// Contrôleur d'Authentification
// Gère tout ce qui concerne l'inscription, la connexion et le profil utilisateur

// --------------------------------------------------------------------------
// INSCRIPTION
// --------------------------------------------------------------------------
// Route: POST /api/auth/register
// Accès: Public
exports.register = async (req, res) => {
  try {
    // 1. Vérification des erreurs de validation (format email, mdp court, etc.)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, role, phone } = req.body;

    // 2. On vérifie si l'email est déjà pris
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Un compte avec cet email existe déjà.' 
      });
    }

    // 3. Création du nouvel utilisateur en base de données
    const user = await User.create({
      firstName,
      lastName,
      email,
      password, // Sera automatiquement crypté grâce au modèle User
      role: role || 'client', // Par défaut, c'est un client
      phone
    });

    // 4. Génération immédiate d'un token pour qu'il soit connecté direct
    const token = user.generateAuthToken();

    // 5. Réponse succès
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

// --------------------------------------------------------------------------
// CONNEXION
// --------------------------------------------------------------------------
// Route: POST /api/auth/login
// Accès: Public
exports.login = async (req, res) => {
  try {
    // Vérif erreurs validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // 1. On cherche l'utilisateur par son email
    // .select('+password') est nécessaire car par défaut le mdp est masqué
    const user = await User.findOne({ email }).select('+password');
    
    // Si utilisateur pas trouvé
    if (!user) {
      return res.status(401).json({ 
        message: 'Email ou mot de passe incorrect.' 
      });
    }

    // 2. Vérif si le compte est actif
    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Ce compte a été désactivé.' 
      });
    }

    // 3. Vérification du mot de passe (comparaison hash)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Email ou mot de passe incorrect.' 
      });
    }

    // 4. Tout est bon, on génère le token
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

// --------------------------------------------------------------------------
// PROFIL UTILISATEUR
// --------------------------------------------------------------------------
// Route: GET /api/auth/profile
// Accès: Privé (Connecté)
exports.getProfile = async (req, res) => {
  try {
    // req.user.id vient du middleware "protect" qui a décodé le token
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

// Mettre à jour son propre profil
// Route: PUT /api/auth/profile
// Accès: Privé
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;

    // Mise à jour des champs autorisés
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, phone },
      { new: true, runValidators: true } // new: true renvoie l'objet mis à jour
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
