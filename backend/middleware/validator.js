const { validationResult } = require('express-validator');

// Middleware de Validation
// Ce petit bout de code s'insère après les règles de validation (ex: "email requis")
// et avant le contrôleur. Son rôle est de vérifier si les règles ont été respectées.

exports.validate = (req, res, next) => {
  // On récupère la liste des erreurs détectées par express-validator
  const errors = validationResult(req);
  
  // S'il y a des erreurs (la liste n'est pas vide)
  if (!errors.isEmpty()) {
    // On renvoie une erreur 400 (Bad Request) avec la liste des problèmes
    // On formate un peu pour que ce soit plus propre à lire côté frontend
    return res.status(400).json({ 
      success: false,
      errors: errors.array().map(err => ({ field: err.path, message: err.msg })) 
    });
  }
  
  // Si tout est bon (pas d'erreurs), on passe à la suite (le contrôleur)
  next();
};
