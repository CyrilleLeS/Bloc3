const Amadeus = require('amadeus');

// Configuration Amadeus
// Initialise la connexion avec l'API Amadeus (Vols, Hôtels)
// Les clés (API_KEY et SECRET) sont stockées dans le fichier .env pour la sécurité.

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET
});

module.exports = amadeus;
