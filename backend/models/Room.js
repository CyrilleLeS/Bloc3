const mongoose = require('mongoose');

// Schéma Chambre
// Définit les caractéristiques d'une chambre d'hôtel
const roomSchema = new mongoose.Schema({
  // Lien vers l'hôtel auquel appartient cette chambre
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'L\'hôtel est requis']
  },
  name: {
    type: String,
    required: [true, 'Le nom de la chambre est requis'], // Ex: "Chambre Vue Mer"
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },
  type: {
    type: String,
    required: [true, 'Le type de chambre est requis'],
    // Liste fermée de types possibles
    enum: ['simple', 'double', 'twin', 'suite', 'familiale', 'deluxe']
  },
  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  // Capacité d'accueil
  capacity: {
    adults: {
      type: Number,
      required: true,
      min: 1,
      default: 2
    },
    children: {
      type: Number,
      default: 0
    }
  },
  size: {
    type: Number, // Surface en m²
    min: 0
  },
  bedType: {
    type: String,
    enum: ['simple', 'double', 'queen', 'king', 'twin', 'superpose']
  },
  images: [{
    type: String // URLs des photos
  }],
  // Équipements spécifiques à la chambre
  amenities: [{
    type: String,
    enum: [
      'wifi',
      'tv',
      'climatisation',
      'minibar',
      'coffre_fort',
      'balcon',
      'vue_mer',
      'vue_montagne',
      'baignoire',
      'douche',
      'seche_cheveux',
      'bureau',
      'canape'
    ]
  }],
  // Nombre de chambres de ce type disponibles
  quantity: {
    type: Number,
    required: [true, 'La quantité est requise'],
    min: [1, 'Il faut au moins 1 chambre'],
    default: 1
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Dates auto (création/modif)
});

// Index pour accélérer les recherches fréquentes
// Ex: Trouver rapidement les chambres d'un hôtel spécifique
roomSchema.index({ hotel: 1, type: 1, price: 1 });
roomSchema.index({ isAvailable: 1 });

module.exports = mongoose.model('Room', roomSchema);
