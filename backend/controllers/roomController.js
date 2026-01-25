const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const { validationResult } = require('express-validator');

// Contrôleur Chambre (Room)
// Gère tout le cycle de vie d'une chambre d'hôtel (Ajout, Modif, Suppression, Lecture)

// --------------------------------------------------------------------------
// LECTURE (PUBLIC)
// --------------------------------------------------------------------------

// Récupérer toutes les chambres d'un hôtel spécifique
// Route: GET /api/rooms/hotel/:hotelId
// Accès: Public
exports.getRoomsByHotel = async (req, res) => {
  try {
    const { type, minPrice, maxPrice, capacity } = req.query;
    
    // Filtre de base : hôtel spécifié + chambre disponible
    const filter = { hotel: req.params.hotelId, isAvailable: true };
    
    // Filtres optionnels
    if (type) filter.type = type;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    // Capacité minimum (pour x adultes)
    if (capacity) filter['capacity.adults'] = { $gte: parseInt(capacity) };

    const rooms = await Room.find(filter)
      .populate('hotel', 'name address') // Ajoute le nom et adresse de l'hôtel
      .sort({ price: 1 }); // Tri par prix croissant (moins cher en premier)

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

// Récupérer les détails d'une chambre
// Route: GET /api/rooms/:id
// Accès: Public
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

// --------------------------------------------------------------------------
// ÉCRITURE (HÔTELIERS / ADMINS)
// --------------------------------------------------------------------------

// Créer une nouvelle chambre
// Route: POST /api/rooms
// Accès: Privé (Propriétaire de l'hôtel ou Admin)
exports.createRoom = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 1. On vérifie que l'hôtel existe
    const hotel = await Hotel.findById(req.body.hotel);
    
    if (!hotel) {
      return res.status(404).json({ message: 'Hôtel non trouvé' });
    }

    // 2. Sécurité : Seul le propriétaire de l'hôtel peut ajouter une chambre
    if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à ajouter des chambres à cet hôtel' 
      });
    }

    // 3. Création
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

// Modifier une chambre
// Route: PUT /api/rooms/:id
// Accès: Privé
exports.updateRoom = async (req, res) => {
  try {
    let room = await Room.findById(req.params.id).populate('hotel');

    if (!room) {
      return res.status(404).json({ message: 'Chambre non trouvée' });
    }

    // Sécurité : Vérif proprio
    if (room.hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à modifier cette chambre' 
      });
    }

    // Mise à jour
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
// Route: DELETE /api/rooms/:id
// Accès: Privé
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel');

    if (!room) {
      return res.status(404).json({ message: 'Chambre non trouvée' });
    }

    // Sécurité : Vérif proprio
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
