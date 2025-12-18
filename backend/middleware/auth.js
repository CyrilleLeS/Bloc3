const jwt = require('jsonwebtoken');
const User = require('../models/User');

//Ce middleware fait le pont entre jwt et le model user
//Il recupère le token utilisateur, vérifie si il est correct
//Suivant les cas, différentes réponses envoyées

// Vérifier si l'utilisateur est authentifié
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Récupérer le token du header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        message: 'Accès non autorisé. Veuillez vous connecter.' 
      });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ 
        message: 'Utilisateur non trouvé.' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Ce compte a été désactivé.' 
      });
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ 
      message: 'Token invalide ou expiré.' 
    });
  }
};

// Vérifier les rôles autorisés
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Le rôle '${req.user.role}' n'est pas autorisé à accéder à cette ressource.` 
      });
    }
    next();
  };
};