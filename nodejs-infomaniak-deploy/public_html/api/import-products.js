const fs = require('fs');
const path = require('path');
const { executeQuery, testConnection } = require('./database');

async function importProducts() {
  try {
    console.log('🔄 Importation des produits dans la base de données...');
    
    // Test de la connexion
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Impossible de se connecter à la base de données');
      return;
    }

    // Lire le fichier products.json
    const productsPath = path.join(__dirname, '../Site/products.json');
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

    // Combiner tous les produits
    const allProducts = [
      ...productsData.fruits,
      ...productsData.legumes,
      ...productsData.herbes
    ];

    console.log(`📦 ${allProducts.length} produits trouvés à importer`);

    // Vider la table des produits existants (optionnel)
    await executeQuery('DELETE FROM products');
    console.log('🗑️ Table des produits vidée');

    // Importer chaque produit
    let importedCount = 0;
    for (const product of allProducts) {
      try {
        // Calculer la disponibilité basée sur le stock
        let availability = 'available';
        if (product.stock === 0) availability = 'out-of-stock';
        else if (product.stock < 500) availability = 'limited';

        await executeQuery(
          'INSERT INTO products (id, name, category, price, description, icon, stock, availability) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [
            product.id,
            product.name,
            product.category,
            product.price,
            product.description,
            product.icon,
            product.stock,
            availability
          ]
        );
        
        importedCount++;
        console.log(`✅ Produit importé: ${product.name} (${product.category})`);
      } catch (error) {
        console.error(`❌ Erreur lors de l'importation de ${product.name}:`, error.message);
      }
    }

    console.log(`\n🎉 Importation terminée! ${importedCount}/${allProducts.length} produits importés avec succès`);
    
    // Afficher un résumé
    const summary = await executeQuery(`
      SELECT 
        category, 
        COUNT(*) as count,
        AVG(price) as avg_price,
        SUM(stock) as total_stock
      FROM products 
      GROUP BY category
    `);
    
    console.log('\n📊 Résumé par catégorie:');
    summary.forEach(cat => {
      console.log(`   ${cat.category}: ${cat.count} produits, prix moyen: ${cat.avg_price.toFixed(2)}€, stock total: ${cat.total_stock}`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'importation:', error);
  }
}

// Exécuter l'importation si le script est appelé directement
if (require.main === module) {
  importProducts().then(() => {
    console.log('Script d\'importation terminé');
    process.exit(0);
  }).catch(error => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = { importProducts };
