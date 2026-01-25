const Hotel = require('../models/Hotel');
const { validationResult } = require('express-validator');

// Ce contrôleur gère toutes les opérations liées aux hôtels
// Il fait le lien entre les requêtes de l'utilisateur et la base de données

// --------------------------------------------------------------------------
// LECTURE (PUBLIC)
// --------------------------------------------------------------------------

// Récupérer la liste des hôtels avec filtres et pagination
// Route: GET /api/hotels
// Accès: Public (tout le monde peut voir)
exports.getHotels = async (req, res) => {
  try {
    // On extrait les paramètres envoyés dans l'URL (query params)
    const { city, stars, minPrice, maxPrice, amenities, page = 1, limit = 10 } = req.query;
    
    // Construction de l'objet de recherche (filtre) pour MongoDB
    const filter = { isActive: true }; // Par défaut, on ne cherche que les hôtels actifs
    
    // Filtrage par ville (insensible à la casse)
    if (city) {
      filter['address.city'] = new RegExp(city, 'i');
    }
    // Filtrage par étoiles
    if (stars) {
      filter.stars = parseInt(stars);
    }
    // Filtrage par équipements (doit contenir tous les équipements demandés)
    if (amenities) {
      filter.amenities = { $all: amenities.split(',') };
    }

    // Calcul pour la pagination (combien d'hôtels on saute)
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Requête vers la base de données
    const hotels = await Hotel.find(filter)
      .populate('owner', 'firstName lastName') // On ajoute les infos simples du propriétaire
      .sort({ rating: -1, createdAt: -1 })     // Tri par note (décroissant) puis par date
      .skip(skip)                              // On saute les résultats des pages précédentes
      .limit(parseInt(limit));                 // On limite le nombre de résultats

    // Compte total pour savoir combien de pages il y a au total
    const total = await Hotel.countDocuments(filter);

    // Réponse au client
    res.json({
      success: true,
      count: hotels.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      hotels
    });
  } catch (error) {
    // Gestion des erreurs serveur
    console.error('Erreur getHotels:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Récupérer un seul hôtel grâce à son ID
// Route: GET /api/hotels/:id
// Accès: Public
exports.getHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate('owner', 'firstName lastName email')
      .populate('rooms'); // On récupère aussi la liste des chambres associées

    if (!hotel) {
      return res.status(404).json({ message: 'Hôtel non trouvé' });
    }

    res.json({ success: true, hotel });
  } catch (error) {
    console.error('Erreur getHotel:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// --------------------------------------------------------------------------
// ÉCRITURE (HÔTELIERS / ADMINS)
// --------------------------------------------------------------------------

// Créer un nouvel hôtel
// Route: POST /api/hotels
// Accès: Privé (seulement les hôteliers et admins connectés)
exports.createHotel = async (req, res) => {
  try {
    // Vérification des erreurs de validation (ex: champs manquants)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // On associe l'hôtel à l'utilisateur qui le crée
    req.body.owner = req.user.id;

    // Création en base de données
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
// Route: PUT /api/hotels/:id
// Accès: Privé (Propriétaire de l'hôtel ou Admin)
exports.updateHotel = async (req, res) => {
  try {
    let hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: 'Hôtel non trouvé' });
    }

    // Sécurité : On vérifie que c'est bien le propriétaire ou un admin qui modifie
    if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à modifier cet hôtel' 
      });
    }

    // Mise à jour
    hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,         // Retourne l'objet modifié
      runValidators: true // Vérifie que les données respectent le modèle (Schema)
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
// Route: DELETE /api/hotels/:id
// Accès: Privé (Propriétaire ou Admin)
exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: 'Hôtel non trouvé' });
    }

    // Sécurité : Vérification des droits
    if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à supprimer cet hôtel' 
      });
    }

    // Suppression
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

// Récupérer la liste de "mes" hôtels (pour le dashboard de l'hôtelier)
// Route: GET /api/hotels/my-hotels
// Accès: Privé (Hôtelier)
exports.getMyHotels = async (req, res) => {
  try {
    // On cherche seulement les hôtels dont le "owner" est l'utilisateur connecté
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
