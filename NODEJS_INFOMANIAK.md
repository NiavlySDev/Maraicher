# Déploiement Node.js sur Infomaniak - Guide Complet

## 🎯 Configuration pour Node.js Infomaniak

Maintenant que vous avez confirmé le support Node.js, voici la configuration optimale pour tout héberger sur Infomaniak.

## 📁 Structure des dossiers sur Infomaniak

```
/public_html/
├── frontend/              # Votre site web public
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   ├── config.js
│   ├── auth.js
│   ├── .htaccess
│   └── products.json
├── api/                   # Votre backend Node.js (privé)
│   ├── server.js
│   ├── package.json
│   ├── database.js
│   ├── routes/
│   └── .env
└── logs/                  # Logs de l'application
```

## 🚀 Étapes de déploiement

### Étape 1 : Préparer les fichiers

1. **Modifiez config.js pour pointer vers votre domaine :**

```javascript
const CONFIG = {
    // API sur le même domaine Infomaniak
    API_BASE_URL: 'https://votre-domaine.infomaniak.com/api',
    
    // Désactiver le fallback (on a une vraie API)
    FALLBACK_TO_LOCAL: false,
    
    // ... reste de la config
};
```

### Étape 2 : Créer la base de données

1. **Manager Infomaniak** → **Hébergement Web** → **Bases de données**
2. **Créer une nouvelle base de données**
3. Notez les informations :
   - Host : `mysql.infomaniak.com`
   - Base : `votre_username_maraicher`
   - User : `votre_username`
   - Password : `votre_password`

### Étape 3 : Configurer le backend

Créez le fichier `.env` dans le dossier `api/` :

```env
# Base de données Infomaniak
DB_HOST=mysql.infomaniak.com
DB_PORT=3306
DB_NAME=votre_username_maraicher
DB_USER=votre_username
DB_PASSWORD=votre_password_db

# Configuration serveur
PORT=3001
NODE_ENV=production

# Sécurité
JWT_SECRET=votre_cle_tres_longue_et_unique_32_caracteres_minimum
JWT_EXPIRES_IN=24h

# Frontend (même domaine)
FRONTEND_URL=https://votre-domaine.infomaniak.com
```

### Étape 4 : Modifier .htaccess pour Node.js

Créez ce fichier `.htaccess` dans `/public_html/` :

```apache
# Redirection HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Redirection des requêtes API vers Node.js
RewriteCond %{REQUEST_URI} ^/api/(.*)$
RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]
ProxyPreserveHost On

# Servir les fichiers statiques normalement
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule ^(.*)$ /frontend/$1 [L]

# Configuration CORS
<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "https://votre-domaine.infomaniak.com"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
    Header always set Access-Control-Allow-Credentials "true"
</IfModule>

# Cache et compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json
</IfModule>

<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/json "access plus 1 hour"
</IfModule>
```

### Étape 5 : Script de démarrage Node.js

Créez `start.js` dans le dossier `api/` :

```javascript
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Créer le dossier de logs
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Démarrer le serveur avec gestion des logs
const server = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: ['pipe', 'pipe', 'pipe']
});

// Rediriger les logs vers des fichiers
const accessLog = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });
const errorLog = fs.createWriteStream(path.join(logsDir, 'error.log'), { flags: 'a' });

server.stdout.pipe(accessLog);
server.stderr.pipe(errorLog);

// Afficher aussi dans la console
server.stdout.on('data', (data) => {
    console.log(`OUT: ${data}`);
});

server.stderr.on('data', (data) => {
    console.error(`ERR: ${data}`);
});

server.on('close', (code) => {
    console.log(`Serveur arrêté avec le code ${code}`);
});

// Gestion propre de l'arrêt
process.on('SIGTERM', () => {
    console.log('SIGTERM reçu, arrêt du serveur...');
    server.kill('SIGTERM');
});

process.on('SIGINT', () => {
    console.log('SIGINT reçu, arrêt du serveur...');
    server.kill('SIGINT');
});

console.log('🚀 Serveur Node.js démarré avec PID:', server.pid);
```

### Étape 6 : Package.json optimisé

Modifiez `api/package.json` :

```json
{
  "name": "theronis-harvest-api",
  "version": "1.0.0",
  "description": "API Theronis Harvest sur Infomaniak",
  "main": "server.js",
  "scripts": {
    "start": "node start.js",
    "server": "node server.js",
    "init-db": "node -e \"require('dotenv').config(); const {initDatabase} = require('./database'); initDatabase();\""
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "dotenv": "^16.3.1",
    "mysql2": "^3.6.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "express-rate-limit": "^6.8.1",
    "express-validator": "^7.0.1"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
```

## 🔧 Configuration du panneau Infomaniak

### 1. Applications Node.js

1. **Manager Infomaniak** → **Hébergement Web** → **Applications**
2. **Créer une application Node.js**
3. Configurez :
   - **Dossier** : `/api/`
   - **Fichier de démarrage** : `start.js`
   - **Port** : `3001`
   - **Variables d'environnement** : Ajoutez vos variables

### 2. Variables d'environnement dans Infomaniak

Dans le panneau Node.js d'Infomaniak, ajoutez :

```
DB_HOST=mysql.infomaniak.com
DB_NAME=votre_base
DB_USER=votre_user
DB_PASSWORD=votre_password
PORT=3001
NODE_ENV=production
JWT_SECRET=votre_cle_secrete
FRONTEND_URL=https://votre-domaine.infomaniak.com
```

## 📤 Upload des fichiers

### Via FTP/SFTP

```bash
# Structure à uploader
/public_html/
├── frontend/          # Vos fichiers de site
├── api/              # Vos fichiers Node.js
└── .htaccess         # Configuration Apache
```

### Via interface Infomaniak

1. **Manager** → **Hébergement Web** → **Gestionnaire de fichiers**
2. Uploadez la structure de dossiers
3. Configurez l'application Node.js

## 🎯 Initialisation

### 1. Installer les dépendances

Dans le terminal SSH Infomaniak (si disponible) :

```bash
cd /chemin/vers/public_html/api
npm install
```

### 2. Initialiser la base de données

```bash
npm run init-db
```

### 3. Importer les produits

```bash
node import-products.js
```

### 4. Démarrer l'application

```bash
npm start
```

## ✅ Tests de vérification

1. **Frontend** : `https://votre-domaine.infomaniak.com`
2. **API Health** : `https://votre-domaine.infomaniak.com/api/health`
3. **Produits** : `https://votre-domaine.infomaniak.com/api/products`

## 🔍 Monitoring et logs

- **Logs** : `/public_html/logs/`
- **Statut Node.js** : Panel Infomaniak → Applications
- **Base de données** : phpMyAdmin

## 💰 Coût total

- **Hébergement Node.js Infomaniak** : ~15-25€/mois
- **Base de données MySQL** : Incluse
- **SSL** : Gratuit
- **Support** : Inclus

C'est plus cher que la solution hybride mais tout est centralisé et géré par Infomaniak !
