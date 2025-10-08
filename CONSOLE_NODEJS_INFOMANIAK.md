# 🎯 Configuration Console Node.js Infomaniak

## Situation : Console Node.js uniquement

Vous avez accès seulement à la **console Node.js** d'Infomaniak. Voici comment configurer le tout.

## 📁 Structure à uploader sur Infomaniak

```
/votre-projet-nodejs/
├── server-unified.js         # ✅ Serveur unifié (site + API + Discord)
├── package.json             # ✅ Dépendances (avec discord.js)
├── database.js              # ✅ Configuration DB
├── import-products.js       # ✅ Import produits
├── .env                     # ✅ Variables environnement
├── routes/                  # ✅ Routes API
│   ├── products.js
│   ├── users.js
│   └── orders.js
├── frontend/                # ✅ Fichiers du site web
│   ├── index.html
│   ├── script.js
│   ├── config.js
│   ├── auth.js
│   ├── styles.css
│   └── products.json
└── Discord/                 # ✅ Bot Discord (optionnel)
    ├── bot.js
    └── package.json
```

## 🚀 Étapes de configuration

### 1. Dans la console Node.js Infomaniak

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
# Créer/éditer le fichier .env avec vos informations

# 3. Initialiser la base de données
npm run init-db

# 4. Importer les produits
npm run import-products

# 5. Démarrer le serveur unifié
npm start
```

### 2. Configuration du fichier .env

```env
# Base de données Infomaniak
DB_HOST=mysql.infomaniak.com
DB_NAME=votre_base_de_donnees
DB_USER=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe

# Serveur
PORT=3001
NODE_ENV=production

# JWT
JWT_SECRET=votre_cle_secrete_tres_longue
JWT_EXPIRES_IN=24h

# URL du site (sera la même que l'API)
FRONTEND_URL=https://votre-domaine-nodejs.infomaniak.com

# Discord (optionnel)
DISCORD_TOKEN=votre_token_discord_bot
DISCORD_CHANNEL_ID=votre_channel_id
```

## 🔄 Comment ça marche ?

### Le serveur unifié fait tout :

1. **🌐 Serveur web** : Sert vos pages HTML/CSS/JS à `/`
2. **🔌 API REST** : Répond aux requêtes à `/api/*`  
3. **🤖 Bot Discord** : Lance automatiquement le bot Discord
4. **🗄️ Base de données** : Gère MySQL Infomaniak

### URLs d'accès :

- **Site web** : `https://votre-app.infomaniak.com/`
- **API** : `https://votre-app.infomaniak.com/api/products`
- **Health check** : `https://votre-app.infomaniak.com/api/health`

## 📝 Configuration dans console Infomaniak

### 1. Créer l'application Node.js

Dans Manager Infomaniak :
- **Applications** → **Node.js** → **Nouvelle application**
- **Fichier principal** : `server-unified.js`  
- **Port** : `3001`
- **Domaine** : Votre sous-domaine ou domaine personnalisé

### 2. Variables d'environnement

Dans la console Infomaniak, ajouter ces variables :

```
DB_HOST=mysql.infomaniak.com
DB_NAME=votre_base
DB_USER=votre_user
DB_PASSWORD=votre_password
PORT=3001
NODE_ENV=production
JWT_SECRET=votre_cle_secrete
FRONTEND_URL=https://votre-domaine.infomaniak.com
DISCORD_TOKEN=votre_token_discord (optionnel)
```

### 3. Upload des fichiers

Via **FTP/SFTP** ou **interface web Infomaniak** :
- Uploader tous les fichiers dans le dossier de votre application Node.js
- Structure : `/votre-app/` contient `server-unified.js` et le reste

## 🎯 Avantages de cette approche

✅ **Un seul serveur** : Tout tourne sur une instance Node.js  
✅ **Pas de proxy** : Pas besoin de .htaccess complexe  
✅ **Simple** : Configuration unifiée  
✅ **Discord intégré** : Bot Discord démarre automatiquement  
✅ **Économique** : Une seule application Node.js sur Infomaniak

## 🔧 Commandes utiles

```bash
# Démarrer seulement le serveur web (sans Discord)
npm run server-only

# Voir les logs en temps réel
# (dans la console Infomaniak, onglet Logs)

# Redémarrer l'application
# (dans Manager Infomaniak, bouton Redémarrer)

# Tester l'API
curl https://votre-app.infomaniak.com/api/health

# Tester le site
curl https://votre-app.infomaniak.com/
```

## 🚨 Dépannage

### Site ne s'affiche pas
- Vérifier que `server-unified.js` est le fichier principal
- Vérifier que le dossier `frontend/` existe avec `index.html`

### API ne fonctionne pas  
- Vérifier les variables d'environnement
- Tester `/api/health`
- Regarder les logs dans console Infomaniak

### Bot Discord ne démarre pas
- Vérifier `DISCORD_TOKEN` dans les variables d'environnement  
- Le bot est optionnel, le site fonctionne sans

### Base de données inaccessible
- Vérifier les paramètres MySQL dans Manager Infomaniak
- Tester la connexion via phpMyAdmin

## 💡 Configuration config.js du frontend

```javascript
const CONFIG = {
    // Même domaine pour l'API (pas de CORS)
    API_BASE_URL: '/api',
    
    // Pas de fallback nécessaire
    FALLBACK_TO_LOCAL: false,
    
    // ... rest of config
};
```

Cette configuration est **parfaite** pour la console Node.js Infomaniak ! 🎉
