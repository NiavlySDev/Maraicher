const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../database');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

// Validation middleware
const validateOrder = [
  body('items').isArray({ min: 1 }).withMessage('Au moins un article est requis'),
  body('items.*.product_id').isInt({ min: 1 }).withMessage('ID produit invalide'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantité invalide'),
  body('delivery_address').trim().isLength({ min: 10, max: 500 }).withMessage('Adresse de livraison requise (10-500 caractères)'),
  body('delivery_date').isISO8601().withMessage('Date de livraison invalide'),
];

// POST /api/orders - Créer une nouvelle commande
router.post('/', authenticateToken, validateOrder, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, delivery_address, delivery_date, notes } = req.body;

    // Vérifier la disponibilité et calculer le total
    let total_amount = 0;
    const orderItems = [];

    for (const item of items) {
      const products = await executeQuery('SELECT * FROM products WHERE id = ?', [item.product_id]);
      
      if (products.length === 0) {
        return res.status(400).json({ error: `Produit avec ID ${item.product_id} non trouvé` });
      }

      const product = products[0];
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Stock insuffisant pour ${product.name}. Stock disponible: ${product.stock}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      total_amount += itemTotal;

      orderItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price: product.price,
        name: product.name
      });
    }

    // Créer la commande
    const orderResult = await executeQuery(
      'INSERT INTO orders (user_id, total_amount, delivery_address, delivery_date, notes) VALUES (?, ?, ?, ?, ?)',
      [req.user.userId, total_amount, delivery_address, delivery_date, notes]
    );

    const orderId = orderResult.insertId;

    // Ajouter les articles de la commande et mettre à jour les stocks
    for (const item of orderItems) {
      await executeQuery(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );

      // Mettre à jour le stock
      const newStock = await executeQuery(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );

      // Mettre à jour la disponibilité basée sur le nouveau stock
      const updatedProduct = await executeQuery('SELECT stock FROM products WHERE id = ?', [item.product_id]);
      const stock = updatedProduct[0].stock;
      
      let availability = 'available';
      if (stock === 0) availability = 'out-of-stock';
      else if (stock < 500) availability = 'limited';
      
      await executeQuery('UPDATE products SET availability = ? WHERE id = ?', [availability, item.product_id]);
    }

    // Récupérer la commande complète
    const order = await executeQuery(`
      SELECT o.*, u.first_name, u.last_name, u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [orderId]);

    const orderItemsDetails = await executeQuery(`
      SELECT oi.*, p.name, p.icon
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [orderId]);

    res.status(201).json({
      ...order[0],
      items: orderItemsDetails
    });
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la commande' });
  }
});

// GET /api/orders - Récupérer les commandes de l'utilisateur
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT o.*, u.first_name, u.last_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.user_id = ?
    `;
    const params = [req.user.userId];
    
    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const orders = await executeQuery(query, params);
    
    // Récupérer les articles pour chaque commande
    for (let order of orders) {
      const items = await executeQuery(`
        SELECT oi.*, p.name, p.icon
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);
      order.items = items;
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des commandes' });
  }
});

// GET /api/orders/:id - Récupérer une commande spécifique
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const orders = await executeQuery(`
      SELECT o.*, u.first_name, u.last_name, u.email, u.phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ? AND o.user_id = ?
    `, [id, req.user.userId]);
    
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }
    
    const order = orders[0];
    
    // Récupérer les articles de la commande
    const items = await executeQuery(`
      SELECT oi.*, p.name, p.icon, p.description
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [id]);
    
    order.items = items;
    
    res.json(order);
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la commande' });
  }
});

// PATCH /api/orders/:id/cancel - Annuler une commande
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier que la commande existe et appartient à l'utilisateur
    const orders = await executeQuery(
      'SELECT * FROM orders WHERE id = ? AND user_id = ? AND status IN (?, ?)',
      [id, req.user.userId, 'pending', 'confirmed']
    );
    
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Commande non trouvée ou impossible à annuler' });
    }
    
    // Récupérer les articles pour remettre en stock
    const items = await executeQuery('SELECT * FROM order_items WHERE order_id = ?', [id]);
    
    // Remettre les articles en stock
    for (const item of items) {
      await executeQuery(
        'UPDATE products SET stock = stock + ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
      
      // Mettre à jour la disponibilité
      const updatedProduct = await executeQuery('SELECT stock FROM products WHERE id = ?', [item.product_id]);
      const stock = updatedProduct[0].stock;
      
      let availability = 'available';
      if (stock === 0) availability = 'out-of-stock';
      else if (stock < 500) availability = 'limited';
      
      await executeQuery('UPDATE products SET availability = ? WHERE id = ?', [availability, item.product_id]);
    }
    
    // Marquer la commande comme annulée
    await executeQuery('UPDATE orders SET status = ? WHERE id = ?', ['cancelled', id]);
    
    res.json({ message: 'Commande annulée avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la commande:', error);
    res.status(500).json({ error: 'Erreur lors de l\'annulation de la commande' });
  }
});

// GET /api/orders/admin/all - Récupérer toutes les commandes (admin seulement)
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    const { status, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT o.*, u.first_name, u.last_name, u.email, u.phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const orders = await executeQuery(query, params);
    
    // Récupérer les articles pour chaque commande
    for (let order of orders) {
      const items = await executeQuery(`
        SELECT oi.*, p.name, p.icon
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);
      order.items = items;
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes admin:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des commandes' });
  }
});

// PATCH /api/orders/:id/status - Mettre à jour le statut d'une commande (admin seulement)
router.patch('/:id/status', authenticateToken, [
  body('status').isIn(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']).withMessage('Statut invalide'),
], async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await executeQuery('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }
    
    res.json({ message: 'Statut de la commande mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
});

module.exports = router;
