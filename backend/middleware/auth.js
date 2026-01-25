const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware d'Authentification (Protection des routes)
// Ce fichier sert de "vigile" : il vérifie que l'utilisateur est bien connecté
// avant de le laisser accéder à certaines pages ou données privées.

// 1. Fonction pour protéger une route (Vérification du Token)
exports.protect = async (req, res, next) => {
  try {
    let token;

    // On regarde si la requête contient un "Authorization: Bearer <token>"
    // C'est le standard pour envoyer un token JWT
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // On récupère juste la partie token (après "Bearer ")
      token = req.headers.authorization.split(' ')[1];
    }

    // Si pas de token, on bloque l'accès immédiatement
    if (!token) {
      return res.status(401).json({ 
        message: 'Accès non autorisé. Veuillez vous connecter.' 
      });
    }

    // On vérifie si le token est valide (signature, date d'expiration)
    // grâce à notre clé secrète (JWT_SECRET)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Si le token est bon, on cherche l'utilisateur dans la base de données
    // pour être sûr qu'il existe toujours
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ 
        message: 'Utilisateur non trouvé.' 
      });
    }

    // On vérifie aussi si le compte n'a pas été désactivé
    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Ce compte a été désactivé.' 
      });
    }

    // IMPORTANT : On attache les infos de l'utilisateur à la requête
    // Comme ça, les prochaines fonctions sauront QUI fait la demande (req.user)
    req.user = user;
    
    // On laisse passer la requête à la suite
    next();
  } catch (error) {
    // Si le token est faux ou expiré
    return res.status(401).json({ 
      message: 'Token invalide ou expiré.' 
    });
  }
};

// 2. Fonction pour restreindre l'accès à certains rôles (Autorisation)
// Exemple : authorize('admin', 'hotelier') laissera passer les admins et hôteliers, mais bloquera les clients
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // On vérifie si le rôle de l'utilisateur connecté fait partie des rôles autorisés
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Le rôle '${req.user.role}' n'est pas autorisé à accéder à cette ressource.` 
      });
    }
    // Si c'est bon, on continue
    next();
  };
};
