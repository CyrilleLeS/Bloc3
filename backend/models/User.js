const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Pour crypter les mots de passe
const jwt = require('jsonwebtoken'); // Pour créer les jetons de connexion

// Schéma Utilisateur
// Définit à quoi ressemble un utilisateur dans notre base de données
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true, // Supprime les espaces au début et à la fin
    maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true, // Impossible d'avoir deux comptes avec le même email
    lowercase: true,
    trim: true,
    // Regex pour valider le format de l'email (doit ressembler à x@y.z)
    match: [
      /^S+@S+\.(com|fr|net|org|be|ch|edu|gov)$/i, 
      'Veuillez fournir un email valide (.com, .fr, etc.)'
    ]
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false // Sécurité : ne renvoie pas le mot de passe quand on demande l'utilisateur
  },
  role: {
    type: String,
    // Trois rôles possibles : client (base), hotelier (gère des hôtels), admin (tout puissant)
    enum: ['client', 'hotelier', 'admin'],
    default: 'client'
  },
  phone: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Ajoute automatiquement les dates de création et modification
});

// Middleware "pre-save" : S'exécute juste avant de sauvegarder l'utilisateur en BDD
userSchema.pre('save', async function(next) {
  // Si le mot de passe n'a pas été modifié, on ne fait rien
  if (!this.isModified('password')) {
    return next();
  }
  // Sinon, on crypte le mot de passe pour ne jamais le stocker en clair
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour vérifier un mot de passe lors de la connexion
// Compare le mot de passe fourni avec celui crypté en BDD
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour générer un Token (JWT)
// Ce token servira de "badge d'accès" pour l'utilisateur une fois connecté
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role }, // On met l'ID et le rôle dans le token
    process.env.JWT_SECRET,            // On signe avec notre clé secrète
    { expiresIn: process.env.JWT_EXPIRE } // Durée de validité
  );
};

module.exports = mongoose.model('User', userSchema);
