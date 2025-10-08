const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Configuration
const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
const PORT = process.env.PORT || 3001;
const API_SECRET = process.env.API_SECRET;
const DB_TYPE = process.env.DB_TYPE || 'sqlite';

// Configuration de la base de données
const dbConfig = {
    type: DB_TYPE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
};

// Initialisation du client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Initialisation de la base de données
let db;

async function initDatabase() {
    try {
        if (dbConfig.type === 'mysql') {
            const mysql = require('mysql2/promise');
            db = await mysql.createConnection({
                host: dbConfig.host,
                port: dbConfig.port,
                user: dbConfig.user,
                password: dbConfig.password,
                database: dbConfig.database
            });
            
            console.log('✅ Connecté à MySQL');
            
            // Création des tables MySQL
            await db.execute(`CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                discord_id VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP NULL,
                is_active BOOLEAN DEFAULT TRUE,
                delivery_address TEXT,
                phone VARCHAR(50)
            )`);

            await db.execute(`CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                discord_id VARCHAR(255) NOT NULL,
                products TEXT NOT NULL,
                total_amount DECIMAL(10,2) NOT NULL,
                delivery_zone VARCHAR(100) NOT NULL,
                delivery_cost DECIMAL(10,2) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`);
            
        } else if (dbConfig.type === 'postgresql') {
            const { Client } = require('pg');
            db = new Client({
                host: dbConfig.host,
                port: dbConfig.port,
                user: dbConfig.user,
                password: dbConfig.password,
                database: dbConfig.database
            });
            
            await db.connect();
            console.log('✅ Connecté à PostgreSQL');
            
            // Création des tables PostgreSQL
            await db.query(`CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                discord_id VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE,
                delivery_address TEXT,
                phone VARCHAR(50)
            )`);

            await db.query(`CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                discord_id VARCHAR(255) NOT NULL,
                products TEXT NOT NULL,
                total_amount DECIMAL(10,2) NOT NULL,
                delivery_zone VARCHAR(100) NOT NULL,
                delivery_cost DECIMAL(10,2) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`);
            
        } else {
            // Fallback SQLite
            const sqlite3 = require('sqlite3').verbose();
            db = new sqlite3.Database('./database/users.db');
            console.log('✅ Connecté à SQLite (local)');
            
            db.serialize(() => {
                db.run(`CREATE TABLE IF NOT EXISTS users (
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
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS orders (
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
                )`);
            });
        }
        
    } catch (error) {
        console.error('❌ Erreur de connexion à la base de données:', error);
        process.exit(1);
    }
}

