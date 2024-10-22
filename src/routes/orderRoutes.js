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
  // Lógica para confirmar el pedido
});

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const db = require('../config/db');  // Asegúrate de que la conexión a la base de datos está configurada correctamente


// // Ruta para crear un nuevo pedido
// router.post('/orders', async (req, res) => {
//   const { products, table_id } = req.body;
//   try {
//     const query = 'INSERT INTO Orders(table_id, status, created_at) VALUES($1, $2, NOW()) RETURNING id';
//     const result = await db.query(query, [table_id, 'pending']);
//     const orderId = result.rows[0].id;

//     // Insertar los productos en OrderDetails
//     const orderDetailsQuery = 'INSERT INTO OrderDetails(order_id, product_id, quantity) VALUES ($1, $2, $3)';
//     for (const product of products) {
//       await db.query(orderDetailsQuery, [orderId, product.id, product.quantity]);
//     }

//     res.status(201).json({ message: 'Pedido creado exitosamente', order_id: orderId });
//   } catch (error) {
//     console.error('Error al crear el pedido:', error);
//     res.status(500).json({ error: 'Error al crear el pedido' });
//   }
// });

// // Ruta para obtener el estado de un pedido
// router.get('/orders/:order_id/status', async (req, res) => {
//   const { order_id } = req.params;

//   try {
//     const query = 'SELECT status FROM Orders WHERE id = $1';
//     const result = await db.query(query, [order_id]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: 'Pedido no encontrado' });
//     }

//     res.status(200).json(result.rows[0]);
//   } catch (error) {
//     console.error('Error al obtener el estado del pedido:', error);
//     res.status(500).json({ error: 'Error al obtener el estado del pedido' });
//   }
// });

// // Ruta para actualizar el estado de un pedido
// router.put('/orders/:order_id/status', async (req, res) => {
//   const { order_id } = req.params;
//   const { status } = req.body;

//   try {
//     const query = 'UPDATE Orders SET status = $1 WHERE id = $2 RETURNING *';
//     const result = await db.query(query, [status, order_id]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: 'Pedido no encontrado' });
//     }

//     res.status(200).json({ message: 'Estado del pedido actualizado', order: result.rows[0] });
//   } catch (error) {
//     console.error('Error al actualizar el estado del pedido:', error);
//     res.status(500).json({ error: 'Error al actualizar el estado del pedido' });
//   }
// });

// module.exports = router;