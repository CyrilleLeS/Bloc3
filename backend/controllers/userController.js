const User = require('../models/User');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const { validationResult } = require('express-validator');

// Contrôleur Utilisateur
// Gère toutes les opérations CRUD sur les utilisateurs (sauf Auth qui est à part)
// Principalement utilisé pour l'administration

// --------------------------------------------------------------------------
// LECTURE
// --------------------------------------------------------------------------

// Récupérer la liste de tous les utilisateurs
// Route: GET /api/users
// Accès: Privé (Admin seulement)
exports.getUsers = async (req, res) => {
  try {
    // Récupération des filtres depuis l'URL
    const { role, isActive, page = 1, limit = 10, search } = req.query;

    const filter = {};
    if (role) filter.role = role;
    // Conversion du string 'true'/'false' en booléen
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    // Recherche textuelle (Prénom, Nom ou Email)
    if (search) {
      filter.$or = [
        { firstName: new RegExp(search, 'i') }, // 'i' pour insensible à la casse
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    // Calcul de la pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .select('-password') // On ne renvoie jamais les mots de passe !
      .sort({ createdAt: -1 }) // Les plus récents en premier
      .skip(skip)
      .limit(parseInt(limit));

    // Compte total pour la pagination
    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      users
    });
  } catch (error) {
    console.error('Erreur getUsers:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Récupérer un utilisateur précis par son ID
// Route: GET /api/users/:id
// Accès: Privé (Admin)
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // On calcule quelques statistiques utiles sur cet utilisateur
    let stats = {};

    if (user.role === 'client') {
      // Pour un client : combien de résas et total dépensé
      const bookings = await Booking.countDocuments({ user: user._id });
      const totalSpent = await Booking.aggregate([
        { $match: { user: user._id, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]);
      stats = {
        totalBookings: bookings,
        totalSpent: totalSpent[0]?.total || 0
      };
    } else if (user.role === 'hotelier') {
      // Pour un hôtelier : combien d'hôtels et combien de résas reçues
      const hotels = await Hotel.countDocuments({ owner: user._id });
      // On récupère d'abord les IDs de ses hôtels
      const hotelIds = await Hotel.find({ owner: user._id }).select('_id');
      // Puis on compte les résas liées à ces hôtels
      const bookings = await Booking.countDocuments({ 
        hotel: { $in: hotelIds.map(h => h._id) } 
      });
      stats = {
        totalHotels: hotels,
        totalBookings: bookings
      };
    }

    res.json({
      success: true,
      user,
      stats
    });
  } catch (error) {
    console.error('Erreur getUser:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// --------------------------------------------------------------------------
// ÉCRITURE (ADMIN)
// --------------------------------------------------------------------------

// Créer un utilisateur manuellement
// Route: POST /api/users
// Accès: Privé (Admin)
exports.createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, role, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password, // Hashage auto par le modèle
      role: role || 'client',
      phone
    });

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur createUser:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Modifier un utilisateur
// Route: PUT /api/users/:id
// Accès: Privé (Admin)
exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, phone, role, isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Sécurité : On empêche de retirer le rôle admin au dernier admin du système
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ 
          message: 'Impossible de retirer le rôle admin au dernier administrateur' 
        });
      }
    }

    // Mise à jour des champs si fournis
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phone = phone || user.phone;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({
      success: true,
      message: 'Utilisateur mis à jour',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Erreur updateUser:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Supprimer un utilisateur
// Route: DELETE /api/users/:id
// Accès: Privé (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Sécurité : Pas de suppression du dernier admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ 
          message: 'Impossible de supprimer le dernier administrateur' 
        });
      }
    }

    // Sécurité : On ne peut pas se supprimer soi-même ici
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ 
        message: 'Vous ne pouvez pas supprimer votre propre compte' 
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'Utilisateur supprimé'
    });
  } catch (error) {
    console.error('Erreur deleteUser:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// --------------------------------------------------------------------------
// STATISTIQUES (DASHBOARD)
// --------------------------------------------------------------------------

// Obtenir les chiffres clés pour le tableau de bord admin
// Route: GET /api/users/stats/dashboard
// Accès: Privé (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Stats Utilisateurs
    const totalUsers = await User.countDocuments();
    const totalClients = await User.countDocuments({ role: 'client' });
    const totalHoteliers = await User.countDocuments({ role: 'hotelier' });
    // Utilisateurs créés depuis le 1er du mois
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) }
    });

    // 2. Stats Hôtels
    const totalHotels = await Hotel.countDocuments();
    const activeHotels = await Hotel.countDocuments({ isActive: true });

    // 3. Stats Réservations
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    // 4. Revenus (Total des réservations payées)
    const revenueData = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    // Revenus ce mois-ci
    const monthlyRevenueData = await Booking.aggregate([
      { 
        $match: { 
          paymentStatus: 'paid',
          createdAt: { $gte: new Date(new Date().setDate(1)) }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const monthlyRevenue = monthlyRevenueData[0]?.total || 0;

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          clients: totalClients,
          hoteliers: totalHoteliers,
          newThisMonth: newUsersThisMonth
        },
        hotels: {
          total: totalHotels,
          active: activeHotels
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          cancelled: cancelledBookings
        },
        revenue: {
          total: totalRevenue,
          thisMonth: monthlyRevenue
        }
      }
    });
  } catch (error) {
    console.error('Erreur getDashboardStats:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
