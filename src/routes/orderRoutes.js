const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Ruta para confirmar un pedido
router.post('/confirm', orderController.confirmOrder);

// Ruta para crear un nuevo pedido
router.post('/orders', async (req, res) => {
    const { products, table_id } = req.body;
    try {
        // Crear un nuevo pedido en la tabla "Orders" con el id de mesa (table_id) y otros detalles
        const query = 'INSERT INTO Orders(table_id, status, created_at) VALUES($1, $2, NOW()) RETURNING id';
        const result = await db.query(query, [table_id, 'pending']);

        const orderId = result.rows[0].id;

        // Insertar los productos pedidos en la tabla "OrderDetails"
        const orderDetailsQuery = 'INSERT INTO OrderDetails(order_id, product_id, quantity) VALUES ($1, $2, $3)';
        for (const product of products) {
            await db.query(orderDetailsQuery, [orderId, product.id, product.quantity]);
        }

        res.status(201).json({ message: 'Pedido creado exitosamente', order_id: orderId });
    } catch (error) {
        console.error('Error al crear el pedido:', error);
        res.status(500).json({ error: 'Error al crear el pedido' });
    }
});

// Ruta para obtener el estado de un pedido
router.get('/orders/:order_id/status', async (req, res) => {
    const { order_id } = req.params;

    try {
        const query = 'SELECT status FROM Orders WHERE id = $1';
        const result = await db.query(query, [order_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener el estado del pedido:', error);
        res.status(500).json({ error: 'Error al obtener el estado del pedido' });
    }
});

// Ruta para actualizar el estado de un pedido
router.put('/orders/:order_id/status', async (req, res) => {
    const { order_id } = req.params;
    const { status } = req.body;

    try {
        const query = 'UPDATE Orders SET status = $1 WHERE id = $2 RETURNING *';
        const result = await db.query(query, [status, order_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        res.status(200).json({ message: 'Estado del pedido actualizado', order: result.rows[0] });
    } catch (error) {
        console.error('Error al actualizar el estado del pedido:', error);
        res.status(500).json({ error: 'Error al actualizar el estado del pedido' });
    }
});



//Posible función futura
//router.get('all', orderController.getAllOrders)



module.exports = router;