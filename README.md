# 🌿 Theronis Harvest - Site Maraîcher

Site e-commerce pour maraîcher en Guadeloupe avec système de commandes et gestion de stock.

## 🏗️ Architecture du Projet

```
├── Backend/              # API Node.js + Express
│   ├── server.js        # Serveur principal
│   ├── database.js      # Configuration base de données MySQL
│   ├── routes/          # Routes API (products, users, orders)
│   └── import-products.js # Import des produits en BDD
├── Site/                # Frontend (HTML/CSS/JS)
│   ├── index.html       # Page principale
│   ├── script.js        # Logique frontend
│   ├── config.js        # Configuration API
│   ├── auth.js          # Gestion authentification
│   └── products.json    # Données produits (fallback)
└── Discord/             # Bot Discord (optionnel)
    └── bot.js           # Notifications de commandes
```

## 🚀 Déploiement sur Infomaniak avec Node.js

### Configuration choisie
- ✅ **Frontend + Backend + Base de données** : Tout sur Infomaniak
- ✅ **Node.js** : Supporté nativement
- ✅ **MySQL** : Base de données incluse
- ✅ **SSL** : Let's Encrypt gratuit

### Déploiement rapide

1. **Préparer les fichiers** :
   ```bash
   chmod +x prepare-nodejs-infomaniak.sh
   ./prepare-nodejs-infomaniak.sh
   ```

2. **Dans Manager Infomaniak** :
   - Créer base de données MySQL
   - Configurer application Node.js 
   - Uploader les fichiers générés

3. **Consulter** : `NODEJS_INFOMANIAK.md` pour le guide détaillé

## 🛠️ Technologies

- **Frontend** : HTML5, CSS3, JavaScript ES6+
- **Backend** : Node.js, Express.js
- **Base de données** : MySQL (Infomaniak)
- **Authentification** : JWT + bcrypt
- **Hébergement** : Infomaniak (Node.js + MySQL)

## 🌟 Fonctionnalités

- 📱 **Catalogue produits** : Fruits, légumes, herbes
- 🛒 **Panier** : Ajout/suppression avec localStorage
- 👤 **Comptes utilisateurs** : Inscription/connexion
- 📦 **Commandes** : Système complet de commandes
- 📊 **Gestion stock** : Mise à jour automatique
- 🔐 **Sécurité** : Authentification JWT, validation données
- 📱 **Responsive** : Compatible mobile/desktop
- 🔔 **Notifications Discord** : Alertes commandes (optionnel)

## 💰 Coût estimé

- **Hébergement Node.js Infomaniak** : 15-25€/mois
- **Inclus** : Base MySQL + SSL + Support FR + Sauvegardes

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
## 📞 Support

- **Documentation** : `NODEJS_INFOMANIAK.md`
- **Support Infomaniak** : Manager → Chat/Téléphone (français)

---

🌿 **Theronis Harvest** - Maraîcher numérique en Guadeloupe

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