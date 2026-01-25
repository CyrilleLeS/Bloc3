const mongoose = require('mongoose');

// Fonction pour se connecter à la base de données MongoDB
// C'est ici qu'on fait le lien entre notre code Node.js et la BDD
const connectDB = async () => {
  try {
    // Tentative de connexion avec l'adresse stockée dans .env
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    // Si ça marche, on l'affiche dans la console
    console.log(`MongoDB connecté: ${conn.connection.host}`);
  } catch (error) {
    // Si ça échoue, on affiche l'erreur et on arrête tout (le serveur ne peut pas marcher sans BDD)
    console.error(`Erreur de connexion MongoDB: ${error.message}`);
    process.exit(1); // 1 signifie une sortie avec erreur
  }
};

module.exports = connectDB;
