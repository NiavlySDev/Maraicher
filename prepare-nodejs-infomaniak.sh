#!/bin/bash

# Script de préparation pour déploiement Node.js sur Infomaniak
# Utilisation: ./prepare-nodejs-infomaniak.sh

set -e

echo "🏔️ ✅ Préparation pour Node.js Infomaniak - Theronis Harvest"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Créer le dossier de déploiement Node.js
DEPLOY_DIR="nodejs-infomaniak-deploy"
log "Création du dossier de déploiement Node.js: $DEPLOY_DIR"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR/public_html"

# Structure pour Infomaniak avec Node.js
mkdir -p "$DEPLOY_DIR/public_html/frontend"
mkdir -p "$DEPLOY_DIR/public_html/api"
mkdir -p "$DEPLOY_DIR/public_html/logs"

# Préparer les fichiers frontend
log "Préparation des fichiers frontend..."
cp Site/index.html "$DEPLOY_DIR/public_html/frontend/"
cp Site/styles.css "$DEPLOY_DIR/public_html/frontend/"
cp Site/script.js "$DEPLOY_DIR/public_html/frontend/"
cp Site/auth.js "$DEPLOY_DIR/public_html/frontend/"
cp Site/products.json "$DEPLOY_DIR/public_html/frontend/"

# Configuration pour Node.js sur même domaine
log "Configuration pour Node.js Infomaniak..."
cat > "$DEPLOY_DIR/public_html/frontend/config.js" << 'EOF'
// Configuration pour Node.js sur Infomaniak
const CONFIG = {
    // API sur le même domaine Infomaniak
    API_BASE_URL: 'https://votre-domaine.infomaniak.com/api',
    
    // Pas de fallback nécessaire avec vraie API
    FALLBACK_TO_LOCAL: false,
    
    // Configuration des notifications
    NOTIFICATION_DURATION: 5000,
    
    // Configuration du panier
    CART_STORAGE_KEY: 'theronis_harvest_cart',
    
    // Configuration de l'authentification
    AUTH_TOKEN_KEY: 'theronis_harvest_token',
    AUTH_USER_KEY: 'theronis_harvest_user',
    
    // Configuration des commandes
    MIN_ORDER_AMOUNT: 20.00,
    DELIVERY_FEE: 5.00,
    FREE_DELIVERY_THRESHOLD: 50.00,
    
    // Messages
    MESSAGES: {
        LOADING: 'Chargement...',
        ERROR_NETWORK: 'Erreur de connexion au serveur',
        ERROR_AUTH: 'Erreur d\'authentification',
        SUCCESS_ORDER: 'Commande passée avec succès !',
        SUCCESS_PROFILE_UPDATE: 'Profil mis à jour avec succès',
        CART_ITEM_ADDED: 'Produit ajouté au panier',
        CART_ITEM_REMOVED: 'Produit retiré du panier',
        CART_CLEARED: 'Panier vidé',
        STOCK_INSUFFICIENT: 'Stock insuffisant',
        LOGIN_REQUIRED: 'Connexion requise pour cette action'
    }
};

