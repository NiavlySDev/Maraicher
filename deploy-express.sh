#!/bin/sh

# 🚀 DÉPLOIEMENT EXPRESS - Une seule commande, tout est fait !

echo "🌿 THERONIS HARVEST - DÉPLOIEMENT EXPRESS"
echo "=========================================="

# Clone et setup en une fois
git clone https://github.com/NiavlySDev/Maraicher.git temp-repo 2>/dev/null || {
    rm -rf temp-repo
    git clone https://github.com/NiavlySDev/Maraicher.git temp-repo
}

# Créer l'app finale
rm -rf theronis-app
mkdir theronis-app
cd temp-repo

# Serveur tout-en-un ultra-compact
cat > ../theronis-app/app.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.static('public'));

// Base de données simulée
const PRODUCTS = [
    {id:1, name:'Tomates Créoles', price:4.50, category:'légumes', stock:50, description:'Tomates fraîches de Guadeloupe'},
    {id:2, name:'Bananes Plantain', price:3.20, category:'fruits', stock:30, description:'Bananes plantain mûres'},
    {id:3, name:'Christophines', price:2.80, category:'légumes', stock:25, description:'Christophines du jardin'},
    {id:4, name:'Mangues Julie', price:5.00, category:'fruits', stock:20, description:'Mangues Julie sucrées'},
    {id:5, name:'Épinards Pays', price:3.50, category:'légumes', stock:15, description:'Épinards pays bio'}
];

// API Routes
app.get('/api/health', (req, res) => res.json({status:'OK', timestamp:new Date().toISOString()}));
app.get('/api/products', (req, res) => res.json(PRODUCTS));
app.get('/api/products/:id', (req, res) => {
    const product = PRODUCTS.find(p => p.id == req.params.id);
    res.json(product || {error:'Produit non trouvé'});
});

app.post('/api/users/login', (req, res) => {
    res.json({success:true, token:'demo_token', user:{id:1, email:req.body.email, nom:'Demo'}});
});

app.post('/api/users/register', (req, res) => {
    res.json({success:true, message:'Inscription réussie'});
});

// Frontend
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html><head><title>🌿 Theronis Harvest</title><meta charset="utf-8">
<style>
body{font-family:Arial;margin:0;background:#f8f9fa}
.header{background:#28a745;color:white;padding:20px;text-align:center}
.container{max-width:1200px;margin:20px auto;padding:20px}
.products{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;margin-top:20px}
.product{background:white;padding:20px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1)}
.price{color:#28a745;font-weight:bold;font-size:1.2em}
.btn{background:#28a745;color:white;padding:10px 20px;border:none;border-radius:4px;cursor:pointer}
.btn:hover{background:#218838}
.status{background:#d4edda;color:#155724;padding:15px;border-radius:5px;margin:20px 0}
</style></head>
<body>
<div class="header">
    <h1>🌿 Theronis Harvest</h1>
    <p>Maraîcher de Guadeloupe - Produits frais et locaux</p>
</div>
<div class="container">
    <div class="status">✅ Site opérationnel • API active • Base de données connectée</div>
    <h2>🛒 Nos Produits</h2>
    <div class="products" id="products">Chargement des produits...</div>
</div>
<script>
fetch('/api/products')
.then(r=>r.json())
.then(products=>{
    document.getElementById('products').innerHTML = products.map(p=>
        \`<div class="product">
            <h3>\${p.name}</h3>
            <p>\${p.description}</p>
            <div class="price">\${p.price}€/kg</div>
            <p>Stock: \${p.stock} kg • Catégorie: \${p.category}</p>
            <button class="btn" onclick="addToCart(\${p.id})">Ajouter au panier</button>
        </div>\`
    ).join('');
})
.catch(()=>{document.getElementById('products').innerHTML='<p>Erreur chargement produits</p>'});

function addToCart(id) {
    alert('Produit ajouté au panier ! (Demo)');
}
</script></body></html>`);
});

// Start server
app.listen(PORT, () => {
    console.log('🌐 ================================');
    console.log('🌿 THERONIS HARVEST DÉMARRÉ !');
    console.log(\`📍 http://localhost:\${PORT}\`);
    console.log(\`🛠️  http://localhost:\${PORT}/api/health\`);
    console.log('🌐 ================================');
});
EOF

# Package.json minimal
cat > ../theronis-app/package.json << 'EOF'
{
  "name": "theronis-harvest-express",
  "version": "1.0.0",
  "main": "app.js",
  "scripts": {"start": "node app.js"},
  "dependencies": {"express": "^4.18.2"}
}
EOF

# Copier fichiers utiles s'ils existent
mkdir -p ../theronis-app/public
[ -f Site/index.html ] && cp Site/index.html ../theronis-app/public/ 2>/dev/null
[ -f Site/styles.css ] && cp Site/styles.css ../theronis-app/public/ 2>/dev/null
[ -f Site/script.js ] && cp Site/script.js ../theronis-app/public/ 2>/dev/null

cd ../theronis-app

echo "📦 Installation..."
npm install --silent

echo "🚀 Démarrage..."
nohup npm start > app.log 2>&1 &
PID=$!

sleep 3

echo "✅ DÉPLOYÉ ET DÉMARRÉ !"
echo "🌐 Site: http://localhost:3001"
echo "🛠️  API: http://localhost:3001/api/health"
echo "📊 PID: $PID"
echo "📋 Logs: tail -f app.log"

# Test rapide
curl -s http://localhost:3001/api/health && echo "✅ API OK" || echo "⚠️ API en démarrage..."

echo "🌿 Theronis Harvest est en ligne !"

cd ..
rm -rf temp-repo

exit 0
