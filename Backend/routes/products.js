const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../database');

const router = express.Router();

// Validation middleware
const validateProduct = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('category').isIn(['fruits', 'legumes', 'herbes']).withMessage('Catégorie invalide'),
  body('price').isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('La description ne peut pas dépasser 500 caractères'),
  body('stock').isInt({ min: 0 }).withMessage('Le stock doit être un nombre entier positif'),
];

// GET /api/products - Récupérer tous les produits
router.get('/', async (req, res) => {
  try {
    const { category, availability } = req.query;
    
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    
    if (category && category !== 'tous') {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (availability) {
      query += ' AND availability = ?';
      params.push(availability);
    }
    
    query += ' ORDER BY category, name';
    
    const products = await executeQuery(query, params);
    res.json(products);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
  }
});

// GET /api/products/:id - Récupérer un produit par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const products = await executeQuery('SELECT * FROM products WHERE id = ?', [id]);
    
    if (products.length === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    res.json(products[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du produit' });
  }
});

// POST /api/products - Créer un nouveau produit
router.post('/', validateProduct, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, category, price, description, icon, stock } = req.body;
    
    // Calculer la disponibilité basée sur le stock
    let availability = 'available';
    if (stock === 0) availability = 'out-of-stock';
    else if (stock < 500) availability = 'limited';
    
    const result = await executeQuery(
      'INSERT INTO products (name, category, price, description, icon, stock, availability) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, category, price, description, icon, stock, availability]
    );
    
    const newProduct = await executeQuery('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json(newProduct[0]);
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    res.status(500).json({ error: 'Erreur lors de la création du produit' });
  }
});

// PUT /api/products/:id - Mettre à jour un produit
router.put('/:id', validateProduct, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, category, price, description, icon, stock } = req.body;
    
    // Calculer la disponibilité basée sur le stock
    let availability = 'available';
    if (stock === 0) availability = 'out-of-stock';
    else if (stock < 500) availability = 'limited';
    
    const result = await executeQuery(
      'UPDATE products SET name = ?, category = ?, price = ?, description = ?, icon = ?, stock = ?, availability = ? WHERE id = ?',
      [name, category, price, description, icon, stock, availability, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    const updatedProduct = await executeQuery('SELECT * FROM products WHERE id = ?', [id]);
    res.json(updatedProduct[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du produit' });
  }
});

// PATCH /api/products/:id/stock - Mettre à jour uniquement le stock
router.patch('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    
    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ error: 'Le stock doit être un nombre positif' });
    }
    
    // Calculer la disponibilité basée sur le stock
    let availability = 'available';
    if (stock === 0) availability = 'out-of-stock';
    else if (stock < 500) availability = 'limited';
    
    const result = await executeQuery(
      'UPDATE products SET stock = ?, availability = ? WHERE id = ?',
      [stock, availability, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    const updatedProduct = await executeQuery('SELECT * FROM products WHERE id = ?', [id]);
    res.json(updatedProduct[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du stock:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du stock' });
  }
});

// DELETE /api/products/:id - Supprimer un produit
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await executeQuery('DELETE FROM products WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    res.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du produit' });
  }
});

// GET /api/products/category/:category - Récupérer les produits par catégorie
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    if (!['fruits', 'legumes', 'herbes'].includes(category)) {
      return res.status(400).json({ error: 'Catégorie invalide' });
    }
    
    const products = await executeQuery('SELECT * FROM products WHERE category = ? ORDER BY name', [category]);
    res.json(products);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits par catégorie:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des produits par catégorie' });
  }
});

module.exports = router;
