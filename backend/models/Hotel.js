const mongoose = require('mongoose');

// Modèle de données pour un Hôtel (MongoDB)
// Définit la structure des données qui seront stockées dans la base de données.
// Ce modèle est utilisé pour les hôtels gérés directement par notre plateforme.

const hotelSchema = new mongoose.Schema({
  // Le nom de l'hôtel
  name: {
    type: String,
    required: [true, 'Le nom de l\'hôtel est requis'], // Champ obligatoire
    trim: true, // Enlève les espaces inutiles au début et à la fin
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  
  // Description détaillée
  description: {
    type: String,
    required: [true, 'La description est requise'],
    maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
  },
  
  // Adresse complète (objet imbriqué)
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
  
  // Liste des URLs des images
  images: [
    {
      type: String
    }
  ],
  
  // Liste des équipements (WiFi, Parking, etc.)
  // On limite les choix possibles avec "enum" pour éviter les erreurs
  amenities: [
    {
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
    }
  ],
  
  // Nombre d'étoiles (1 à 5)
  stars: {
    type: Number,
    min: [1, 'Minimum 1 étoile'],
    max: [5, 'Maximum 5 étoiles'],
    default: 3
  },
  
  // Note moyenne donnée par les utilisateurs (0 à 5)
  rating: {
    type: Number,
    min: [0, 'Note minimum 0'],
    max: [5, 'Note maximum 5'],
    default: 0
  },
  
  // Nombre total d'avis reçus
  totalReviews: {
    type: Number,
    default: 0
  },
  
  // Lien vers l'utilisateur propriétaire de l'hôtel (Relation avec la table Users)
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le propriétaire est requis']
  },
  
  // Si l'hôtel est visible ou non sur le site
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true, // Ajoute automatiquement les champs createdAt et updatedAt
  toJSON: { virtuals: true }, // Permet d\'inclure les champs virtuels lors de la conversion en JSON
  toObject: { virtuals: true }
});

// Champ Virtuel : "rooms"
// Ce champ n'est pas stocké physiquement dans la collection "Hotels".
// Il permet de faire le lien inverse : récupérer toutes les chambres qui ont cet hôtel comme parent.
hotelSchema.virtual('rooms', {
  ref: 'Room',
  localField: '_id',
  foreignField: 'hotel',
  justOne: false // Un hôtel a plusieurs chambres (tableau)
});

// Indexation pour optimiser la recherche rapide par ville, étoiles et note
hotelSchema.index({ 'address.city': 1, stars: 1, rating: -1 });
// Index textuel pour la recherche par mots-clés dans le nom et la description
hotelSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Hotel', hotelSchema);
