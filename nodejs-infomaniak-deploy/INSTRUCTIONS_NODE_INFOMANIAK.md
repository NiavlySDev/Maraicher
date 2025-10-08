# Instructions Déploiement Node.js Infomaniak

## 📁 Structure préparée

```
public_html/
├── frontend/          # Site web visible
├── api/              # Backend Node.js
├── logs/             # Logs d'application
└── .htaccess         # Configuration Apache + Proxy
```

## 🚀 Étapes de déploiement

### 1. Base de données
- Manager Infomaniak → Hébergement Web → Bases de données
- Créer une nouvelle base MySQL
- Noter : host, nom, user, password

### 2. Upload des fichiers
- Uploader tout le contenu de public_html/ vers votre dossier public_html Infomaniak
- Via FTP, SFTP ou interface web Infomaniak

### 3. Configuration Node.js
- Manager Infomaniak → Hébergement Web → Applications → Node.js
- Créer une nouvelle application Node.js :
  - Dossier : /api/
  - Fichier principal : server.js
  - Port : 3001

### 4. Variables d'environnement
Dans le panel Node.js Infomaniak, ajouter :

```
DB_HOST=mysql.infomaniak.com
DB_NAME=votre_base_de_donnees
DB_USER=votre_username
DB_PASSWORD=votre_password
PORT=3001
NODE_ENV=production
JWT_SECRET=cle_longue_et_unique
FRONTEND_URL=https://votre-domaine.infomaniak.com
```

### 5. Installation et démarrage
Via SSH Infomaniak (si disponible) :

```bash
cd /public_html/api
npm install
npm run init-db
npm run import-products
npm start
```

### 6. Test
- Site : https://votre-domaine.infomaniak.com
- API : https://votre-domaine.infomaniak.com/api/health
- Produits : https://votre-domaine.infomaniak.com/api/products

## 💰 Coût estimé
- Plan Node.js Infomaniak : ~15-25€/mois
- Tout inclus : hébergement + base de données + SSL + support

## 📞 Support
Si problèmes : Support Infomaniak via Manager (chat/téléphone en français)

Consultez NODEJS_INFOMANIAK.md pour plus de détails.
