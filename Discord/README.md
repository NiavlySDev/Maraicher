# Theronis Harvest Discord Bot

## Description
Bot Discord pour Theronis Harvest qui permet aux utilisateurs de créer automatiquement des comptes sur le site web et de passer des commandes directement via Discord.

## Fonctionnalités

### 🤖 Commandes Discord
- `/creer-compte` - Créer un compte utilisateur
- `/mon-compte` - Voir les informations de son compte
- `/commander` - Passer une commande
- `/produits` - Voir la liste des produits disponibles
- `/livraisons` - Voir les zones et tarifs de livraison

### 🔐 Système de Comptes
- Création automatique de comptes utilisateurs
- Génération de mots de passe temporaires
- Base de données SQLite pour stocker les utilisateurs
- Authentification sécurisée avec bcrypt

### 📦 Système de Commandes
- Enregistrement des commandes via Discord
- Calcul automatique des coûts (produits + livraison)
- Suivi des commandes par numéro
- Zones de livraison multiples

### 🌐 API REST
- Interface API pour le site web
- Authentification des utilisateurs
- Récupération des commandes

## Installation

### 1. Prérequis
- Node.js 16+ installé
- Un bot Discord créé sur https://discord.com/developers/applications
- Les permissions suivantes pour le bot :
  - `Send Messages`
  - `Use Slash Commands`
  - `Read Message History`

### 2. Installation des dépendances
```bash
cd Discord
npm install
```

### 3. Configuration
1. Copiez `.env.example` vers `.env`
2. Remplissez les variables d'environnement :
   - `DISCORD_TOKEN` : Token de votre bot Discord
   - `GUILD_ID` : ID de votre serveur Discord
   - `LOG_CHANNEL_ID` : ID du canal pour les logs (optionnel)

### 4. Démarrage
```bash
# Mode développement
npm run dev

# Mode production
npm start
```

## Configuration Discord

### Création du Bot
1. Allez sur https://discord.com/developers/applications
2. Créez une nouvelle application
3. Dans l'onglet "Bot", créez un bot
4. Copiez le token dans votre fichier `.env`
5. Dans l'onglet "OAuth2 > URL Generator" :
   - Cochez "bot" et "applications.commands"
   - Ajoutez les permissions nécessaires
   - Invitez le bot sur votre serveur avec l'URL générée

### Permissions Requises
```
- Send Messages
- Use Slash Commands
- Embed Links
- Read Message History
```

## Base de Données

### Structure des Tables

#### Table `users`
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discord_id TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    is_active BOOLEAN DEFAULT 1,
    delivery_address TEXT,
    phone TEXT
);
```

#### Table `orders`
```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    discord_id TEXT NOT NULL,
    products TEXT NOT NULL,
    total_amount REAL NOT NULL,
    delivery_zone TEXT NOT NULL,
    delivery_cost REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## API Endpoints

### POST `/api/login`
Authentification d'un utilisateur
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### GET `/api/orders/:userId`
Récupérer les commandes d'un utilisateur

## Utilisation

### Pour les Utilisateurs Discord

1. **Créer un compte :**
   ```
   /creer-compte email:votre@email.com nom-complet:"Votre Nom" telephone:"555-1234"
   ```

2. **Voir son compte :**
   ```
   /mon-compte
   ```

3. **Passer une commande :**
   ```
   /commander produits:"2x Tomate, 1x Pomme" zone-livraison:paleto adresse:"123 Rue Example"
   ```

4. **Voir les produits :**
   ```
   /produits
   ```

5. **Voir les livraisons :**
   ```
   /livraisons
   ```

### Tarification

#### Produits
Tous les produits : **$20**

#### Livraison
- **Paleto** : $500
- **Sandy** : $1,500
- **San Andreas** : $2,500

## Sécurité

- Mots de passe hashés avec bcrypt
- Communications Discord en privé (ephemeral)
- Validation des données d'entrée
- Base de données locale sécurisée

## Logs

Le bot enregistre automatiquement :
- Création de nouveaux comptes
- Nouvelles commandes
- Erreurs système

Les logs sont affichés dans :
- Console du serveur
- Canal Discord configuré (si `LOG_CHANNEL_ID` est défini)

## Développement

### Scripts disponibles
```bash
npm start      # Démarrage en production
npm run dev    # Démarrage en développement avec nodemon
```

### Structure des fichiers
```
Discord/
├── bot.js              # Code principal du bot
├── package.json        # Configuration Node.js
├── .env               # Variables d'environnement
├── .env.example       # Exemple de configuration
├── database/          # Dossier de la base de données
│   └── users.db       # Base SQLite (créée automatiquement)
└── README.md          # Documentation
```

## Intégration avec le Site Web

Le bot expose une API REST qui permet au site web de :
- Authentifier les utilisateurs créés via Discord
- Récupérer l'historique des commandes
- Synchroniser les données utilisateurs

L'API fonctionne sur le port 3001 par défaut et peut être configurée via la variable d'environnement `PORT`.

## Support

Pour toute question ou problème :
1. Vérifiez que toutes les variables d'environnement sont correctement configurées
2. Assurez-vous que le bot a les bonnes permissions sur Discord
3. Consultez les logs dans la console pour identifier les erreurs

---

**Theronis Harvest Discord Bot** - Automatisation des comptes utilisateurs pour votre maraîcher préféré ! 🌿🤖