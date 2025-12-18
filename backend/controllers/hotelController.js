const Hotel = require('../models/Hotel');
const { validationResult } = require('express-validator');

//Ce controller gère tout ce qui est relatifs aux hôtels
//Comme le filtrage, la création, supp, maj etc...
//
//
// Récupérer tous les hôtels
// GET /api/hotels
// Public
exports.getHotels = async (req, res) => {
  try {
    const { city, stars, minPrice, maxPrice, amenities, page = 1, limit = 10 } = req.query;
    
    // Construire le filtre
    const filter = { isActive: true };
    
    if (city) {
      filter['address.city'] = new RegExp(city, 'i');
    }
    if (stars) {
      filter.stars = parseInt(stars);
    }
    if (amenities) {
      filter.amenities = { $all: amenities.split(',') };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const hotels = await Hotel.find(filter)
      .populate('owner', 'firstName lastName')
      .sort({ rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Hotel.countDocuments(filter);

    res.json({
      success: true,
      count: hotels.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      hotels
    });
  } catch (error) {
    console.error('Erreur getHotels:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Récupérer un hôtel par ID
// GET /api/hotels/:id
// Public
exports.getHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate('owner', 'firstName lastName email')
      .populate('rooms');

    if (!hotel) {
      return res.status(404).json({ message: 'Hôtel non trouvé' });
    }

    res.json({ success: true, hotel });
  } catch (error) {
    console.error('Erreur getHotel:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Créer un hôtel
// POST /api/hotels
// Private (hotelier, admin)
exports.createHotel = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Ajouter le propriétaire
    req.body.owner = req.user.id;

    const hotel = await Hotel.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Hôtel créé avec succès',
      hotel
    });
  } catch (error) {
    console.error('Erreur createHotel:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Mettre à jour un hôtel
// PUT /api/hotels/:id
// Private (hotelier propriétaire, admin)
exports.updateHotel = async (req, res) => {
  try {
    let hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: 'Hôtel non trouvé' });
    }

    // Vérifier si l'utilisateur est le propriétaire ou admin
    if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à modifier cet hôtel' 
      });
    }

    hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Hôtel mis à jour',
      hotel
    });
  } catch (error) {
    console.error('Erreur updateHotel:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Supprimer un hôtel
// DELETE /api/hotels/:id
// Private (hotelier propriétaire, admin)
exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: 'Hôtel non trouvé' });
    }

    // Vérifier si l'utilisateur est le propriétaire ou admin
    if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à supprimer cet hôtel' 
      });
    }

    await hotel.deleteOne();

    res.json({
      success: true,
      message: 'Hôtel supprimé'
    });
  } catch (error) {
    console.error('Erreur deleteHotel:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Récupérer les hôtels d'un hotelier
// GET /api/hotels/my-hotels
// Private (hotelier)
exports.getMyHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ owner: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: hotels.length,
      hotels
    });
  } catch (error) {
    console.error('Erreur getMyHotels:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};