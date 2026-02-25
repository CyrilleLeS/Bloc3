# Schémas Techniques - ResaHotel

Ce document détaille la structure de la base de données NoSQL (MongoDB) utilisée par l'application **ResaHotel**, ainsi que les relations entre les différentes entités.

---

## 1. Modèle : User (Utilisateur)
Le modèle **User** gère les comptes clients, hôteliers et administrateurs.

| Champ | Type | Contraintes | Description |
| :--- | :--- | :--- | :--- |
| `firstName` | String | Requis, max 50 | Prénom de l'utilisateur. |
| `lastName` | String | Requis, max 50 | Nom de l'utilisateur. |
| `email` | String | Unique, Requis | Identifiant de connexion (format email validé). |
| `password` | String | Requis, min 6 | Mot de passe (haché avec Bcrypt avant stockage). |
| `role` | String | Enum | Rôles possibles : `client`, `hotelier`, `admin`. |
| `phone` | String | Optionnel | Numéro de téléphone. |
| `isActive` | Boolean | Défaut: `true` | État du compte. |

**Logique métier associée :**
- **Middleware Pre-save** : Hachage automatique du mot de passe si modifié.
- **Méthodes** : `comparePassword` (vérification) et `generateAuthToken` (génération du JWT).

---

## 2. Modèle : Hotel (Hôtel)
Le modèle **Hotel** représente un établissement enregistré sur la plateforme par un hôtelier.

| Champ | Type | Contraintes | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Requis, max 100 | Nom de l'établissement. |
| `description`| String | Requis, max 2000 | Présentation de l'hôtel. |
| `address` | Object | Requis | Sous-champs : `street`, `city`, `zipCode`, `country`. |
| `images` | [String] | - | Liste d'URLs des photos de l'hôtel. |
| `amenities` | [String] | Enum | WiFi, Piscine, Parking, etc. |
| `stars` | Number | 1 à 5 | Nombre d'étoiles. |
| `rating` | Number | 0 à 5 | Note moyenne des avis. |
| `owner` | ObjectId | Ref: `User` | Lien vers l'hôtelier propriétaire. |

**Relations & Performance :**
- **Champ Virtuel** : `rooms` (permet de récupérer les chambres rattachées sans les stocker directement).
- **Indexation** : Index composite sur `city` et `stars`. Index textuel sur `name` et `description`.

---

## 3. Modèle : Room (Chambre)
Chaque hôtel possède plusieurs types de chambres.

| Champ | Type | Contraintes | Description |
| :--- | :--- | :--- | :--- |
| `hotel` | ObjectId | Ref: `Hotel` | Référence de l'hôtel parent. |
| `name` | String | Requis | Nom (ex: "Suite Royale"). |
| `type` | String | Enum | simple, double, twin, suite, etc. |
| `price` | Number | Requis, min 0 | Prix par nuit. |
| `capacity` | Object | Requis | `adults` (min 1) et `children`. |
| `amenities` | [String] | Enum | Équipements spécifiques (TV, Balcon...). |
| `quantity` | Number | Défaut: 1 | Nombre total de chambres de ce type. |
| `isAvailable`| Boolean | Défaut: `true` | Disponibilité générale. |

---

## 4. Modèle : Booking (Réservation)
Le modèle **Booking** fait le lien entre un utilisateur, un hôtel et une chambre.

| Champ | Type | Contraintes | Description |
| :--- | :--- | :--- | :--- |
| `user` | ObjectId | Ref: `User` | Client ayant réservé. |
| `hotel` | ObjectId | Ref: `Hotel` | Hôtel réservé. |
| `room` | ObjectId | Ref: `Room` | Type de chambre choisi. |
| `checkInDate` | Date | Requis | Date d'arrivée. |
| `checkOutDate`| Date | Requis | Date de départ. |
| `totalPrice` | Number | Calculé | Montant total du séjour. |
| `status` | String | Enum | `pending`, `confirmed`, `cancelled`, `completed`. |
| `paymentStatus`| String | Enum | `pending`, `paid`, `refunded`, `failed`. |

**Logique métier associée :**
- **Calcul automatique** : Le nombre de nuits et le `totalPrice` sont calculés juste avant la validation en base.
- **Vérification de disponibilité** : Une méthode statique `checkAvailability` vérifie les chevauchements de dates pour éviter le surbooking.

---

