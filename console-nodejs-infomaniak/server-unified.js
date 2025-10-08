const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Import des modules
const { testConnection, initDatabase } = require('./database');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de sécurité
app.use(helmet({
    contentSecurityPolicy: false // Désactiver pour servir les fichiers statiques
}));

// Configuration CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

// Middleware pour parser JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// =====================================
// SERVIR LES FICHIERS STATIQUES (SITE WEB)
// =====================================

// Servir les fichiers du frontend depuis le dossier 'frontend'
app.use(express.static(path.join(__dirname, '../frontend')));

// Route pour servir index.html à la racine
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Routes SPA - rediriger toutes les routes non-API vers index.html
app.get(/^\/(?!api).*/, (req, res) => {
    // Vérifier si c'est un fichier statique
    const filePath = path.join(__dirname, '../frontend', req.path);
    const fs = require('fs');
    
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        res.sendFile(filePath);
    } else {
        // Sinon, servir index.html pour le routing client
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    }
});

// =====================================
// ROUTES API
// =====================================

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        services: {
            frontend: 'active',
            api: 'active',
            database: 'connected'
        }
    });
});

// =====================================
// DÉMARRAGE BOT DISCORD (OPTIONNEL)
// =====================================

let discordBot = null;

async function startDiscordBot() {
    if (process.env.DISCORD_TOKEN) {
        try {
            console.log('🤖 Démarrage du bot Discord...');
            
            // Importer et démarrer le bot Discord
            const discordBotPath = path.join(__dirname, '../Discord/bot.js');
            const fs = require('fs');
            
            if (fs.existsSync(discordBotPath)) {
                // Démarrer le bot Discord en tant que processus enfant
                const { spawn } = require('child_process');
                
                discordBot = spawn('node', [discordBotPath], {
                    cwd: path.join(__dirname, '../Discord'),
                    stdio: ['pipe', 'pipe', 'pipe']
                });
                
                discordBot.stdout.on('data', (data) => {
                    console.log(`[DISCORD] ${data}`);
                });
                
                discordBot.stderr.on('data', (data) => {
                    console.error(`[DISCORD ERROR] ${data}`);
                });
                
                discordBot.on('close', (code) => {
                    console.log(`[DISCORD] Bot arrêté avec le code ${code}`);
                });
                
                console.log('✅ Bot Discord démarré avec succès');
            } else {
                console.log('ℹ️  Bot Discord non trouvé, continuons sans');
            }
        } catch (error) {
            console.error('❌ Erreur démarrage bot Discord:', error.message);
            console.log('ℹ️  Continuons sans le bot Discord');
        }
    } else {
        console.log('ℹ️  DISCORD_TOKEN non configuré, bot Discord désactivé');
    }
}

// =====================================
// GESTION D'ERREURS
// =====================================

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Quelque chose s\'est mal passé!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Erreur interne du serveur'
    });
});

// Gestion des routes non trouvées pour l'API
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'Route API non trouvée' });
});

// =====================================
// DÉMARRAGE DU SERVEUR
// =====================================

async function startServer() {
    try {
        console.log('🚀 Démarrage de Theronis Harvest...');
        
        // Test de la connexion à la base de données
        console.log('📊 Test de connexion à la base de données...');
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('❌ Impossible de se connecter à la base de données');
            console.log('⚠️  Le serveur continuera sans base de données');
        } else {
            console.log('✅ Base de données connectée');
            
            // Initialisation de la base de données
            console.log('🔧 Initialisation des tables...');
            await initDatabase();
            console.log('✅ Tables initialisées');
        }

        // Démarrage du serveur web
        const server = app.listen(PORT, () => {
            console.log('🌐 ================================');
            console.log(`🚀 Serveur Theronis Harvest démarré !`);
            console.log(`📍 Port: ${PORT}`);
            console.log(`🌍 URL: http://localhost:${PORT}`);
            console.log(`🛠️  API: http://localhost:${PORT}/api/health`);
            console.log(`📊 Environnement: ${process.env.NODE_ENV}`);
            console.log('🌐 ================================');
        });

        // Démarrer le bot Discord (si configuré)
        await startDiscordBot();

        // Gestion propre de l'arrêt
        const gracefulShutdown = (signal) => {
            console.log(`\n${signal} reçu, arrêt propre...`);
            
            server.close(() => {
                console.log('🔚 Serveur web arrêté');
                
                if (discordBot) {
                    console.log('🤖 Arrêt du bot Discord...');
                    discordBot.kill('SIGTERM');
                }
                
                process.exit(0);
            });
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        console.error('❌ Erreur lors du démarrage du serveur:', error);
        process.exit(1);
    }
}

// Démarrage
startServer();
