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
