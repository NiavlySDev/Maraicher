#!/bin/bash

# Script pour préparer le déploiement Console Node.js Infomaniak
# Utilisation: ./prepare-console-nodejs.sh

set -e

echo "🎯 Préparation pour Console Node.js Infomaniak"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Créer le dossier pour console Node.js
DEPLOY_DIR="console-nodejs-infomaniak"
log "Création du dossier pour console Node.js: $DEPLOY_DIR"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# ==========================================
# CONFIGURATION SERVEUR UNIFIÉ
# ==========================================

log "Configuration du serveur unifié..."

# Copier le serveur unifié
cp nodejs-infomaniak-deploy/public_html/api/server-unified.js "$DEPLOY_DIR/"

# Package.json unifié
cp nodejs-infomaniak-deploy/public_html/api/package-unified.json "$DEPLOY_DIR/package.json"

# Fichiers backend nécessaires
cp Backend/database.js "$DEPLOY_DIR/"
cp Backend/import-products.js "$DEPLOY_DIR/"

# Routes API
mkdir -p "$DEPLOY_DIR/routes"
cp -r Backend/routes/* "$DEPLOY_DIR/routes/"

# Configuration environnement
cat > "$DEPLOY_DIR/.env.example" << 'EOF'
# Configuration base de données Infomaniak
DB_HOST=mysql.infomaniak.com
DB_PORT=3306
DB_NAME=votre_nom_base_infomaniak
DB_USER=votre_utilisateur_infomaniak
DB_PASSWORD=votre_mot_de_passe_db

# Configuration serveur unifié
PORT=3001
NODE_ENV=production

# Sécurité JWT
JWT_SECRET=votre_cle_jwt_unique_tres_longue_32_caracteres_minimum
JWT_EXPIRES_IN=24h

# URL frontend (sera la même que l'API avec serveur unifié)
FRONTEND_URL=https://votre-app-nodejs.infomaniak.com

# Discord Bot (optionnel)
DISCORD_TOKEN=votre_token_discord_bot
DISCORD_CHANNEL_ID=votre_channel_id_notifications
EOF

# ==========================================
# DOSSIER FRONTEND
# ==========================================

log "Préparation du frontend..."
mkdir -p "$DEPLOY_DIR/frontend"

# Copier les fichiers frontend
cp Site/index.html "$DEPLOY_DIR/frontend/"
cp Site/styles.css "$DEPLOY_DIR/frontend/"
cp Site/script.js "$DEPLOY_DIR/frontend/"
cp Site/auth.js "$DEPLOY_DIR/frontend/"
cp Site/products.json "$DEPLOY_DIR/frontend/"

# Configuration adaptée pour serveur unifié
cp nodejs-infomaniak-deploy/public_html/frontend/config.js "$DEPLOY_DIR/frontend/"

# ==========================================
# BOT DISCORD (OPTIONNEL)
# ==========================================

if [ -d "Discord" ]; then
    log "Ajout du bot Discord..."
    mkdir -p "$DEPLOY_DIR/Discord"
    cp Discord/bot.js "$DEPLOY_DIR/Discord/" 2>/dev/null || warn "bot.js non trouvé"
    cp Discord/package.json "$DEPLOY_DIR/Discord/" 2>/dev/null || warn "package.json Discord non trouvé"
else
    warn "Dossier Discord non trouvé, création d'un bot minimal..."
    mkdir -p "$DEPLOY_DIR/Discord"
    
    # Bot Discord minimal
    cat > "$DEPLOY_DIR/Discord/bot.js" << 'EOF'
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once('ready', () => {
    console.log(`✅ Bot Discord connecté: ${client.user.tag}`);
});

// Commande simple
client.on('messageCreate', message => {
    if (message.content === '!theronis') {
        message.reply('🌿 Theronis Harvest est en ligne !');
    }
});

// Démarrage
if (process.env.DISCORD_TOKEN) {
    client.login(process.env.DISCORD_TOKEN);
} else {
    console.log('❌ DISCORD_TOKEN manquant');
}
EOF
fi

# ==========================================
# INSTRUCTIONS DE DÉPLOIEMENT
# ==========================================

log "Génération des instructions..."

cat > "$DEPLOY_DIR/DEPLOY_CONSOLE_NODEJS.md" << 'EOF'
# 🎯 Déploiement Console Node.js Infomaniak

## 📁 Fichiers préparés pour Console Node.js

Cette configuration crée un **serveur unifié** qui gère :
- ✅ Site web (frontend)  
- ✅ API REST (backend)
- ✅ Bot Discord (optionnel)
- ✅ Base de données MySQL

## 🚀 Étapes dans Manager Infomaniak

### 1. Créer l'application Node.js
- **Manager Infomaniak** → **Applications** → **Node.js**
- **Nouvelle application**
- **Nom** : theronis-harvest
- **Fichier principal** : `server-unified.js`
- **Port** : `3001`

### 2. Upload des fichiers
Via **FTP/SFTP** ou **interface web**, uploader tous les fichiers de ce dossier dans votre application Node.js.

### 3. Variables d'environnement
Dans la **console Node.js Infomaniak**, ajouter :

```
DB_HOST=mysql.infomaniak.com
DB_NAME=votre_base_de_donnees
DB_USER=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe
PORT=3001
NODE_ENV=production
JWT_SECRET=votre_cle_secrete_longue
FRONTEND_URL=https://votre-app.infomaniak.com
DISCORD_TOKEN=votre_token_bot (optionnel)
```

### 4. Dans la console Node.js

```bash
# 1. Installer les dépendances
npm install

# 2. Initialiser la base de données
npm run init-db

# 3. Importer les produits
npm run import-products

# 4. Démarrer l'application
npm start
```

## 🌐 URLs d'accès

- **Site web** : https://votre-app.infomaniak.com/
- **API** : https://votre-app.infomaniak.com/api/health
- **Produits** : https://votre-app.infomaniak.com/api/products

## ✅ Avantages

- **Tout-en-un** : Un seul serveur Node.js
- **Simple** : Pas de configuration Apache/proxy
- **Économique** : Une seule application
- **Discord intégré** : Bot démarre automatiquement

## 🔧 Commandes utiles

```bash
# Voir les logs
# (Onglet "Logs" dans console Infomaniak)

# Redémarrer
# (Bouton "Redémarrer" dans Manager)

# Test rapide
curl https://votre-app.infomaniak.com/api/health
```

C'est la solution parfaite pour console Node.js Infomaniak ! 🎉
EOF

# Script de test local
cat > "$DEPLOY_DIR/test-local.sh" << 'EOF'
#!/bin/bash
echo "🧪 Test local du serveur unifié"

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js non installé"
    exit 1
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Variables d'environnement de test
export PORT=3001
export NODE_ENV=development
export JWT_SECRET=test_secret_key_development_only
export FRONTEND_URL=http://localhost:3001

echo "🚀 Démarrage du serveur de test..."
echo "📍 Site: http://localhost:3001"
echo "🔌 API: http://localhost:3001/api/health"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter"

node server-unified.js
EOF

chmod +x "$DEPLOY_DIR/test-local.sh"

# ==========================================
# RÉSUMÉ
# ==========================================

log "=== CONSOLE NODE.JS INFOMANIAK PRÉPARÉ ==="
echo ""
echo "📦 Dossier créé: $DEPLOY_DIR/"
echo ""
echo "🎯 Configuration: Serveur unifié (Site + API + Discord)"
echo "📁 Structure:"
echo "   ├── server-unified.js    (serveur principal)"
echo "   ├── package.json         (dépendances)"
echo "   ├── frontend/            (site web)"
echo "   ├── routes/              (API)"
echo "   ├── Discord/             (bot optionnel)"
echo "   └── .env.example         (configuration)"
echo ""
echo "🚀 Dans Manager Infomaniak:"
echo "   1. Créer application Node.js"
echo "   2. Uploader ces fichiers"  
echo "   3. Configurer variables d'environnement"
echo "   4. npm install && npm start"
echo ""
echo "🌐 Résultat: https://votre-app.infomaniak.com"
echo "   • Site web à /"
echo "   • API à /api/*" 
echo "   • Bot Discord automatique"
echo ""
echo "📋 Instructions: DEPLOY_CONSOLE_NODEJS.md"
echo "🧪 Test local: ./test-local.sh"

warn "N'oubliez pas:"
warn "• Créer votre base de données MySQL dans Manager Infomaniak"
warn "• Configurer les variables d'environnement"
warn "• Token Discord pour le bot (optionnel)"

echo ""
log "🎉 Prêt pour déploiement console Node.js Infomaniak!"
