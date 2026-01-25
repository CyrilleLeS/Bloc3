const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');

// Contrôleur Réservation (Booking)
// Cœur du système : gère la prise de réservation, l'annulation et la consultation

// --------------------------------------------------------------------------
// CRÉATION
// --------------------------------------------------------------------------

// Créer une nouvelle réservation
// Route: POST /api/bookings
// Accès: Privé (Tout client connecté)
exports.createBooking = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate, numberOfGuests, specialRequests, guestInfo } = req.body;

    // 1. Récupérer les infos de la chambre
    const roomData = await Room.findById(room).populate('hotel');
    if (!roomData) {
      return res.status(404).json({ message: 'Chambre non trouvée' });
    }

    // 2. Vérifier si la chambre est active
    if (!roomData.isAvailable) {
      return res.status(400).json({ message: 'Cette chambre n\'est pas disponible' });
    }

    // 3. Vérifier la disponibilité pour les DATES choisies (pas de conflit)
    const isAvailable = await Booking.checkAvailability(room, checkInDate, checkOutDate);
    if (!isAvailable) {
      return res.status(400).json({ 
        message: 'Cette chambre n\'est pas disponible pour les dates sélectionnées'
      });
    }

    // 4. Vérifier la capacité (Nombre de personnes)
    const totalGuests = (numberOfGuests?.adults || 1) + (numberOfGuests?.children || 0);
    const roomCapacity = roomData.capacity.adults + roomData.capacity.children;
    if (totalGuests > roomCapacity) {
      return res.status(400).json({ 
        message: `Cette chambre ne peut accueillir que ${roomCapacity} personnes` 
      });
    }

    // 5. Tout est bon : Création de la réservation
    const booking = await Booking.create({
      user: req.user.id,        // Le client connecté
      hotel: roomData.hotel._id,
      room,
      checkInDate,
      checkOutDate,
      numberOfGuests: numberOfGuests || { adults: 1, children: 0 },
      roomPrice: roomData.price, // On fixe le prix au moment de la résa
      specialRequests,
      guestInfo: guestInfo || {  // Infos pré-remplies avec le profil
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email
      }
    });

    // 6. On renvoie la résa avec les détails lisibles (nom hôtel, chambre...)
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

// --------------------------------------------------------------------------
// LECTURE
// --------------------------------------------------------------------------

// "Mes Réservations" (Côté Client)
// Route: GET /api/bookings/my-bookings
// Accès: Privé (Client)
exports.getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // On filtre pour ne voir que SES propres réservations
    const filter = { user: req.user.id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(filter)
      .populate('hotel', 'name address images') // Affiche les infos de l\'hôtel
      .populate('room', 'name type price images') // Affiche les infos de la chambre
      .sort({ createdAt: -1 }) // Les plus récentes en premier
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

// Réservations reçues (Côté Hôtelier)
// Route: GET /api/bookings/hotel/:hotelId
// Accès: Privé (Hôtelier proprio)
exports.getHotelBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // Sécurité : On vérifie que l\'hôtel appartient bien à celui qui demande
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
      .populate('user', 'firstName lastName email phone') // L\'hôtelier a besoin des infos du client
      .populate('room', 'name type price')
      .sort({ checkInDate: -1 }) // Tri par date d\'arrivée
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

// Détails d'une réservation unique
// Route: GET /api/bookings/:id
// Accès: Privé (Client concerné ou Hôtelier concerné)
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate('hotel', 'name address phone')
      .populate('room', 'name type price amenities images');

    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    // Vérification des droits d\'accès complexe
    const hotel = await Hotel.findById(booking.hotel);
    const isOwner = booking.user._id.toString() === req.user.id; // C\'est mon booking ?
    const isHotelOwner = hotel.owner.toString() === req.user.id; // C\'est mon hôtel ?
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

// --------------------------------------------------------------------------
// MODIFICATION / ANNULATION
// --------------------------------------------------------------------------

// Annuler une réservation
// Route: PUT /api/bookings/:id/cancel
// Accès: Privé
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    // Droits : Client ou Hôtelier ou Admin
    const hotel = await Hotel.findById(booking.hotel);
    const isOwner = booking.user.toString() === req.user.id;
    const isHotelOwner = hotel.owner.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isHotelOwner && !isAdmin) {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à annuler cette réservation' 
      });
    }

    // Règles d\'annulation
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Cette réservation est déjà annulée' });
    }
    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Impossible d\'annuler une réservation terminée' });
    }

    // Mise à jour
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = req.body.reason || 'Annulée par l\'utilisateur';
    
    // Si c\'était payé, on passe en statut "remboursé" (logique simplifiée)
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

// Mettre à jour le statut (ex: confirmer manuellement)
// Route: PUT /api/bookings/:id/status
// Accès: Privé (Hôtelier)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    // Sécurité : Seul l\'hôtelier décide
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

// Vérifier la disponibilité (Utilitaire public)
// Route: GET /api/bookings/check-availability
// Accès: Public
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
