# Revue Technique - ResaHotel

Ce document présente l'architecture technique, les choix technologiques et le fonctionnement interne de l'application **ResaHotel**.

## 1. Présentation du Projet
**ResaHotel** est une plateforme Fullstack de gestion et de réservation hôtelière. Elle permet la mise en relation de trois types d'utilisateurs :
- **Clients** : Recherche d'hôtels (locaux ou via Amadeus), réservation et paiement en ligne.
- **Hôteliers** : Gestion de leurs établissements, des chambres et suivi des réservations.
- **Administrateurs** : Supervision globale de la plateforme et des utilisateurs.

---

## 2. Architecture Technique
L'application repose sur une architecture **MEAN** modernisée (MongoDB, Express, Angular, Node.js).

### Vue d'ensemble
- **Backend** : API RESTful développée avec **Node.js** et **Express**.
- **Frontend** : Application Single Page (SPA) développée avec **Angular 21**.
- **Base de données** : **MongoDB** (NoSQL) avec l'ORM **Mongoose**.
- **Tests** : **Playwright** (E2E) et **Jest/Jasmine** (Unitaires).

---

## 3. Stack Technologique

### Backend (Dossier `/backend`)
- **Serveur** : Node.js & Express 5.
- **Base de données** : MongoDB via Mongoose 8.
- **Sécurité** : 
    - **JWT (JSON Web Tokens)** : Gestion de l'authentification.
    - **BcryptJS** : Hachage des mots de passe.
    - **Helmet** : Sécurisation des en-têtes HTTP.
    - **CORS** : Gestion des accès cross-origin.
- **Intégrations** :
    - **Stripe** : Traitement des paiements sécurisés.
    - **Amadeus SDK** : Recherche d'hôtels et de vols via API externe.

### Frontend (Dossier `/frontend`)
- **Framework** : Angular 21 (TypeScript).
- **UI/UX** : 
    - **Angular Material** : Composants d'interface modernes.
    - **FontAwesome** : Bibliothèque d'icônes.
    - **SCSS** : Préprocesseur CSS pour un stylage structuré.
- **Gestion d'état** : RxJS (Observables) et Services Angular.
- **Navigation** : Angular Router avec Guards (Auth & Role).
- **Notifications** : ngx-toastr.

---

## 4. Modèles de Données (MongoDB)

L'application utilise quatre modèles principaux :

1.  **User** : 
    - Champs : `firstName`, `lastName`, `email` (unique), `password` (haché), `role` (client, hotelier, admin).
    - Méthodes : `comparePassword`, `generateAuthToken`.
2.  **Hotel** :
    - Champs : `name`, `description`, `address`, `stars`, `amenities`, `owner` (ref User).
    - Système de recherche textuelle indexé sur le nom et la description.
3.  **Room** :
    - Champs : `hotel` (ref Hotel), `type`, `price`, `capacity`, `quantity`.
    - Gère la disponibilité et les caractéristiques spécifiques (WiFi, TV, etc.).
4.  **Booking** :
    - Champs : `user`, `hotel`, `room`, `checkInDate`, `checkOutDate`, `totalPrice`, `status` (pending, confirmed, cancelled).
    - Logique métier : Calcul automatique du prix total et vérification de chevauchement de dates (disponibilité).

---

## 5. Fonctionnalités Clés

### Authentification & Autorisation
- Inscription et connexion avec validation de format.
- Système **RBAC (Role-Based Access Control)** :
    - `AuthGuard` : Vérifie si l'utilisateur est connecté.
    - `RoleGuard` : Restreint l'accès aux tableaux de bord selon le rôle.

### Processus de Réservation
1. Recherche d'hôtels par ville ou critères.
2. Sélection d'une chambre et vérification de disponibilité en temps réel.
3. Paiement sécurisé via l'intégration **Stripe**.
4. Confirmation de réservation et mise à jour de l'état en base de données.

### Intégration Amadeus
L'application propose une fonctionnalité "Explore" qui interroge l'API Amadeus pour offrir un catalogue d'hôtels mondial, complétant les offres locales gérées sur la plateforme.

---

## 6. Structure du Projet

```text
resahotel/
├── backend/                # API Node.js/Express
│   ├── config/             # Config DB, Stripe, Amadeus
│   ├── controllers/        # Logique métier
│   ├── middleware/         # Auth, Validator
│   ├── models/             # Schémas Mongoose
│   ├── routes/             # Endpoints API
│   └── tests/              # Tests unitaires Backend
├── frontend/               # Application Angular
│   ├── src/app/
│   │   ├── components/     # Composants par module (Auth, Hotel, Booking...)
│   │   ├── guards/         # Protection des routes
│   │   ├── interceptors/   # Injection du token JWT
│   │   ├── services/       # Appels API (HttpClient)
│   │   └── models/         # Interfaces TypeScript
├── e2e/                    # Tests de bout en bout (Playwright)
└── REVUETECHNIQUE.md       # Documentation (ce fichier)
```

---

## 7. Sécurité et Bonnes Pratiques
- **Validation** : Utilisation d' `express-validator` côté serveur et de `ReactiveForms` avec validateurs côté client.
- **Intercepteurs** : Un intercepteur HTTP Angular injecte automatiquement le token JWT dans chaque requête sortante.
- **Variables d'environnement** : Utilisation de fichiers `.env` pour masquer les clés secrètes (Stripe, MongoDB URI, JWT Secret).
- **Nettoyage** : Utilisation du middleware `trim` et `lowercase` sur les entrées sensibles.

---

## 8. Installation et Lancement

### Prérequis
- Node.js (v18+)
- MongoDB installé ou via Atlas.

### Lancement
1. **Backend** :
   ```bash
   cd backend
   npm install
   npm run dev
   ```
2. **Frontend** :
   ```bash
   cd frontend
   npm install
   npm start
   ```
3. **Tests** :
   ```bash
   npx playwright test
   ```

---

