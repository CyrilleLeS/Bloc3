//création du model pour les hotels, je fait encore une fois appel à mangoose pour la bdd
//ce model est crée uniquement pour quelques hôtels que je mettrais moi même
//le reste sera gérer par l'api amadeus

const mongoose = require('mongoose');

//valeurs d'un hôtel comme son nom, sa desc etc... comme avec les autres modèles, nbre de caractères limités
//min/max pour certains champs, des valeurs par défaut pour d'autres et une énum pour d'autres

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de l\'hôtel est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
  },
  address: {
    street: {
      type: String,
      required: [true, 'L\'adresse est requise']
    },
    city: {
      type: String,
      required: [true, 'La ville est requise']
    },
    zipCode: {
      type: String,
      required: [true, 'Le code postal est requis']
    },
    country: {
      type: String,
      required: [true, 'Le pays est requis'],
      default: 'France'
    }
  },
  images: [{
    type: String
  }],
  amenities: [{
    type: String,
    enum: [
      'wifi',
      'parking',
      'restaurant',
      'bar',
      'piscine',
      'spa',
      'salle_sport',
      'climatisation',
      'room_service',
      'reception_24h',
      'navette_aeroport',
      'animaux_acceptes'
    ]
  }],
  stars: {
    type: Number,
    min: [1, 'Minimum 1 étoile'],
    max: [5, 'Maximum 5 étoiles'],
    default: 3
  },
  rating: {
    type: Number,
    min: [0, 'Note minimum 0'],
    max: [5, 'Note maximum 5'],
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le propriétaire est requis']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual pour récupérer les chambres de l'hôtel
hotelSchema.virtual('rooms', {
  ref: 'Room',
  localField: '_id',
  foreignField: 'hotel',
  justOne: false
});

// Index pour la recherche
hotelSchema.index({ 'address.city': 1, stars: 1, rating: -1 });
hotelSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Hotel', hotelSchema);