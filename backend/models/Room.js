//Création du model pour les chambres, je fais appel à mongoose pour la bdd
const mongoose = require('mongoose');

//Création des valeurs d'une chambre comme son hôtel, son nom, sa description etc.. etc...
//Nombre de caractères limités pour certains champs, obligations pour d'autres
//timestamp aussi pour ce model

const roomSchema = new mongoose.Schema({
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'L\'hôtel est requis']
  },
  name: {
    type: String,
    required: [true, 'Le nom de la chambre est requis'],
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
    enum: ['simple', 'double', 'twin', 'suite', 'familiale', 'deluxe']
  },
  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
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
    type: Number, // en m²
    min: 0
  },
  bedType: {
    type: String,
    enum: ['simple', 'double', 'queen', 'king', 'twin', 'superpose']
  },
  images: [{
    type: String
  }],
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
  timestamps: true
});

// Index pour les recherches
roomSchema.index({ hotel: 1, type: 1, price: 1 });
roomSchema.index({ isAvailable: 1 });

module.exports = mongoose.model('Room', roomSchema);