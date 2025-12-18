const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const { validationResult } = require('express-validator');

//Ce controller gère le booking, donc fera appel aux différents models
//Comme booking, room et hôtels
//
//
//Créer une réservation
//POST /api/bookings
//Private (client)
exports.createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { room, checkInDate, checkOutDate, numberOfGuests, specialRequests, guestInfo } = req.body;

    // Vérifier que la chambre existe
    const roomData = await Room.findById(room).populate('hotel');
    if (!roomData) {
      return res.status(404).json({ message: 'Chambre non trouvée' });
    }

    if (!roomData.isAvailable) {
      return res.status(400).json({ message: 'Cette chambre n\'est pas disponible' });
    }

    // Vérifier la disponibilité pour les dates
    const isAvailable = await Booking.checkAvailability(room, checkInDate, checkOutDate);
    if (!isAvailable) {
      return res.status(400).json({ 
        message: 'Cette chambre n\'est pas disponible pour les dates sélectionnées' 
      });
    }

    // Vérifier la capacité
    const totalGuests = (numberOfGuests?.adults || 1) + (numberOfGuests?.children || 0);
    const roomCapacity = roomData.capacity.adults + roomData.capacity.children;
    if (totalGuests > roomCapacity) {
      return res.status(400).json({ 
        message: `Cette chambre ne peut accueillir que ${roomCapacity} personnes` 
      });
    }

    // Créer la réservation
    const booking = await Booking.create({
      user: req.user.id,
      hotel: roomData.hotel._id,
      room,
      checkInDate,
      checkOutDate,
      numberOfGuests: numberOfGuests || { adults: 1, children: 0 },
      roomPrice: roomData.price,
      specialRequests,
      guestInfo: guestInfo || {
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email
      }
    });

    // Populer les données pour la réponse
    await booking.populate([
      { path: 'hotel', select: 'name address' },
      { path: 'room', select: 'name type price' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès',
      booking
    });
  } catch (error) {
    console.error('Erreur createBooking:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Récupérer les réservations de l'utilisateur connecté
// GET /api/bookings/my-bookings
// Private (client)
exports.getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { user: req.user.id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(filter)
      .populate('hotel', 'name address images')
      .populate('room', 'name type price images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      bookings
    });
  } catch (error) {
    console.error('Erreur getMyBookings:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Récupérer les réservations d'un hôtel (pour hotelier)
// GET /api/bookings/hotel/:hotelId
// Private (hotelier, admin)
exports.getHotelBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // Vérifier que l'hôtel appartient à l'utilisateur
    const hotel = await Hotel.findById(req.params.hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Hôtel non trouvé' });
    }

    if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à voir ces réservations' 
      });
    }

    const filter = { hotel: req.params.hotelId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(filter)
      .populate('user', 'firstName lastName email phone')
      .populate('room', 'name type price')
      .sort({ checkInDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      bookings
    });
  } catch (error) {
    console.error('Erreur getHotelBookings:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Récupérer une réservation par ID
// GET /api/bookings/:id
// Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate('hotel', 'name address phone')
      .populate('room', 'name type price amenities images');

    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    // Vérifier les droits d'accès
    const hotel = await Hotel.findById(booking.hotel);
    const isOwner = booking.user._id.toString() === req.user.id;
    const isHotelOwner = hotel.owner.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isHotelOwner && !isAdmin) {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à voir cette réservation' 
      });
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error('Erreur getBooking:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Annuler une réservation
// PUT /api/bookings/:id/cancel
// Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    // Vérifier les droits
    const hotel = await Hotel.findById(booking.hotel);
    const isOwner = booking.user.toString() === req.user.id;
    const isHotelOwner = hotel.owner.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isHotelOwner && !isAdmin) {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à annuler cette réservation' 
      });
    }

    // Vérifier si l'annulation est possible
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Cette réservation est déjà annulée' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Impossible d\'annuler une réservation terminée' });
    }

    // Annuler la réservation
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = req.body.reason || 'Annulée par l\'utilisateur';
    
    // Si paiement effectué, marquer pour remboursement
    if (booking.paymentStatus === 'paid') {
      booking.paymentStatus = 'refunded';
    }

    await booking.save();

    res.json({
      success: true,
      message: 'Réservation annulée avec succès',
      booking
    });
  } catch (error) {
    console.error('Erreur cancelBooking:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Mettre à jour le statut d'une réservation (hotelier/admin)
// PUT /api/bookings/:id/status
// Private (hotelier, admin)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    // Vérifier les droits
    const hotel = await Hotel.findById(booking.hotel);
    if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à modifier cette réservation' 
      });
    }

    booking.status = status;
    await booking.save();

    res.json({
      success: true,
      message: 'Statut mis à jour',
      booking
    });
  } catch (error) {
    console.error('Erreur updateBookingStatus:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Vérifier la disponibilité d'une chambre
// GET /api/bookings/check-availability
// Public
exports.checkAvailability = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut } = req.query;

    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({ 
        message: 'roomId, checkIn et checkOut sont requis' 
      });
    }

    const isAvailable = await Booking.checkAvailability(roomId, checkIn, checkOut);

    res.json({
      success: true,
      available: isAvailable,
      roomId,
      checkIn,
      checkOut
    });
  } catch (error) {
    console.error('Erreur checkAvailability:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};