const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Obtener detalles de una orden específica (OrderDetail + OrderTotal)
router.get('/orderdetail/:orderTotal_id', async (req, res) => {
    const { orderTotal_id } = req.params;

    // Log para verificar el valor recibido
    console.log('Received orderTotal_id:', orderTotal_id);

    // Verificar que orderTotal_id no sea undefined y sea un número
    if (!orderTotal_id || isNaN(orderTotal_id)) {
        console.error('Invalid orderTotal_id:', orderTotal_id);
        return res.status(400).json({ message: 'Invalid orderTotal_id' });
    }

    try {
        // Obtener detalles de los productos (OrderDetail)
        const orderDetailsQuery = `
            SELECT od.orderDetail_id, od.product_id, p.name, p.price, od.quantity, od.status, od.section
            FROM "OrderDetail" od
            JOIN "Product" p ON od.product_id = p.product_id
            WHERE od.order_id = $1;
        `;
        // const orderDetailsResult = await pool.query(orderDetailsQuery, [table_id]);
        const orderDetailsResult = await db.query(orderDetailsQuery, [orderTotal_id]);

        // Obtener el total acumulado (OrderTotal)
        const orderTotalQuery = `
            SELECT ot.total, ot.special_notes
            FROM "OrderTotal" ot
            WHERE ot.table_id = $1 AND ot.status = 'in process';
        `;
        // const orderTotalResult = await db.query(orderTotalQuery, [table_id]);
        const orderTotalResult = await db.query(orderTotalQuery, [orderTotal_id]);

        // Formatear la respuesta
        res.status(200).json({
            products: orderDetailsResult.rows,
            total: orderTotalResult.rows.length ? orderTotalResult.rows[0].total : 0,
            notes: orderTotalResult.rows.length ? orderTotalResult.rows[0].special_notes : null,
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ message: 'Error fetching order details.' });
    }
});

// Confirmar un pedido (actualizar estado en OrderTotal y OrderDetail)
router.post('/orderdetail/confirm', async (req, res) => {
    const { table_id, bar_id, products, total } = req.body;

    try {
        // Actualizar el estado de los productos en OrderDetail
        const updateProductsQuery = `
            UPDATE "OrderDetail"
            SET status = 'confirmed'
            WHERE order_id IN (
                SELECT orderTotal_id FROM "OrderTotal"
                WHERE table_id = $1 AND bar_id = $2 AND status = 'in process'
            )
        `;
        await pool.query(updateProductsQuery, [table_id, bar_id]);

        // Actualizar el estado y total en OrderTotal
        const updateOrderQuery = `
            UPDATE "OrderTotal"
            SET status = 'confirmed', total = $1, update_date = CURRENT_TIMESTAMP
            WHERE table_id = $2 AND bar_id = $3 AND status = 'in process';
        `;
        await pool.query(updateOrderQuery, [total, table_id, bar_id]);

        res.status(200).json({ message: 'Order confirmed successfully.' });
    } catch (error) {
        console.error('Error confirming order:', error);
        res.status(500).json({ message: 'Error confirming order.' });
    }
});

// Cancelar un pedido (eliminar productos en OrderDetail y resetear OrderTotal)
router.delete('/orderdetail/cancel', async (req, res) => {
    const { table_id, bar_id } = req.body;

    try {
        // Eliminar los productos del pedido
        const deleteProductsQuery = `
            DELETE FROM "OrderDetail"
            WHERE order_id IN (
                SELECT orderTotal_id FROM "OrderTotal"
                WHERE table_id = $1 AND bar_id = $2 AND status = 'in process'
            )
        `;
        await pool.query(deleteProductsQuery, [table_id, bar_id]);

        // Resetear el pedido en OrderTotal
        const resetOrderQuery = `
            UPDATE "OrderTotal"
            SET status = 'cancelled', total = 0, update_date = CURRENT_TIMESTAMP
            WHERE table_id = $1 AND bar_id = $2 AND status = 'in process';
        `;
        await pool.query(resetOrderQuery, [table_id, bar_id]);

        res.status(200).json({ message: 'Order cancelled successfully.' });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: 'Error cancelling order.' });
    }
});

module.exports = router;
