// Création du model user. On fait appel à mongoose, bcrypt et jwt, donc la bdd et le cryptage des mdp
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Création de l'utilisateur et ses valeurs: le trim supprimera les espaces et les blancs
//on définit le minumum de caractères, une obligation de format pour le mail
//on définit aussi un rôle par défaut de l'user et un timestamp pour la creation/update du compte

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true,
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
    unique: true,
    lowercase: true,
    trim: true,
    // La regex ci-dessous autorise .com, .fr, .net, .org, .be, .ch, .edu et .gov
    match: [
      /^\S+@\S+\.(com|fr|net|org|be|ch|edu|gov)$/i, 
      'Veuillez fournir un email valide se terminant par une extension autorisée (.com, .fr, .net, .org, .be, .ch, .edu, .gov)'
    ]
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false // Ne pas retourner le password par défaut
  },
  role: {
    type: String,
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
  timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

// Hasher le mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour générer un JWT
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

module.exports = mongoose.model('User', userSchema);