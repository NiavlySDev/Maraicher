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
