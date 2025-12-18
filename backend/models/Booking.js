const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'utilisateur est requis']
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'L\'hôtel est requis']
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'La chambre est requise']
  },
  checkInDate: {
    type: Date,
    required: [true, 'La date d\'arrivée est requise']
  },
  checkOutDate: {
    type: Date,
    required: [true, 'La date de départ est requise']
  },
  numberOfNights: {
    type: Number
  },
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
  roomPrice: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
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
    type: String
  },
  specialRequests: {
    type: String,
    maxlength: [500, 'Les demandes spéciales ne peuvent pas dépasser 500 caractères']
  },
  guestInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String
  }
}, {
  timestamps: true
});

// Calculer le nombre de nuits et le prix total avant validation
bookingSchema.pre('validate', function(next) {
  if (this.checkInDate && this.checkOutDate) {
    const diffTime = Math.abs(new Date(this.checkOutDate) - new Date(this.checkInDate));
    this.numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (this.roomPrice) {
      this.totalPrice = this.numberOfNights * this.roomPrice;
    }
  }
  next();
});

// Validation: checkOutDate doit être après checkInDate
bookingSchema.pre('validate', function(next) {
  if (this.checkOutDate <= this.checkInDate) {
    const error = new Error('La date de départ doit être après la date d\'arrivée');
    next(error);
  }
  next();
});

// Index pour les recherches
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ hotel: 1, status: 1 });
bookingSchema.index({ room: 1, checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ createdAt: -1 });

// Méthode statique pour vérifier la disponibilité
bookingSchema.statics.checkAvailability = async function(roomId, checkIn, checkOut, excludeBookingId = null) {
  const query = {
    room: roomId,
    status: { $nin: ['cancelled'] },
    $or: [
      {
        checkInDate: { $lt: new Date(checkOut) },
        checkOutDate: { $gt: new Date(checkIn) }
      }
    ]
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBookings = await this.find(query);
  return conflictingBookings.length === 0;
};

module.exports = mongoose.model('Booking', bookingSchema);