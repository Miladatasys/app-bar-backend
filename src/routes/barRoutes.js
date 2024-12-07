const express = require('express');
const db = require('../config/db');
const router = express.Router();


// Ruta para obtener todos los bares
router.get('/bars', async (req, res) => {
  try {
    const result = await db.query('SELECT bar_id AS id, business_name, address FROM "Bar"');
    // console.log("Bares Obtenidos: ", result.rows)
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener los bares:', error); 
    res.status(500).json({ error: 'Error al obtener los bares' });
  }
});

// Ruta para obtener productos de un bar específico
router.get('/bars/:bar_id/products', async (req, res) => {
  const { bar_id } = req.params; // Obtiene el bar_id de los parámetros de la ruta
  console.log('bar_id recibido:', bar_id); // Para verificar el valor de bar_id

  try {
    const result = await db.query('SELECT * FROM "Product" WHERE bar_id = $1', [bar_id]);
    // console.log('Resultados obtenidos:', result.rows); // Muestra los resultados obtenidos
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener productos:', error); // Imprimir el error completo
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});


 module.exports = router;
