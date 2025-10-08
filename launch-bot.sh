#!/bin/sh

echo "🤖 DÉMARRAGE BOT DISCORD THERONIS HARVEST"
echo "========================================"

# Vérifier si on est dans le bon dossier
if [ ! -f "Discord/bot.js" ]; then
    echo "❌ Fichier Discord/bot.js non trouvé"
    echo "💡 Exécutez ce script depuis le dossier racine Maraicher/"
    exit 1
fi

cd Discord

# Vérifier les dépendances
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install --silent
fi

# Vérifier le token Discord
if [ ! -f ".env" ]; then
    echo ""
    echo "🔑 Configuration requise:"
    echo "Créez un fichier .env avec votre token Discord:"
    echo ""
    echo "DISCORD_TOKEN=votre_token_bot_ici"
    echo "GUILD_ID=votre_server_id (optionnel)"
    echo "LOG_CHANNEL_ID=votre_channel_logs (optionnel)"
    echo ""
    
    read -p "Voulez-vous que je crée le fichier .env maintenant ? (y/n): " create_env
    
    if [ "$create_env" = "y" ] || [ "$create_env" = "Y" ]; then
        echo "DISCORD_TOKEN=REMPLACEZ_PAR_VOTRE_TOKEN" > .env
        echo "GUILD_ID=" >> .env
        echo "LOG_CHANNEL_ID=" >> .env
        echo ""
        echo "✅ Fichier .env créé !"
        echo "🔧 Éditez le fichier .env et ajoutez votre vrai token Discord"
        echo ""
        
        # Ouvrir le fichier pour édition si possible
        if command -v nano >/dev/null 2>&1; then
            read -p "Voulez-vous éditer le fichier maintenant avec nano ? (y/n): " edit_now
            if [ "$edit_now" = "y" ] || [ "$edit_now" = "Y" ]; then
                nano .env
            fi
        fi
        
        echo "Relancez le script après avoir configuré le token !"
        exit 0
    else
        echo "❌ Configuration annulée"
        exit 1
    fi
fi

# Vérifier que le token est configuré
if grep -q "REMPLACEZ_PAR_VOTRE_TOKEN" .env 2>/dev/null; then
    echo "❌ Le token Discord n'est pas encore configuré"
    echo "🔧 Éditez le fichier Discord/.env et remplacez REMPLACEZ_PAR_VOTRE_TOKEN"
    echo "   par votre vrai token Discord"
    exit 1
fi

echo ""
echo "🚀 Lancement du bot Discord..."
echo "📍 Dossier: $(pwd)"
echo "📄 Configuration: .env"
echo ""

# Lancer le bot
echo "🤖 Démarrage..."
npm start
