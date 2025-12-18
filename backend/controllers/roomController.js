const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const { validationResult } = require('express-validator');

//Ce controller gère les chambres (création, maj, del, ID etc...)
//Il fera appel aux models room et hôtels

// Récupérer toutes les chambres d'un hôtel
// GET /api/rooms/hotel/:hotelId
// Public
exports.getRoomsByHotel = async (req, res) => {
  try {
    const { type, minPrice, maxPrice, capacity } = req.query;
    
    const filter = { hotel: req.params.hotelId, isAvailable: true };
    
    if (type) filter.type = type;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (capacity) filter['capacity.adults'] = { $gte: parseInt(capacity) };

    const rooms = await Room.find(filter)
      .populate('hotel', 'name address')
      .sort({ price: 1 });

    res.json({
      success: true,
      count: rooms.length,
      rooms
    });
  } catch (error) {
    console.error('Erreur getRoomsByHotel:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Récupérer une chambre par ID
// GET /api/rooms/:id
// Public
exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('hotel', 'name address amenities stars');

    if (!room) {
      return res.status(404).json({ message: 'Chambre non trouvée' });
    }

    res.json({ success: true, room });
  } catch (error) {
    console.error('Erreur getRoom:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Créer une chambre
// POST /api/rooms
// Private (hotelier, admin)
exports.createRoom = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Vérifier que l'hôtel existe et appartient à l'utilisateur
    const hotel = await Hotel.findById(req.body.hotel);
    
    if (!hotel) {
      return res.status(404).json({ message: 'Hôtel non trouvé' });
    }

    if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à ajouter des chambres à cet hôtel' 
      });
    }

    const room = await Room.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Chambre créée avec succès',
      room
    });
  } catch (error) {
    console.error('Erreur createRoom:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Mettre à jour une chambre
// PUT /api/rooms/:id
// Private (hotelier propriétaire, admin)
exports.updateRoom = async (req, res) => {
  try {
    let room = await Room.findById(req.params.id).populate('hotel');

    if (!room) {
      return res.status(404).json({ message: 'Chambre non trouvée' });
    }

    // Vérifier si l'utilisateur est le propriétaire de l'hôtel ou admin
    if (room.hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à modifier cette chambre' 
      });
    }

    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Chambre mise à jour',
      room
    });
  } catch (error) {
    console.error('Erreur updateRoom:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Supprimer une chambre
// DELETE /api/rooms/:id
// Private (hotelier propriétaire, admin)
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel');

    if (!room) {
      return res.status(404).json({ message: 'Chambre non trouvée' });
    }

    // Vérifier si l'utilisateur est le propriétaire de l'hôtel ou admin
    if (room.hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à supprimer cette chambre' 
      });
    }

    await room.deleteOne();

    res.json({
      success: true,
      message: 'Chambre supprimée'
    });
  } catch (error) {
    console.error('Erreur deleteRoom:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};