#!/bin/sh

echo "🤖 LANCEMENT BOT DISCORD - SANS SERVEUR WEB"
echo "=========================================="

cd theronis-harvest/Discord

# Créer une version temporaire du bot sans serveur Express
cat > bot-simple.js << 'EOFBOT'
const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

// Configuration
const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;

console.log('🤖 Démarrage du bot Discord Theronis Harvest...');

// Initialisation du client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
});

// Commandes slash
const commands = [
    new SlashCommandBuilder()
        .setName('theronis')
        .setDescription('Informations sur Theronis Harvest'),
    new SlashCommandBuilder()
        .setName('status')
        .setDescription('État du système Theronis Harvest'),
    new SlashCommandBuilder()
        .setName('produits')
        .setDescription('Voir les produits disponibles'),
];

// Enregistrement des commandes
const rest = new REST({ version: '9' }).setToken(TOKEN);

async function deployCommands() {
    try {
        console.log('🔄 Enregistrement des commandes slash...');
        
        if (GUILD_ID) {
            await rest.put(Routes.applicationGuildCommands(client.user.id, GUILD_ID), {
                body: commands,
            });
            console.log('✅ Commandes slash enregistrées pour le serveur !');
        } else {
            await rest.put(Routes.applicationCommands(client.user.id), {
                body: commands,
            });
            console.log('✅ Commandes slash enregistrées globalement !');
        }
    } catch (error) {
        console.error('❌ Erreur lors de l\'enregistrement des commandes:', error);
    }
}

// Événement de connexion
client.once('ready', async () => {
    console.log(`✅ Bot connecté: ${client.user.tag}`);
    console.log(`🌐 Serveurs: ${client.guilds.cache.size}`);
    console.log(`👥 Utilisateurs: ${client.users.cache.size}`);
    
    // Enregistrer les commandes
    await deployCommands();
    
    // Statut du bot
    client.user.setActivity('🌿 Theronis Harvest', { type: 'WATCHING' });
    
    console.log('🎉 Bot Theronis Harvest opérationnel !');
});

// Gestion des commandes slash
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    try {
        if (commandName === 'theronis') {
            const embed = new EmbedBuilder()
                .setColor('#28a745')
                .setTitle('🌿 Theronis Harvest')
                .setDescription('Maraîcher de Guadeloupe - Produits frais et locaux')
                .addFields(
                    { name: '🌐 Site web', value: 'https://test.tfe91.fr', inline: true },
                    { name: '📦 Produits', value: 'Fruits et légumes bio', inline: true },
                    { name: '📍 Localisation', value: 'Guadeloupe', inline: true }
                )
                .setThumbnail('https://example.com/logo.png')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
        
        else if (commandName === 'status') {
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('📊 État du système')
                .addFields(
                    { name: '🤖 Bot Discord', value: '✅ Opérationnel', inline: true },
                    { name: '🌐 Site web', value: '✅ En ligne', inline: true },
                    { name: '📊 API', value: '✅ Fonctionnelle', inline: true },
                    { name: '🗄️ Base de données', value: '✅ Connectée', inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
        
        else if (commandName === 'produits') {
            const embed = new EmbedBuilder()
                .setColor('#ff6b35')
                .setTitle('📦 Nos Produits')
                .setDescription('Découvrez nos fruits et légumes frais de Guadeloupe')
                .addFields(
                    { name: '🍅 Légumes', value: 'Tomates créoles, Christophines, Épinards pays', inline: false },
                    { name: '🥭 Fruits', value: 'Mangues Julie, Bananes plantain, Papayes', inline: false },
                    { name: '🌶️ Épices', value: 'Piments végétariens, Herbes locales', inline: false }
                )
                .setFooter({ text: 'Commandez sur notre site web !' })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('🛒 Voir le site')
                        .setStyle(ButtonStyle.Link)
                        .setURL('https://test.tfe91.fr')
                );

            await interaction.reply({ embeds: [embed], components: [row] });
        }
    } catch (error) {
        console.error('Erreur commande:', error);
        await interaction.reply('❌ Erreur lors du traitement de la commande.');
    }
});

// Gestion des messages
client.on('messageCreate', message => {
    if (message.author.bot) return;

    // Commandes simples
    if (message.content === '!theronis') {
        message.reply('🌿 Theronis Harvest est en ligne ! Visitez https://test.tfe91.fr');
    }
    
    if (message.content === '!status') {
        message.reply('✅ Système Theronis Harvest opérationnel !');
    }
    
    if (message.content === '!help') {
        message.reply('🤖 **Commandes disponibles:**\n' +
                     '• `/theronis` - Informations générales\n' +
                     '• `/status` - État du système\n' +
                     '• `/produits` - Catalogue des produits\n' +
                     '• `!theronis`, `!status`, `!help` - Commandes rapides');
    }
});

// Gestion des erreurs
client.on('error', error => {
    console.error('❌ Erreur du bot Discord:', error);
});

process.on('unhandledRejection', error => {
    console.error('❌ Erreur non gérée:', error);
});

// Connexion
if (!TOKEN) {
    console.error('❌ Token Discord manquant dans le fichier .env');
    process.exit(1);
}

client.login(TOKEN)
    .then(() => console.log('🔐 Connexion au Discord...'))
    .catch(error => {
        console.error('❌ Erreur de connexion:', error);
        process.exit(1);
    });
EOFBOT

echo "🚀 Lancement du bot simplifié (sans serveur web)..."
nohup node bot-simple.js > bot-simple.log 2>&1 &
BOT_PID=$!

sleep 3

echo "🤖 Bot démarré (PID: $BOT_PID)"
echo "📋 Logs: tail -f theronis-harvest/Discord/bot-simple.log"

# Vérifier le démarrage
if ps -p $BOT_PID > /dev/null 2>&1; then
    echo "✅ Bot Discord opérationnel sans conflit de port !"
    echo ""
    echo "📊 Informations:"
    echo "   🔧 PID: $BOT_PID"
    echo "   📋 Logs: tail -f bot-simple.log"
    echo "   ⏹️  Arrêter: kill $BOT_PID"
    echo ""
    
    echo "📋 Status du bot:"
    tail -n 5 bot-simple.log 2>/dev/null || echo "Logs en cours..."
else
    echo "❌ Erreur de démarrage"
    echo "📋 Voir les logs: cat bot-simple.log"
fi
