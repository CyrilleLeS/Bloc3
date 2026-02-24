# 🏨 Bloc3 – Plateforme de Réservation Hôtelière

**Bloc3** est une application **Fullstack** permettant la gestion et la réservation de chambres d’hôtel.
Elle connecte **voyageurs**, **hôteliers** et **administrateurs** via une interface moderne et une API sécurisée.

---

## ✨ Fonctionnalités

### 🌍 Espace Voyageur (Client)

* Recherche avancée (ville, dates, prix, étoiles, équipements)
* Réservation instantanée avec disponibilités en temps réel
* Gestion du profil utilisateur
* Simulation de paiement sécurisé (Stripe)

### 🏨 Espace Hôtelier

* Dashboard d’activité (réservations, revenus)
* Gestion des établissements
* Gestion des chambres (types, prix, disponibilités)

### 🛡️ Administration

* Supervision globale de la plateforme
* Gestion des utilisateurs
* Système de rôles et permissions (RBAC)

---

## 🛠️ Stack Technique

### Frontend (`/frontend`)

* **Framework** : Angular 19+ (Standalone Components)
* **Langage** : TypeScript
* **Style** : SCSS, responsive design
* **Architecture** : Services, Guards, Interceptors HTTP

### Backend (`/backend`)

* **Serveur** : Node.js + Express
* **Base de données** : MongoDB (Mongoose)
* **Authentification** : JWT & Bcrypt
* **APIs externes** : Stripe, Amadeus

---

## 🚀 Installation et Démarrage

### Prérequis

* Node.js v18 ou supérieur
* MongoDB (local ou Atlas)
* Angular CLI

```bash
npm install -g @angular/cli
```

---

### 1️⃣ Configuration du Backend

```bash
# Accéder au dossier backend
cd backend

# Installer les dépendances
npm install
```

Créer un fichier `.env` à la racine du dossier **backend** :

```env
PORT=5000
MONGO_URI=à_remplir
JWT_SECRET=votre_super_secret
# Optionnel : clés API Stripe / Amadeus
```

Démarrer le serveur :

```bash
npm start
```

➡️ Backend disponible sur :
`http://localhost:5000`

---

### 2️⃣ Configuration du Frontend

```bash
# Accéder au dossier frontend
cd frontend

# Installer les dépendances
npm install

# Démarrer l'application
ng serve
```

➡️ Frontend disponible sur :
`http://localhost:4200`

---

## 🧪 Tests

### Tests Unitaires (Frontend)

   1. Backend (`backend/tests/authController.test.js`) :
       * Tests de l'inscription (succès et email déjà pris).
       * Tests de la connexion (identifiants valides et mot de passe incorrect).
       * Utilisation de Jest avec des simulations (mocks) pour isoler la logique métier de la base de données.


   2. Frontend (`frontend/src/app/services/hotel.service.spec.ts`) :
       * Test de la récupération des hôtels.
       * Test de la création d'un hôtel (envoi de données POST).
       * Test des filtres de recherche (vérification que les paramètres sont correctement ajoutés à l'URL).
       * Utilisation du framework de test standard d'Angular.


  Pour exécuter ces tests :
   * Backend : Installez Jest (npm install --save-dev jest) puis lancez npx jest.
   * Frontend : Lancez la commande ng test depuis le dossier frontend.

### Tests End-to-End (E2E)

   1. Architecture Page Object Model (POM) :
       * Le fichier e2e/pages/LoginPage.js centralise les sélecteurs (comme les champs email et password) et les actions (comme la 
         méthode login). Cela rend les tests plus faciles à lire et à maintenir.


   2. Scénarios de test d'authentification (`e2e/auth.spec.js`) :
       * Test de connexion réussie : Vérifie qu'un utilisateur peut se connecter et être redirigé vers son tableau de bord.
       * Test d'échec de connexion : Vérifie que l'application affiche bien un message d'erreur rouge (.alert-error) si les
         identifiants sont faux.
       * Test de navigation : Vérifie que le lien "Inscrivez-vous" fonctionne et change bien l'URL vers /register.


  Pour exécuter ces tests :
   1. Installer Playwright :
      npm install --save-dev @playwright/test
   2. Lancer les tests :
      npx playwright test
      (Assurez-vous que votre frontend tourne sur le port 4200)
   3. Voir le rapport visuel :
      npx playwright show-report

### Tests d’Intégration (Backend)

Les endpoints API peuvent être testés via **Postman** ou **cURL**.

Exemple :

```http
GET http://localhost:5000/api/hotels
```

---

## 📂 Structure du Projet

```bash
Bloc3/
├── backend/                # API Node.js & Express
│   ├── config/             # Connexions (DB, Stripe, Amadeus)
│   ├── controllers/        # Logique métier
│   ├── models/             # Schémas de données (Mongoose)
│   └── routes/             # Endpoints API
│
└── frontend/               # Client Angular
    ├── src/app/
    │   ├── components/     # Pages & composants UI
    │   ├── guards/         # Protection des routes
    │   ├── services/       # Appels HTTP vers le backend
    │   └── app.routes.ts   # Configuration du routage
    └── styles.scss         # Styles globaux
```

---

## 👨‍💻 Auteur

Projet réalisé par **Cyrille Le S.**
Dans le cadre du module de développement **Fullstack**.

