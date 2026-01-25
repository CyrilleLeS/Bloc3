const stripe = require('../config/stripe');
const Booking = require('../models/Booking');

// Contrôleur Paiements
// Gère l'intégration avec Stripe pour payer les réservations

// --------------------------------------------------------------------------
// CRÉATION INTENTION DE PAIEMENT
// --------------------------------------------------------------------------

// Initialise le processus de paiement avec Stripe
// Route: POST /api/payments/create-payment-intent
// Accès: Privé (Client)
exports.createPaymentIntent = async (req, res) => {
  try {
    const { bookingId } = req.body;

    // 1. Récupération de la réservation
    const booking = await Booking.findById(bookingId)
      .populate('hotel', 'name')
      .populate('room', 'name type');

    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    // 2. Sécurité : C'est bien ma réservation ?
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à payer cette réservation' 
      });
    }

    // 3. Vérifications d'état
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Cette réservation est déjà payée' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Impossible de payer une réservation annulée' });
    }

    // 4. Appel à Stripe pour créer l'intention de paiement
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalPrice * 100), // Stripe fonctionne en centimes (10€ = 1000)
      currency: 'eur',
      metadata: { // On attache des infos utiles pour le suivi
        bookingId: booking._id.toString(),
        hotelName: booking.hotel.name,
        roomName: booking.room.name,
        userId: req.user.id
      },
      description: `Réservation ${booking._id} - ${booking.hotel.name} - ${booking.room.name}`
    });

    // 5. On sauvegarde l'ID Stripe dans la réservation pour faire le lien plus tard
    booking.stripePaymentIntentId = paymentIntent.id;
    await booking.save();

    // 6. On renvoie le "clientSecret" au frontend pour finaliser le paiement
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

// --------------------------------------------------------------------------
// SIMULATION (TEST)
// --------------------------------------------------------------------------

// Simule un paiement réussi (Utile pour tester sans carte bancaire réelle)
// Route: POST /api/payments/simulate
// Accès: Privé
exports.simulatePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('hotel', 'name address')
      .populate('room', 'name type price');

    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    // Sécurité
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

    // Mise à jour directe de la BDD comme si c'était payé
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    booking.stripePaymentIntentId = `pi_simulated_${Date.now()}`; // Faux ID
    await booking.save();

    res.json({
      success: true,
      message: 'Paiement simulé avec succès',
      booking: {
        id: booking._id,
        hotel: booking.hotel.name,
        room: booking.room.name,
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

// --------------------------------------------------------------------------
// REMBOURSEMENT
// --------------------------------------------------------------------------

// Demander un remboursement
// Route: POST /api/payments/refund
// Accès: Privé
exports.requestRefund = async (req, res) => {
  try {
    const { bookingId, reason } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    // Seul le client ou l'admin peut demander le remboursement
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

    // Si c'était un vrai paiement Stripe, on déclenche le remboursement via l'API
    if (booking.stripePaymentIntentId && !booking.stripePaymentIntentId.startsWith('pi_simulated')) {
      await stripe.refunds.create({
        payment_intent: booking.stripePaymentIntentId,
        reason: 'requested_by_customer'
      });
    }

    // Mise à jour BDD
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
