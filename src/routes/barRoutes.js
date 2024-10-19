const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Ruta para obtener todos los bares
router.get('/bars', async (req, res) => {
  try {
    // Cambié 'id' a 'bar_id' para reflejar la estructura correcta de tu base de datos
    const result = await db.query('SELECT bar_id AS id, business_name, address FROM "Bar"');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener los bares:', error);  // Añadir para mayor visibilidad en los errores
    res.status(500).json({ error: 'Error al obtener los bares' });
  }
});

module.exports = router;