// Fonctions d'assistance pour les requêtes
async function dbQuery(query, params = []) {
    if (dbConfig.type === 'mysql') {
        const [rows] = await db.execute(query, params);
        return rows;
    } else if (dbConfig.type === 'postgresql') {
        const result = await db.query(query, params);
        return result.rows;
    } else {
        // SQLite
        return new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

async function dbRun(query, params = []) {
    if (dbConfig.type === 'mysql') {
        const [result] = await db.execute(query, params);
        return result;
    } else if (dbConfig.type === 'postgresql') {
        const result = await db.query(query, params);
        return result;
    } else {
        // SQLite
        return new Promise((resolve, reject) => {
            db.run(query, params, function(err) {
                if (err) reject(err);
                else resolve({ lastID: this.lastID, changes: this.changes });
            });
        });
    }
}

// Configuration des commandes slash
const commands = [
    new SlashCommandBuilder()
        .setName('creer-compte')
        .setDescription('Créer un compte sur Theronis Harvest')
        .addStringOption(option =>
            option.setName('email')
                .setDescription('Votre adresse email')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('nom-complet')
                .setDescription('Votre nom complet')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('telephone')
                .setDescription('Votre numéro de téléphone')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('mon-compte')
        .setDescription('Voir les informations de votre compte'),

    new SlashCommandBuilder()
        .setName('commander')
        .setDescription('Passer une commande')
        .addStringOption(option =>
            option.setName('produits')
                .setDescription('Liste des produits (ex: "2x Tomate, 1x Pomme")')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('zone-livraison')
                .setDescription('Zone de livraison')
                .setRequired(true)
                .addChoices(
                    { name: 'Paleto ($500)', value: 'paleto' },
                    { name: 'Sandy ($1500)', value: 'sandy' },
                    { name: 'San Andreas ($2500)', value: 'san_andreas' }
                ))
        .addStringOption(option =>
            option.setName('adresse')
                .setDescription('Adresse de livraison')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('produits')
        .setDescription('Voir la liste des produits disponibles'),

    new SlashCommandBuilder()
        .setName('livraisons')
        .setDescription('Voir les zones et tarifs de livraison')
];

// Enregistrement des commandes
const rest = new REST({ version: '9' }).setToken(TOKEN);

(async () => {
    try {
        console.log('🔄 Enregistrement des commandes slash...');
        await rest.put(Routes.applicationGuildCommands(client.user?.id || 'CLIENT_ID', GUILD_ID), {
            body: commands,
        });
        console.log('✅ Commandes slash enregistrées avec succès!');
    } catch (error) {
        console.error('❌ Erreur lors de l\'enregistrement des commandes:', error);
    }
})();

// Événements du bot
client.once('ready', async () => {
    console.log(`🤖 Bot connecté en tant que ${client.user.tag}!`);
    
    // Enregistrer les commandes après la connexion
    try {
        await rest.put(Routes.applicationGuildCommands(client.user.id, GUILD_ID), {
            body: commands,
        });
        console.log('✅ Commandes slash mises à jour!');
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour des commandes:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    try {
        switch (commandName) {
            case 'creer-compte':
                await handleCreateAccount(interaction);
                break;
            case 'mon-compte':
                await handleMyAccount(interaction);
                break;
            case 'commander':
                await handleOrder(interaction);
                break;
            case 'produits':
                await handleProducts(interaction);
                break;
            case 'livraisons':
                await handleDeliveries(interaction);
                break;
        }
    } catch (error) {
        console.error('Erreur lors du traitement de la commande:', error);
        await interaction.reply({
            content: '❌ Une erreur est survenue lors du traitement de votre demande.',
            ephemeral: true
        });
    }
});

// Gestion de la création de compte
async function handleCreateAccount(interaction) {
    const email = interaction.options.getString('email');
    const fullName = interaction.options.getString('nom-complet');
    const phone = interaction.options.getString('telephone') || '';
    const discordId = interaction.user.id;
    const username = interaction.user.username;

    // Vérifier si l'utilisateur existe déjà
    db.get('SELECT * FROM users WHERE discord_id = ? OR email = ?', [discordId, email], async (err, row) => {
        if (err) {
            console.error('Erreur DB:', err);
            return await interaction.reply({
                content: '❌ Erreur lors de la création du compte.',
                ephemeral: true
            });
        }

        if (row) {
            return await interaction.reply({
                content: '⚠️ Vous avez déjà un compte ou cet email est déjà utilisé!',
                ephemeral: true
            });
        }

        // Générer un mot de passe temporaire
        const tempPassword = generateTempPassword();
        const passwordHash = await bcrypt.hash(tempPassword, 10);

        // Créer le compte
        db.run(
            'INSERT INTO users (discord_id, username, email, password_hash, full_name, phone) VALUES (?, ?, ?, ?, ?, ?)',
            [discordId, username, email, passwordHash, fullName, phone],
            async function(err) {
                if (err) {
                    console.error('Erreur création compte:', err);
                    return await interaction.reply({
                        content: '❌ Erreur lors de la création du compte.',
                        ephemeral: true
                    });
                }

                const embed = new EmbedBuilder()
                    .setColor(0x3b82f6)
                    .setTitle('🎉 Compte créé avec succès!')
                    .setDescription('Votre compte Theronis Harvest a été créé.')
                    .addFields(
                        { name: '👤 Nom', value: fullName, inline: true },
                        { name: '📧 Email', value: email, inline: true },
                        { name: '🔑 Mot de passe temporaire', value: `\`${tempPassword}\``, inline: false },
                        { name: '⚠️ Important', value: 'Changez votre mot de passe lors de votre première connexion sur le site.', inline: false }
                    )
                    .setFooter({ text: 'Theronis Harvest - Votre maraîcher de confiance' })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });

                // Log dans le canal de logs
                logUserAction(`Nouveau compte créé: ${fullName} (${email})`);
            }
        );
    });
}

// Gestion de l'affichage du compte
async function handleMyAccount(interaction) {
    const discordId = interaction.user.id;

    db.get('SELECT * FROM users WHERE discord_id = ?', [discordId], async (err, user) => {
        if (err || !user) {
            return await interaction.reply({
                content: '❌ Aucun compte trouvé. Utilisez `/creer-compte` pour créer un compte.',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor(0x3b82f6)
            .setTitle('👤 Mon Compte Theronis Harvest')
            .addFields(
                { name: '📧 Email', value: user.email, inline: true },
                { name: '👤 Nom', value: user.full_name || 'Non renseigné', inline: true },
                { name: '📞 Téléphone', value: user.phone || 'Non renseigné', inline: true },
                { name: '📅 Créé le', value: new Date(user.created_at).toLocaleDateString('fr-FR'), inline: true },
                { name: '🟢 Statut', value: user.is_active ? 'Actif' : 'Inactif', inline: true }
            )
            .setFooter({ text: 'Theronis Harvest' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    });
}

// Gestion des commandes
async function handleOrder(interaction) {
    const discordId = interaction.user.id;
    const products = interaction.options.getString('produits');
    const deliveryZone = interaction.options.getString('zone-livraison');
    const address = interaction.options.getString('adresse');

    // Vérifier si l'utilisateur a un compte
    db.get('SELECT * FROM users WHERE discord_id = ?', [discordId], async (err, user) => {
        if (err || !user) {
            return await interaction.reply({
                content: '❌ Vous devez créer un compte avec `/creer-compte` avant de commander.',
                ephemeral: true
            });
        }

        // Calculer le coût de livraison
        const deliveryCosts = {
            'paleto': 500,
            'sandy': 1500,
            'san_andreas': 2500
        };
        const deliveryCost = deliveryCosts[deliveryZone];
        const deliveryNames = {
            'paleto': 'Paleto',
            'sandy': 'Sandy',
            'san_andreas': 'San Andreas'
        };

        // Calculer le coût des produits (simulation - tous les produits sont à $20)
        const productCount = products.split(',').length;
        const productsTotal = productCount * 20;
        const totalAmount = productsTotal + deliveryCost;

        // Enregistrer la commande
        db.run(
            'INSERT INTO orders (user_id, discord_id, products, total_amount, delivery_zone, delivery_cost) VALUES (?, ?, ?, ?, ?, ?)',
            [user.id, discordId, products, totalAmount, deliveryZone, deliveryCost],
            async function(err) {
                if (err) {
                    console.error('Erreur création commande:', err);
                    return await interaction.reply({
                        content: '❌ Erreur lors de la création de la commande.',
                        ephemeral: true
                    });
                }

                const embed = new EmbedBuilder()
                    .setColor(0x22c55e)
                    .setTitle('🛒 Commande enregistrée!')
                    .setDescription('Votre commande a été enregistrée avec succès.')
                    .addFields(
                        { name: '📦 Produits', value: products, inline: false },
                        { name: '📍 Zone de livraison', value: deliveryNames[deliveryZone], inline: true },
                        { name: '🏠 Adresse', value: address, inline: true },
                        { name: '💰 Coût produits', value: `$${productsTotal}`, inline: true },
                        { name: '🚚 Coût livraison', value: `$${deliveryCost}`, inline: true },
                        { name: '💳 Total', value: `$${totalAmount}`, inline: true },
                        { name: '📋 N° Commande', value: `#${this.lastID}`, inline: true }
                    )
                    .setFooter({ text: 'Nous vous contacterons pour la livraison' })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });

                // Log dans le canal de logs
                logUserAction(`Nouvelle commande #${this.lastID}: ${user.full_name} - $${totalAmount} (${deliveryNames[deliveryZone]})`);
            }
        );
    });
}

// Affichage des produits
async function handleProducts(interaction) {
    const embed = new EmbedBuilder()
        .setColor(0x3b82f6)
        .setTitle('🛒 Produits Disponibles - Theronis Harvest')
        .setDescription('Tous nos produits sont vendus au prix unique de **$20**')
        .addFields(
            {
                name: '🍎 Fruits',
                value: '🍋 Citron\n🍎 Pomme\n🥥 Coco\n🍍 Ananas\n🍓 Fraise\n🍈 Melon\n🍉 Pastèque',
                inline: true
            },
            {
                name: '🥕 Légumes',
                value: '🫑 Poivron\n🍅 Tomate\n🥬 Salade\n🥒 Cornichon\n🌶️ Piment',
                inline: true
            },
            {
                name: '🌿 Plantes',
                value: '🌿 Menthe\n🍃 Houblon',
                inline: true
            }
        )
        .setFooter({ text: 'Utilisez /commander pour passer une commande' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
}

// Affichage des livraisons
async function handleDeliveries(interaction) {
    const embed = new EmbedBuilder()
        .setColor(0x3b82f6)
        .setTitle('🚚 Zones et Tarifs de Livraison')
        .setDescription('Nous livrons dans toute la région de San Andreas')
        .addFields(
            { name: '🏘️ Paleto', value: '**$500**\nLivraison rapide dans la zone de Paleto Bay', inline: true },
            { name: '🏜️ Sandy', value: '**$1,500**\nLivraison dans la région de Sandy Shores', inline: true },
            { name: '🌆 San Andreas', value: '**$2,500**\nLivraison dans tout San Andreas', inline: true }
        )
        .setFooter({ text: 'Les frais de livraison sont ajoutés au total de votre commande' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
}

// Fonctions utilitaires
function generateTempPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

function logUserAction(message) {
    if (LOG_CHANNEL_ID) {
        const channel = client.channels.cache.get(LOG_CHANNEL_ID);
        if (channel) {
            const embed = new EmbedBuilder()
                .setColor(0x3b82f6)
                .setDescription(message)
                .setTimestamp();
            channel.send({ embeds: [embed] });
        }
    }
    console.log(`📝 LOG: ${message}`);
}

// API Express pour la communication avec le site web
const app = express();
app.use(cors());
app.use(express.json());

// Middleware d'authentification pour certaines routes
function authenticateAPI(req, res, next) {
    const authHeader = req.headers['authorization'];
    const apiKey = req.headers['x-api-key'];
    
    // Vérifier si c'est une requête avec API key
    if (apiKey && apiKey === API_SECRET) {
        return next();
    }
    
    // Vérifier si c'est une requête avec JWT token
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
            const decoded = jwt.verify(token, API_SECRET);
            req.user = decoded;
            return next();
        } catch (error) {
            return res.status(401).json({ success: false, message: 'Token invalide' });
        }
    }
    
    // Pas d'authentification fournie
    res.status(401).json({ success: false, message: 'Authentification requise' });
}

// Route de santé de l'API
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        discord_bot: client.isReady() ? 'connected' : 'disconnected',
        database: 'connected'
    });
});

// Route pour vérifier les identifiants
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
        }

        // Mettre à jour la dernière connexion
        db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name,
                phone: user.phone
            }
        });
    });
});

// Route pour récupérer les commandes d'un utilisateur
app.get('/api/orders/:userId', (req, res) => {
    const { userId } = req.params;

    db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, orders) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
        res.json({ success: true, orders });
    });
});

// Créer le dossier database s'il n'existe pas
const fs = require('fs');
if (!fs.existsSync('./database')) {
    fs.mkdirSync('./database');
}

// Démarrage du serveur API
app.listen(PORT, () => {
    console.log(`🌐 API serveur démarré sur le port ${PORT}`);
});

// Connexion du bot Discord
client.login(TOKEN);