const stripe = require('../config/stripe');
const Booking = require('../models/Booking');

//Ce controller gère le côté paiements
//Il fera appel à la config stripe entre autres

// Créer une intention de paiement
// POST /api/payments/create-payment-intent
// Private (client)
exports.createPaymentIntent = async (req, res) => {
  try {
    const { bookingId } = req.body;

    // Récupérer la réservation
    const booking = await Booking.findById(bookingId)
      .populate('hotel', 'name')
      .populate('room', 'name type');

    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    // Vérifier que l'utilisateur est le propriétaire de la réservation
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à payer cette réservation' 
      });
    }

    // Vérifier que la réservation n'est pas déjà payée
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Cette réservation est déjà payée' });
    }

    // Vérifier que la réservation n'est pas annulée
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Impossible de payer une réservation annulée' });
    }

    // Créer l'intention de paiement Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalPrice * 100), // Stripe utilise les centimes
      currency: 'eur',
      metadata: {
        bookingId: booking._id.toString(),
        hotelName: booking.hotel.name,
        roomName: booking.room.name,
        userId: req.user.id
      },
      description: `Réservation ${booking._id} - ${booking.hotel.name} - ${booking.room.name}`
    });

    // Sauvegarder l'ID du PaymentIntent
    booking.stripePaymentIntentId = paymentIntent.id;
    await booking.save();

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: booking.totalPrice,
      currency: 'eur'
    });
  } catch (error) {
    console.error('Erreur createPaymentIntent:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Confirmer le paiement (simulation)
// POST /api/payments/confirm
// Private (client)
exports.confirmPayment = async (req, res) => {
  try {
    const { bookingId, paymentIntentId } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à confirmer ce paiement' 
      });
    }

    // Vérifier le statut du paiement auprès de Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      await booking.save();

      res.json({
        success: true,
        message: 'Paiement confirmé avec succès',
        booking: {
          id: booking._id,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          totalPrice: booking.totalPrice
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Le paiement n\'a pas été effectué',
        paymentStatus: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Erreur confirmPayment:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Simuler un paiement réussi (pour tests sans Stripe frontend)
// POST /api/payments/simulate
// Private (client)
exports.simulatePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('hotel', 'name address')
      .populate('room', 'name type price');

    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à effectuer ce paiement' 
      });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Cette réservation est déjà payée' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Impossible de payer une réservation annulée' });
    }

    // Simuler le paiement réussi
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    booking.stripePaymentIntentId = `pi_simulated_${Date.now()}`;
    await booking.save();

    res.json({
      success: true,
      message: 'Paiement simulé avec succès',
      booking: {
        id: booking._id,
        hotel: booking.hotel.name,
        room: booking.room.name,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        numberOfNights: booking.numberOfNights,
        totalPrice: booking.totalPrice,
        status: booking.status,
        paymentStatus: booking.paymentStatus
      }
    });
  } catch (error) {
    console.error('Erreur simulatePayment:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Demander un remboursement
// POST /api/payments/refund
// Private (client, admin)
exports.requestRefund = async (req, res) => {
  try {
    const { bookingId, reason } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    const isOwner = booking.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à demander ce remboursement' 
      });
    }

    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({ 
        message: 'Seules les réservations payées peuvent être remboursées' 
      });
    }

    // Si paiement réel Stripe, effectuer le remboursement
    if (booking.stripePaymentIntentId && !booking.stripePaymentIntentId.startsWith('pi_simulated')) {
      await stripe.refunds.create({
        payment_intent: booking.stripePaymentIntentId,
        reason: 'requested_by_customer'
      });
    }

    // Mettre à jour la réservation
    booking.paymentStatus = 'refunded';
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason || 'Remboursement demandé';
    await booking.save();

    res.json({
      success: true,
      message: 'Remboursement effectué avec succès',
      booking: {
        id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        refundedAmount: booking.totalPrice
      }
    });
  } catch (error) {
    console.error('Erreur requestRefund:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};