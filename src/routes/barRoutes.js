const express = require('express');
const router = express.Router();
const db = require('../config/db'); 

// Endpoint para obtener productos de un bar específico
router.get('/:barId/products', async (req, res) => {
  const { barId } = req.params;

  try {
    const query = 'SELECT id, name, price, image_url FROM Product WHERE bar_id = $1';
    const { rows } = await db.query(query, [barId]);

    // Transformamos el formato para el frontend
    const products = rows.map(row => ({
      id: row.id,
      name: row.name,
      price: row.price,
      image: row.image_url || 'https://via.placeholder.com/80' 
    }));

    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos del bar:', error);
    res.status(500).json({ error: 'Error interno del Servidor, intente denuevo' });
  }
});

module.exports = router;
