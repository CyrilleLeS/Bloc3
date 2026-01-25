const { validationResult } = require('express-validator');

// Middleware pour vérifier les résultats de la validation
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array().map(err => ({ field: err.path, message: err.msg })) 
    });
  }
  next();
};