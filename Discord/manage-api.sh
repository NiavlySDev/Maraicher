#!/bin/bash

# Script de gestion de l'API Theronis Harvest
# Usage: ./manage-api.sh [start|stop|restart|status|logs]

API_DIR="/home/sylvain/Documents/Coding/Web/Maraicher/Discord"
PID_FILE="$API_DIR/api.pid"
LOG_FILE="$API_DIR/logs/api.log"

# Créer le dossier logs s'il n'existe pas
mkdir -p "$API_DIR/logs"

case "$1" in
    start)
        echo "🚀 Démarrage de l'API Theronis Harvest..."
        cd "$API_DIR"
        
        # Vérifier si l'API est déjà en cours d'exécution
        if [ -f "$PID_FILE" ] && kill -0 "$(cat $PID_FILE)" 2>/dev/null; then
            echo "⚠️  L'API est déjà en cours d'exécution (PID: $(cat $PID_FILE))"
            exit 1
        fi
        
        # Vérifier que les dépendances sont installées
        if [ ! -d "node_modules" ]; then
            echo "📦 Installation des dépendances..."
            npm install
        fi
        
        # Vérifier la configuration
        if [ ! -f ".env" ]; then
            echo "❌ Fichier .env manquant! Copiez .env.example vers .env et configurez-le."
            exit 1
        fi
        
        # Démarrer l'API en arrière-plan
        nohup node bot.js > "$LOG_FILE" 2>&1 & echo $! > "$PID_FILE"
        sleep 2
        
        if kill -0 "$(cat $PID_FILE)" 2>/dev/null; then
            echo "✅ API démarrée avec succès (PID: $(cat $PID_FILE))"
            echo "📊 Logs disponibles dans: $LOG_FILE"
            echo "🌐 API accessible sur: http://localhost:3001"
        else
            echo "❌ Échec du démarrage de l'API"
            rm -f "$PID_FILE"
            exit 1
        fi
        ;;
        
    stop)
        echo "⏹️  Arrêt de l'API Theronis Harvest..."
        if [ -f "$PID_FILE" ]; then
            PID=$(cat $PID_FILE)
            if kill -0 "$PID" 2>/dev/null; then
                kill "$PID"
                sleep 2
                if kill -0 "$PID" 2>/dev/null; then
                    kill -9 "$PID"
                fi
                rm -f "$PID_FILE"
                echo "✅ API arrêtée"
            else
                echo "⚠️  L'API n'était pas en cours d'exécution"
                rm -f "$PID_FILE"
            fi
        else
            echo "⚠️  Aucun fichier PID trouvé"
        fi
        ;;
        
    restart)
        echo "🔄 Redémarrage de l'API..."
        $0 stop
        sleep 1
        $0 start
        ;;
        
    status)
        if [ -f "$PID_FILE" ] && kill -0 "$(cat $PID_FILE)" 2>/dev/null; then
            PID=$(cat $PID_FILE)
            echo "✅ API en cours d'exécution (PID: $PID)"
            echo "🌐 URL: http://localhost:3001"
            echo "📊 Uptime: $(ps -o etime= -p $PID)"
            echo "💾 Mémoire: $(ps -o rss= -p $PID | awk '{print $1/1024 " MB"}')"
        else
            echo "❌ API arrêtée"
            [ -f "$PID_FILE" ] && rm -f "$PID_FILE"
        fi
        ;;
        
    logs)
        if [ -f "$LOG_FILE" ]; then
            echo "📊 Logs de l'API (Ctrl+C pour quitter):"
            tail -f "$LOG_FILE"
        else
            echo "❌ Aucun fichier de log trouvé"
        fi
        ;;
        
    test)
        echo "🧪 Test de l'API..."
        
        # Test de santé de l'API
        if curl -s http://localhost:3001/api/health > /dev/null; then
            echo "✅ API accessible"
        else
            echo "❌ API non accessible"
            exit 1
        fi
        
        # Test de la base de données
        if [ -f "$API_DIR/database/users.db" ]; then
            echo "✅ Base de données présente"
        else
            echo "⚠️  Base de données sera créée au premier démarrage"
        fi
        ;;
        
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|test}"
        echo ""
        echo "Commandes disponibles:"
        echo "  start   - Démarrer l'API"
        echo "  stop    - Arrêter l'API"
        echo "  restart - Redémarrer l'API"
        echo "  status  - Statut de l'API"
        echo "  logs    - Afficher les logs en temps réel"
        echo "  test    - Tester la connectivité"
        exit 1
        ;;
esac