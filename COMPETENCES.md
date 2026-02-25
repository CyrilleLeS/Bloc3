# Synthèse des Compétences Mobilisées - ResaHotel

Le développement de l'application **ResaHotel** a permis de mettre en œuvre un large éventail de compétences techniques et transversales, caractéristiques d'un profil **Développeur Fullstack**.

---

## 1. Développement Frontend (Angular)
- **Framework Moderne** : Utilisation d'**Angular 21** pour créer une application Single Page (SPA) performante.
- **TypeScript** : Typage fort pour sécuriser le code et améliorer la maintenance.
- **Gestion d'état & Flux** : Manipulation de **RxJS** (Observables, Subjects) pour gérer l'asynchronisme.
- **UI/UX & Design** :
    - Intégration d'**Angular Material** pour des composants d'interface riches.
    - Utilisation de **SCSS** pour un stylage modulaire et réutilisable.
    - Design adaptatif (Responsive Design).
- **Architecture Applicative** : Mise en place de **Services**, **Guards** (protection de routes) et **Interceptors** (gestion globale des headers JWT).

---

## 2. Développement Backend (Node.js / Express)
- **Conception d'API RESTful** : Création d'une API structurée avec des routes claires et des contrôleurs dédiés.
- **Gestion des Requêtes** : Utilisation de middlewares pour le parsing, la validation (`express-validator`) et la sécurité.
- **Sécurisation** :
    - Implémentation de l'authentification **JWT (JSON Web Token)**.
    - Hachage de données sensibles avec **BcryptJS**.
    - Configuration de politiques de sécurité avec **Helmet** et **CORS**.

---

## 3. Gestion de Base de Données (NoSQL)
- **Modélisation de Données** : Conception de schémas complexes avec **Mongoose** (MongoDB).
- **Relations & Jointures** : Utilisation de `populate` et de champs virtuels pour lier Utilisateurs, Hôtels, Chambres et Réservations.
- **Optimisation** : Mise en place d'index (simples, composites et textuels) pour accélérer les recherches.
- **Logique Métier** : Utilisation de Hooks (Pre-save, Validate) pour automatiser les calculs (prix total, nombre de nuits).

---

## 4. Intégrations API & Services Tiers
- **Paiement Sécurisé** : Intégration de la solution **Stripe** (gestion des paiements, webhooks, intents).
- **API de Voyage Externe** : Consommation du SDK **Amadeus** pour enrichir le catalogue d'hôtels et proposer des fonctionnalités d'exploration mondiale.
- **Variables d'Environnement** : Gestion sécurisée des clés secrètes avec `dotenv`.

---

## 5. Qualité, Tests & Débogage
- **Tests de Bout en Bout (E2E)** : Utilisation de **Playwright** pour simuler des parcours utilisateurs complets (Login, Recherche, Réservation).
- **Tests Unitaires** : Mise en place de tests avec **Jest** et **Jasmine** pour valider la logique des contrôleurs et des services.
- **Outils de Développement** : Utilisation de Nodemon (auto-reload), Git (versioning) et Postman (test d'API).

---

## 6. Compétences Transversales (Soft Skills)
- **Analyse de Besoins** : Traduction des besoins utilisateurs (Client, Hôtelier, Admin) en fonctionnalités techniques.
- **Architecture Logicielle** : Choix d'une structure modulaire facilitant l'évolution de l'application.
- **Documentation** : Rédaction de guides techniques et utilisateurs clairs.

---

