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

Le projet utilise **Jasmine** et **Karma**.

```bash
cd frontend
ng test
```

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

