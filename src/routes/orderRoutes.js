const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Ruta para crear un nuevo pedido
router.post('/orders', async (req, res) => {
    const { products, user_id, table_id, bar_id, special_notes } = req.body;
    try {

        // 1. Crear el pedido en "OrderTotal"
        const queryOrderTotal = `
            INSERT INTO "OrderTotal"(user_id, table_id, bar_id, status, creation_date, special_notes)
            VALUES($1, $2, $3, $4, NOW(), $5) RETURNING orderTotal_id
        `;
        const result = await db.query(queryOrderTotal, [user_id, table_id, bar_id, 'in process', special_notes]);
        const orderTotal_id = result.rows[0].ordertotal_id;

        // 2. Insertar cada producto en "OrderDetail"
        const queryOrderDetail = `
            INSERT INTO "OrderDetail"(order_id, product_id, quantity, unit_price, subtotal)
            VALUES ($1, $2, $3, $4, $5)
        `;
        for (const product of products) {
            const subtotal = product.quantity * product.unit_price;
            await db.query(queryOrderDetail, [orderTotal_id, product.product_id, product.quantity, product.unit_price, subtotal]);
        }

        res.status(201).json({ message: 'Pedido creado exitosamente', orderTotal_id });
    } catch (error) {
        console.error('Error al crear el pedido:', error);
        res.status(500).json({ error: 'Error al crear el pedido' });
    }
});

// Ruta para confirmar un pedido
router.post('/confirm', async (req, res) => {
  const { orderTotal_id } = req.body;

  if (!orderTotal_id) {
      return res.status(400).json({ error: 'El ID del pedido es necesario para confirmarlo' });
  }

  try {
      const query = 'UPDATE "OrderTotal" SET status = $1, update_date = NOW() WHERE orderTotal_id = $2 RETURNING *';
      const result = await db.query(query, ['confirmed', orderTotal_id]);

      if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Pedido no encontrado' });
      }

      res.status(200).json({ message: 'Pedido confirmado', order: result.rows[0] });
  } catch (error) {
      console.error('Error al confirmar el pedido:', error);
      res.status(500).json({ error: 'Error al confirmar el pedido' });
  }
});
module.exports = router;
