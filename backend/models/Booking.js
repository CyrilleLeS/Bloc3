const mongoose = require('mongoose');

// Schéma Réservation (Booking)
// Stocke toutes les infos d'une réservation faite par un client
const bookingSchema = new mongoose.Schema({
  // Qui a réservé ?
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'utilisateur est requis']
  },
  // Quel hôtel ?
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'L\'hôtel est requis']
  },
  // Quelle chambre ?
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'La chambre est requise']
  },
  // Dates
  checkInDate: {
    type: Date,
    required: [true, 'La date d\'arrivée est requise']
  },
  checkOutDate: {
    type: Date,
    required: [true, 'La date de départ est requise']
  },
  numberOfNights: {
    type: Number // Calculé automatiquement
  },
  // Détails des occupants
  numberOfGuests: {
    adults: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    children: {
      type: Number,
      default: 0
    }
  },
  // Prix
  roomPrice: {
    type: Number, // Prix unitaire au moment de la résa
    required: true
  },
  totalPrice: {
    type: Number // Prix total calculé (nuits * prix)
  },
  // État de la réservation
  status: {
    type: String,
    // pending: en attente, confirmed: validée, cancelled: annulée, completed: séjour fini
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  // État du paiement
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'cash'],
    default: 'stripe'
  },
  stripePaymentIntentId: {
    type: String // ID technique du paiement Stripe
  },
  specialRequests: {
    type: String,
    maxlength: [500, 'Les demandes spéciales ne peuvent pas dépasser 500 caractères']
  },
  // Infos de contact (si différentes du compte user)
  guestInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String
  },
  // En cas d'annulation
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String
  }
}, {
  timestamps: true
});

// Calcul automatique avant validation (Hooks)
// 1. Calcule le nombre de nuits et le prix total
bookingSchema.pre('validate', function(next) {
  if (this.checkInDate && this.checkOutDate) {
    // Différence en millisecondes convertie en jours
    const diffTime = Math.abs(new Date(this.checkOutDate) - new Date(this.checkInDate));
    this.numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (this.roomPrice) {
      this.totalPrice = this.numberOfNights * this.roomPrice;
    }
  }
  next();
});

// 2. Vérifie la logique des dates
bookingSchema.pre('validate', function(next) {
  if (this.checkOutDate <= this.checkInDate) {
    const error = new Error('La date de départ doit être après la date d\'arrivée');
    next(error);
  }
  next();
});

// Index pour optimiser les recherches
bookingSchema.index({ user: 1, status: 1 }); // Pour "Mes réservations"
bookingSchema.index({ hotel: 1, status: 1 }); // Pour le dashboard hôtelier
bookingSchema.index({ room: 1, checkInDate: 1, checkOutDate: 1 }); // Pour vérifier les conflits

// Fonction utilitaire pour vérifier si une chambre est libre
// "static" veut dire qu'on l'appelle sur le Modèle (Booking.checkAvailability) et pas sur une instance
bookingSchema.statics.checkAvailability = async function(roomId, checkIn, checkOut, excludeBookingId = null) {
  // On cherche une réservation qui chevauche les dates demandées
  const query = {
    room: roomId,
    status: { $nin: ['cancelled'] }, // On ignore les réservations annulées
    $or: [
      {
        // Logique de chevauchement de dates
        checkInDate: { $lt: new Date(checkOut) },
        checkOutDate: { $gt: new Date(checkIn) }
      }
    ]
  };

  // Si on modifie une résa existante, on ne la compte pas en conflit avec elle-même
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBookings = await this.find(query);
  // Si le tableau est vide, c'est libre !
  return conflictingBookings.length === 0;
};

module.exports = mongoose.model('Booking', bookingSchema);
