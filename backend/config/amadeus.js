//Création de la variable "amadeus" qui appelera les clés api
//Pour valider les requêtes faites avec l'api

const Amadeus = require('amadeus');

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET
});

module.exports = amadeus;