#!/bin/sh

echo "🤖 LANCEMENT BOT DISCORD - VERSION CORRIGÉE"
echo "=========================================="

# Aller dans le dossier Discord
cd Discord

# Vérifier si le bot est déjà en cours
if pgrep -f "node bot.js" > /dev/null; then
    echo "⚠️  Bot Discord déjà en cours d'exécution"
    echo "🔧 Arrêt de l'ancien processus..."
    pkill -f "node bot.js"
    sleep 2
fi

# Vérifier et libérer le port 3001 si nécessaire
if netstat -tln | grep -q ":3001 "; then
    echo "⚠️  Port 3001 occupé, configuration du bot sur port 3002..."
    
    # Modifier temporairement le port dans le fichier .env
    if [ -f ".env" ]; then
        sed -i 's/PORT = 3001/PORT = 3002/g' .env
        sed -i 's/PORT=3001/PORT=3002/g' .env
    fi
fi

echo ""
echo "🚀 Lancement du bot Discord..."
echo "📍 Dossier: $(pwd)"
echo "🔧 Port API bot: 3002 (pour éviter conflit avec site)"
echo ""

# Lancer le bot en arrière-plan pour éviter les conflits
nohup node bot.js > bot.log 2>&1 &
BOT_PID=$!

echo "🤖 Bot démarré (PID: $BOT_PID)"
echo "📋 Logs: tail -f Discord/bot.log"

sleep 3

# Vérifier si le bot est bien lancé
if ps -p $BOT_PID > /dev/null 2>&1; then
    echo "✅ Bot Discord opérationnel !"
    echo ""
    echo "📊 Informations:"
    echo "   🔧 PID: $BOT_PID"
    echo "   📁 Dossier: $(pwd)"
    echo "   📋 Logs: tail -f bot.log"
    echo "   ⏹️  Arrêter: kill $BOT_PID"
    echo ""
    
    # Afficher les premières lignes de log
    echo "📋 Premières lignes de log:"
    echo "------------------------"
    tail -n 10 bot.log 2>/dev/null || echo "Logs en cours de génération..."
    
else
    echo "❌ Erreur de démarrage du bot"
    echo "📋 Vérifiez les logs: cat Discord/bot.log"
fi

echo ""
echo "💡 Commandes utiles:"
echo "   📊 Voir logs: tail -f Discord/bot.log"
echo "   🔄 Redémarrer: cd Discord && node bot.js"
echo "   ⏹️  Arrêter: kill $BOT_PID"
