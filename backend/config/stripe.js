//création de la variable pour le mode de paiement stripe, le check de la clé api
//pour les différentes requêtes

const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

module.exports = stripe;