// Fonctions API (identiques à config.js original)
const API = {
    async request(endpoint, options = {}) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        const token = localStorage.getItem(CONFIG.AUTH_TOKEN_KEY);
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Erreur API ${endpoint}:`, error);
            throw error;
        }
    },

    // Méthodes API (copiées du fichier original)
    async getProducts(category = null) {
        const endpoint = category ? `/products/category/${category}` : '/products';
        return this.request(endpoint);
    },

    async getProduct(id) {
        return this.request(`/products/${id}`);
    },

    async login(email, password) {
        return this.request('/users/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    async register(userData) {
        return this.request('/users/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    async getProfile() {
        return this.request('/users/profile');
    },

    async updateProfile(userData) {
        return this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    },

    async changePassword(currentPassword, newPassword) {
        return this.request('/users/change-password', {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword })
        });
    },

    async createOrder(orderData) {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    },

    async getOrders() {
        return this.request('/orders');
    },

    async getOrder(id) {
        return this.request(`/orders/${id}`);
    },

    async cancelOrder(id) {
        return this.request(`/orders/${id}/cancel`, {
            method: 'PATCH'
        });
    }
};

// Gestionnaire d'authentification
const Auth = {
    isLoggedIn() {
        return !!localStorage.getItem(CONFIG.AUTH_TOKEN_KEY);
    },

    getUser() {
        const userStr = localStorage.getItem(CONFIG.AUTH_USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    setAuth(token, user) {
        localStorage.setItem(CONFIG.AUTH_TOKEN_KEY, token);
        localStorage.setItem(CONFIG.AUTH_USER_KEY, JSON.stringify(user));
    },

    clearAuth() {
        localStorage.removeItem(CONFIG.AUTH_TOKEN_KEY);
        localStorage.removeItem(CONFIG.AUTH_USER_KEY);
    },

    async login(email, password) {
        try {
            const response = await API.login(email, password);
            this.setAuth(response.token, response.user);
            return response;
        } catch (error) {
            throw error;
        }
    },

    async register(userData) {
        try {
            const response = await API.register(userData);
            this.setAuth(response.token, response.user);
            return response;
        } catch (error) {
            throw error;
        }
    },

    logout() {
        this.clearAuth();
        window.location.reload();
    }
};
EOF

# Fichier .htaccess pour Node.js
log "Création du .htaccess pour Node.js..."
cat > "$DEPLOY_DIR/public_html/.htaccess" << 'EOF'
# Redirection HTTPS forcée
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Proxy vers Node.js pour les requêtes API
RewriteCond %{REQUEST_URI} ^/api/(.*)$
RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]
ProxyPreserveHost On
ProxyPass /api/ http://localhost:3001/api/
ProxyPassReverse /api/ http://localhost:3001/api/

# Servir les fichiers du frontend
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule ^(.*)$ /frontend/$1 [L]

# Si le fichier n'existe pas dans frontend, servir index.html (SPA)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule ^frontend/(.*)$ /frontend/index.html [L]

# Configuration CORS pour même domaine
<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "https://votre-domaine.infomaniak.com"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
    Header always set Access-Control-Allow-Credentials "true"
    Header always set Access-Control-Max-Age "3600"
</IfModule>

# Compression et cache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json text/xml application/xml
</IfModule>

<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/json "access plus 1 hour"
    ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# Sécurité
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Protéger les fichiers sensibles
<Files ".env*">
    Order allow,deny
    Deny from all
</Files>

<Files "*.log">
    Order allow,deny
    Deny from all
</Files>
EOF

# Préparer les fichiers backend
log "Préparation des fichiers backend Node.js..."
cp Backend/server.js "$DEPLOY_DIR/public_html/api/"
cp Backend/database.js "$DEPLOY_DIR/public_html/api/"
cp Backend/import-products.js "$DEPLOY_DIR/public_html/api/"

# Copier les routes
cp -r Backend/routes "$DEPLOY_DIR/public_html/api/"

# Package.json optimisé pour Infomaniak
cat > "$DEPLOY_DIR/public_html/api/package.json" << 'EOF'
{
  "name": "theronis-harvest-infomaniak",
  "version": "1.0.0",
  "description": "API Theronis Harvest pour Node.js Infomaniak",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "init-db": "node -e \"require('dotenv').config(); const {initDatabase} = require('./database'); initDatabase().then(() => console.log('DB initialisée')); \"",
    "import-products": "node import-products.js"
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
  },
  "keywords": ["api", "maraicher", "infomaniak", "nodejs"],
  "author": "Theronis Harvest"
}
EOF

# Fichier .env d'exemple
cat > "$DEPLOY_DIR/public_html/api/.env.example" << 'EOF'
# Configuration base de données Infomaniak
DB_HOST=mysql.infomaniak.com
DB_PORT=3306
DB_NAME=votre_username_maraicher
DB_USER=votre_username_infomaniak
DB_PASSWORD=votre_mot_de_passe_db

# Configuration serveur
PORT=3001
NODE_ENV=production

# Sécurité JWT
JWT_SECRET=votre_cle_jwt_unique_tres_longue_32_caracteres_minimum
JWT_EXPIRES_IN=24h

# Frontend (même domaine)
FRONTEND_URL=https://votre-domaine.infomaniak.com
EOF

# Instructions de déploiement
cat > "$DEPLOY_DIR/INSTRUCTIONS_NODE_INFOMANIAK.md" << 'EOF'
# Instructions Déploiement Node.js Infomaniak

## 📁 Structure préparée

```
public_html/
├── frontend/          # Site web visible
├── api/              # Backend Node.js
├── logs/             # Logs d'application
└── .htaccess         # Configuration Apache + Proxy
```

## 🚀 Étapes de déploiement

### 1. Base de données
- Manager Infomaniak → Hébergement Web → Bases de données
- Créer une nouvelle base MySQL
- Noter : host, nom, user, password

### 2. Upload des fichiers
- Uploader tout le contenu de public_html/ vers votre dossier public_html Infomaniak
- Via FTP, SFTP ou interface web Infomaniak

### 3. Configuration Node.js
- Manager Infomaniak → Hébergement Web → Applications → Node.js
- Créer une nouvelle application Node.js :
  - Dossier : /api/
  - Fichier principal : server.js
  - Port : 3001

### 4. Variables d'environnement
Dans le panel Node.js Infomaniak, ajouter :

```
DB_HOST=mysql.infomaniak.com
DB_NAME=votre_base_de_donnees
DB_USER=votre_username
DB_PASSWORD=votre_password
PORT=3001
NODE_ENV=production
JWT_SECRET=cle_longue_et_unique
FRONTEND_URL=https://votre-domaine.infomaniak.com
```

### 5. Installation et démarrage
Via SSH Infomaniak (si disponible) :

```bash
cd /public_html/api
npm install
npm run init-db
npm run import-products
npm start
```

### 6. Test
- Site : https://votre-domaine.infomaniak.com
- API : https://votre-domaine.infomaniak.com/api/health
- Produits : https://votre-domaine.infomaniak.com/api/products

## 💰 Coût estimé
- Plan Node.js Infomaniak : ~15-25€/mois
- Tout inclus : hébergement + base de données + SSL + support

## 📞 Support
Si problèmes : Support Infomaniak via Manager (chat/téléphone en français)

Consultez NODEJS_INFOMANIAK.md pour plus de détails.
EOF

# Fichier de test de santé
cat > "$DEPLOY_DIR/public_html/frontend/health.html" << 'EOF'
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Theronis Harvest - Status Node.js</title>
</head>
<body>
    <h1>✅ Theronis Harvest - Node.js Infomaniak</h1>
    <p><strong>Frontend:</strong> <span style="color: green;">✅ Opérationnel</span></p>
    <p><strong>API Backend:</strong> <span id="api-status">⏳ Test en cours...</span></p>
    <p><strong>Base de données:</strong> <span id="db-status">⏳ Test en cours...</span></p>
    <p><strong>Déploiement:</strong> <span id="timestamp"></span></p>

    <script>
        document.getElementById('timestamp').textContent = new Date().toLocaleString();

        // Test de l'API
        fetch('/api/health')
            .then(response => response.json())
            .then(data => {
                document.getElementById('api-status').innerHTML = '<span style="color: green;">✅ Opérationnel</span>';
            })
            .catch(error => {
                document.getElementById('api-status').innerHTML = '<span style="color: red;">❌ Erreur</span>';
            });

        // Test des produits (indique si la DB fonctionne)
        fetch('/api/products')
            .then(response => response.json())
            .then(data => {
                document.getElementById('db-status').innerHTML = '<span style="color: green;">✅ Opérationnel (' + data.length + ' produits)</span>';
            })
            .catch(error => {
                document.getElementById('db-status').innerHTML = '<span style="color: red;">❌ Erreur</span>';
            });
    </script>
</body>
</html>
EOF

# Résumé
log "=== DÉPLOIEMENT NODE.JS INFOMANIAK PRÉPARÉ ==="
echo ""
echo "📦 Fichiers prêts dans: $DEPLOY_DIR/"
echo ""
echo "🏔️ Avantages Node.js sur Infomaniak:"
echo "   ✅ Tout centralisé (frontend + backend + DB)"
echo "   ✅ Support francophone complet"
echo "   ✅ SSL gratuit Let's Encrypt"
echo "   ✅ Sauvegardes automatiques"
echo "   ✅ Interface de gestion unifiée"
echo ""
echo "💰 Coût: ~15-25€/mois (selon plan choisi)"
echo ""
echo "📋 Prochaines étapes:"
echo "   1. Créer la base de données MySQL dans Manager Infomaniak"
echo "   2. Uploader le contenu de public_html/ vers votre hébergement"
echo "   3. Configurer l'application Node.js dans le panel Infomaniak"
echo "   4. Ajouter les variables d'environnement"
echo "   5. Tester avec /health.html"
echo ""
echo "📖 Documentation: NODEJS_INFOMANIAK.md"
echo "📋 Instructions: INSTRUCTIONS_NODE_INFOMANIAK.md"

warn "Configuration requise dans Infomaniak:"
warn "• Application Node.js pointant vers /api/ avec server.js"
warn "• Variables d'environnement avec vos infos DB"
warn "• Port 3001 pour l'application"

echo ""
log "🎉 Préparation Node.js Infomaniak terminée!"
log "Votre site sera 100% hébergé sur Infomaniak avec Node.js ✅"
