const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const helmet = require('helmet');

// 1. Chargement des configurations
// On lit les variables cachées dans le fichier .env (comme les mots de passe)
dotenv.config();

// 2. Connexion à la Base de Données (MongoDB)
connectDB();

// 3. Initialisation de l'application Express
const app = express();

// 4. Middleware de Sécurité et Utilitaires
// Helmet ajoute des en-têtes HTTP pour sécuriser l'app contre des attaques courantes
app.use(helmet());
// CORS permet à notre frontend (sur un autre port) de communiquer avec ce backend
app.use(cors());
// Permet de lire les données envoyées en JSON dans le corps des requêtes (req.body)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Route de base (Test)
// Juste pour vérifier que le serveur répond bien
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API Bloc3',
    version: '1.0.0'
  });
});

// 6. Définition des Routes Principales de l'API
// Chaque ligne relie une URL (ex: /api/auth) à un fichier de routes spécifique
app.use('/api/auth', require('./routes/auth'));       // Authentification
app.use('/api/hotels', require('./routes/hotels'));   // Gestion des hôtels
app.use('/api/rooms', require('./routes/rooms'));     // Gestion des chambres
app.use('/api/bookings', require('./routes/bookings')); // Réservations
app.use('/api/payments', require('./routes/payments')); // Paiements
app.use('/api/users', require('./routes/users'));     // Gestion des utilisateurs
app.use('/api/amadeus', require('./routes/amadeus')); // API externe Amadeus (Vols/Hôtels)

// 7. Gestion des erreurs 404 (Page non trouvée)
// Si aucune route au-dessus ne correspond, on tombe ici
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// 8. Gestion globale des erreurs
// Attrape toutes les erreurs non gérées ailleurs pour éviter que le serveur plante
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Erreur serveur',
    // En développement, on affiche les détails de l'erreur pour aider à débugger
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 9. Démarrage du Serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Mode: ${process.env.NODE_ENV}`);
});
