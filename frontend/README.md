# ResaHotel

ResaHotel est une plateforme complète de réservation d'hôtels qui met en relation les voyageurs avec les hôtels. Elle offre des fonctionnalités pour rechercher des hôtels, réserver des chambres et gérer les réservations tant pour les clients que pour les administrateurs d'hôtels.

## Fonctionnalités

-   **Recherche et Filtres :** Trouvez des hôtels par ville, nombre d'étoiles et équipements.
-   **Système de Réservation :** Interface de réservation facile à utiliser avec sélection de chambre.
-   **Comptes Utilisateurs :** Inscription et connexion sécurisées pour les utilisateurs.
-   **Tableau de Bord Admin :** Gérez les hôtels, les chambres et les réservations (pour les hôteliers/administrateurs).
-   **Design Responsive :** Optimisé pour les appareils de bureau et mobiles.

## Stack Technique

-   **Frontend :** Angular (avec Standalone Components)
-   **Backend :** Node.js, Express (basé sur la configuration standard)
-   **Base de données :** MongoDB (impliqué)
-   **Styles :** SCSS

## Pour Commencer

### Prérequis

-   Node.js (v18 ou supérieur recommandé)
-   npm (v9 ou supérieur recommandé)
-   Angular CLI (`npm install -g @angular/cli`)

### Installation

1.  Clonez le dépôt :
    ```bash
    git clone <url-du-depot>
    cd resahotel
    ```

2.  Installez les dépendances frontend :
    ```bash
    cd frontend
    npm install
    ```

3.  Installez les dépendances backend :
    ```bash
    cd ../backend
    npm install
    ```

### Lancer l'Application

1.  **Démarrer le Backend :**
    Naviguez dans le dossier backend et démarrez le serveur :
    ```bash
    cd backend
    npm start
    ```

2.  **Démarrer le Frontend :**
    Naviguez dans le dossier frontend et démarrez le serveur de développement Angular :
    ```bash
    cd frontend
    ng serve
    ```
    Ouvrez votre navigateur et naviguez vers `http://localhost:4200/`.

## Lancer les Tests

Pour exécuter les tests unitaires du frontend :

```bash
cd frontend
ng test
```

## Structure du Projet

-   `frontend/` : Code source de l'application Angular.
    -   `src/app/components/` : Composants UI (Liste d'hôtels, Formulaire de réservation, etc.).
    -   `src/app/services/` : Services pour la communication API.
    -   `src/app/models/` : Interfaces/modèles TypeScript.
-   `backend/` : Code de l'API côté serveur.

## Contribuer

1.  Forkez le dépôt.
2.  Créez votre branche de fonctionnalité (`git checkout -b feature/ma-super-fonctionnalite`).
3.  Committez vos changements (`git commit -m 'Ajout d'une super fonctionnalité'`).
4.  Pushez vers la branche (`git push origin feature/ma-super-fonctionnalite`).
5.  Ouvrez une Pull Request.
