# Theronis Harvest - Projet Complet

## 🌟 Vue d'ensemble

Projet complet pour Theronis Harvest comprenant :
- **Site Web E-commerce** (Dossier `/Site`)
- **Bot Discord** avec création automatique de comptes (Dossier `/Discord`)

## 📁 Structure du Projet

```
Maraicher/
├── Site/                   # Site web e-commerce
│   ├── index.html         # Page principale
│   ├── styles.css         # Styles CSS (Dark Mode)
│   ├── script.js          # JavaScript principal
│   ├── auth.js            # Système d'authentification
│   ├── products.json      # Base de données produits
│   └── README.md          # Documentation du site
│
├── Discord/               # Bot Discord
│   ├── bot.js            # Code principal du bot
│   ├── package.json      # Dépendances Node.js
│   ├── .env              # Variables d'environnement
│   ├── .env.example      # Exemple de configuration
│   ├── .gitignore        # Fichiers à ignorer
│   ├── README.md         # Documentation du bot
│   └── database/         # Base de données SQLite (auto-créée)
│
└── README.md             # Ce fichier
```

## 🚀 Démarrage Rapide

### 1. Site Web
```bash
cd Site
# Ouvrir index.html dans un navigateur
# OU utiliser un serveur local :
python -m http.server 3000
```

### 2. Bot Discord
```bash
cd Discord
npm install
# Configurer le .env avec vos tokens Discord
npm start
```

## 🛍️ Fonctionnalités du Site

### Catalogue Produits
- **7 Fruits** : Citron, Pomme, Coco, Ananas, Fraise, Melon, Pastèque
- **5 Légumes** : Poivron, Tomate, Salade, Cornichon, Piment  
- **2 Plantes** : Menthe, Houblon
- **Prix unique** : $20 pour tous les produits

### Zones de Livraison
- **Paleto** : $500
- **Sandy** : $1,500
- **San Andreas** : $2,500

### Interface
- ✅ Design dark mode moderne
- ✅ Responsive (mobile/desktop)
- ✅ Panier interactif
- ✅ Système de filtres
- ✅ Notifications en temps réel

## 🤖 Fonctionnalités du Bot Discord

### Commandes Disponibles
- `/creer-compte` - Créer un compte utilisateur
- `/mon-compte` - Voir ses informations
- `/commander` - Passer une commande
- `/produits` - Liste des produits
- `/livraisons` - Zones de livraison

### Système de Comptes
- ✅ Création automatique via Discord
- ✅ Mots de passe temporaires générés
- ✅ Base de données SQLite sécurisée
- ✅ Authentification sur le site web

### API REST
- ✅ Connexion site ↔ Discord
- ✅ Authentification utilisateurs
- ✅ Historique des commandes

## 🔧 Configuration

### Bot Discord
1. Créer une application sur https://discord.com/developers/applications
2. Créer un bot et copier le token
3. Configurer le fichier `.env` dans `/Discord`
4. Inviter le bot sur votre serveur avec les bonnes permissions

### Intégration Site-Discord
Le site web se connecte automatiquement à l'API du bot Discord (port 3001) pour :
- Authentifier les utilisateurs créés via Discord
- Récupérer l'historique des commandes
- Synchroniser les données

## 💾 Base de Données

### Tables créées automatiquement :
- **users** : Informations utilisateurs
- **orders** : Commandes passées via Discord

### Données stockées :
- Comptes utilisateurs Discord
- Historique des commandes
- Informations de livraison

## 🛡️ Sécurité

- ✅ Mots de passe hashés (bcrypt)
- ✅ Communications Discord privées
- ✅ API sécurisée
- ✅ Validation des données

## 📱 Utilisation

### Pour les Utilisateurs

1. **Sur Discord** :
   ```
   /creer-compte email:mon@email.com nom-complet:"Mon Nom"
   ```

2. **Sur le Site Web** :
   - Cliquer sur "Connexion"
   - Utiliser les identifiants reçus sur Discord
   - Naviguer et commander

3. **Commander via Discord** :
   ```
   /commander produits:"2x Tomate, 1x Pomme" zone-livraison:paleto adresse:"123 Rue Example"
   ```

## 🔄 Workflow Complet

```
1. Utilisateur rejoint Discord
    ↓
2. Utilise /creer-compte sur Discord
    ↓
3. Reçoit identifiants temporaires
    ↓
4. Se connecte sur le site web
    ↓
5. Peut commander via Discord OU le site
    ↓
6. Suivi des commandes sur les deux plateformes
```

## 🎨 Personnalisation

### Modifier les Produits
Éditez `/Site/products.json` :
```json
{
  "name": "Nouveau Produit",
  "price": 20.00,
  "description": "Description",
  "icon": "🥕",
  "stock": 500
}
```

### Modifier les Prix de Livraison
Dans `/Discord/bot.js`, section `deliveryCosts` :
```javascript
const deliveryCosts = {
    'paleto': 500,
    'sandy': 1500,
    'san_andreas': 2500
};
```

## 📊 Monitoring

### Logs Discord Bot
- Console du serveur
- Canal Discord configuré
- Événements utilisateurs

### Analytics Site Web
- Notifications en temps réel
- Suivi des interactions
- Gestion d'erreurs

## 🚨 Résolution de Problèmes

### Site Web ne charge pas les produits
```bash
# Utiliser un serveur local
python -m http.server 3000
```

### Bot Discord ne répond pas
```bash
# Vérifier les variables d'environnement
cd Discord
cat .env
```

### Connexion site impossible
```bash
# Vérifier que l'API du bot fonctionne
curl http://localhost:3001/api/login
```

## 📈 Évolutions Possibles

### Site Web
- [ ] Système de paiement
- [ ] Gestion des stocks en temps réel
- [ ] Interface d'administration
- [ ] Tracking de livraison

### Bot Discord
- [ ] Notifications de livraison
- [ ] Système de fidélité
- [ ] Commandes récurrentes
- [ ] Support multi-serveurs

## 👥 Support

Pour toute question :
1. Consulter les README spécifiques (`/Site/README.md`, `/Discord/README.md`)
2. Vérifier les logs d'erreurs
3. Tester les connexions entre composants

---

**Theronis Harvest** - *Votre maraîcher connecté entre Discord et le Web !* 🌿💻🤖