const express = require('express');
const db = require('../config/db');
const router = express.Router();

// // Ruta para obtener productos de un bar específico
// router.get('/:bar_id/products', async (req, res) => {
//   const { bar_id } = req.params;

//   try {
//     const query = 'SELECT id, name, price, image_url FROM Product WHERE bar_id = $1';
//     const { rows } = await db.query(query, [bar_id]);

//     if (rows.length === 0) {
//       return res.status(404).json({ message: 'No se encontraron productos para este bar' });
//     }

//     res.status(200).json(rows);
//   } catch (error) {
//     console.error('Error al obtener los productos:', error);
//     res.status(500).json({ error: 'Error al obtener los productos del bar' });
//   }
// });



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

// Ruta para obtener productos de un bar específico
router.get('/bars/:bar_id/products', async (req, res) => {
  const { bar_id } = req.params; // Obtiene el bar_id de los parámetros de la ruta
  console.log('bar_id recibido:', bar_id); // Para verificar el valor de bar_id
  try {
    const result = await db.query('SELECT * FROM "Product" WHERE bar_id = $1', [bar_id]);
    console.log('Resultados obtenidos:', result.rows); // Muestra los resultados obtenidos
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener productos:', error); // Imprimir el error completo
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});



 module.exports = router;
