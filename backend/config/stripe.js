const Stripe = require('stripe');

// Configuration Stripe
// Initialise le module de paiement sécurisé.
// La clé secrète ne doit JAMAIS être partagée ou commuée sur GitHub.

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16' // Version de l'API pour éviter les changements cassants
});

module.exports = stripe;
