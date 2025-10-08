# Theronis Harvest - Site de Boutique en Ligne

## Description
Site web de boutique en ligne pour Theronis Harvest, une entreprise maraîchère basée en Guadeloupe. Le site permet aux clients de consulter et commander des fruits et légumes frais locaux.

## Fonctionnalités

### ✨ Interface Utilisateur
- Design moderne et responsive
- Navigation fluide avec animation smooth scroll
- Thème vert inspiré de la nature
- Icônes Font Awesome pour une meilleure UX

### 🛒 Système de Commande
- Catalogue de produits avec filtres (Tous, Légumes, Fruits, Herbes)
- Panier d'achat interactif
- Gestion des quantités
- Calcul automatique des totaux
- Système de notifications

### 📱 Responsive Design
- Optimisé pour mobile, tablette et desktop
- Interface adaptative selon la taille d'écran
- Navigation mobile simplifiée

### 🌿 Produits Locaux
- Produits frais de Guadeloupe
- Informations détaillées (origine, prix, disponibilité)
- Stock en temps réel
- Descriptions des produits locaux

## Structure du Projet

```
Maraicher/
├── index.html          # Page principale
├── styles.css          # Styles CSS
├── script.js           # JavaScript (interactions)
├── products.json       # Base de données des produits
└── README.md          # Documentation
```

## Installation et Utilisation

1. **Ouvrir le site :**
   - Ouvrir `index.html` dans un navigateur web
   - Ou utiliser un serveur local pour éviter les erreurs CORS

2. **Serveur local (recommandé) :**
   ```bash
   # Avec Python
   python -m http.server 8000
   
   # Avec Node.js (si vous avez live-server installé)
   npx live-server
   
   # Avec PHP
   php -S localhost:8000
   ```

3. **Accéder au site :**
   - Ouvrir http://localhost:8000 dans votre navigateur

## Personnalisation

### Modifier les Produits
Éditez le fichier `products.json` pour :
- Ajouter/supprimer des produits
- Modifier les prix et descriptions
- Changer les icônes et disponibilités
- Mettre à jour les stocks

Structure d'un produit :
```json
{
  "id": 1,
  "name": "Nom du produit",
  "category": "fruits|legumes|herbes",
  "price": 2.50,
  "unit": "kg|pièce|bouquet",
  "description": "Description du produit",
  "icon": "🍅",
  "availability": "available|limited|out-of-stock",
  "stock": 25,
  "origin": "Lieu d'origine, Guadeloupe"
}
```

### Modifier les Informations de Contact
Dans `index.html`, section contact :
- Adresse
- Téléphone
- Email

### Personnaliser les Couleurs
Dans `styles.css`, modifier les variables de couleur :
- Vert principal : `#4a7c23`
- Vert foncé : `#2d5016`
- Vert clair : `#a8d875`

## Fonctionnalités Techniques

### JavaScript
- Chargement dynamique des produits depuis JSON
- Gestion du panier avec localStorage (peut être ajouté)
- Filtrage et recherche de produits
- Animations et interactions fluides
- Système de notifications toast

### CSS
- Flexbox et CSS Grid pour la mise en page
- Animations CSS personnalisées
- Design mobile-first
- Variables CSS pour la maintenance

### Sécurité et Performance
- Code JavaScript optimisé
- Images optimisées (utilisation d'icônes emoji)
- CSS minifiable pour la production
- Structure SEO-friendly

## Extensions Possibles

### 🔧 Améliorations Techniques
- Intégration d'une base de données réelle
- Système de paiement en ligne
- Gestion des comptes utilisateurs
- Interface d'administration

### 📈 Fonctionnalités Business
- Système de livraison avec zones
- Programme de fidélité
- Commandes récurrentes
- Gestion des promotions

### 🎨 Interface
- Galerie d'images produits
- Avis clients
- Chat en ligne
- Blog/actualités

## Support et Maintenance

### Navigateurs Supportés
- Chrome/Chromium 70+
- Firefox 65+
- Safari 12+
- Edge 79+

### Résolution des Problèmes
- **Produits ne se chargent pas :** Vérifier que le fichier est servi via HTTP(S)
- **Styles cassés :** Vérifier les chemins des fichiers CSS
- **JavaScript non fonctionnel :** Consulter la console du navigateur

## Licence
Ce projet est créé pour Theronis Harvest. Tous droits réservés.

## Contact
Pour toute question technique ou modification, contactez le développeur.

---

**Theronis Harvest** - *Votre maraîcher de confiance en Guadeloupe* 🌿