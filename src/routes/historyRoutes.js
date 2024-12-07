const express = require('express');
const db = require('../config/db'); // Asegúrate de tener tu configuración de base de datos
const router = express.Router();

// Ruta para obtener el historial de pedidos de un cliente
router.get('/history/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        // Consulta para obtener los pedidos del cliente
        const query = `
            SELECT 
                p.payment_id,
                p.transaction_date,
                p.amount,
                p.status,
                ot.ordertotal_id,
                ot.creation_date,
                ot.total,
                ot.status AS order_status,
                json_agg(
                    json_build_object(
                        'orderDetail_id', od.orderDetail_id,
                        'product_name', pr.name,
                        'quantity', od.quantity,
                        'unit_price', od.unit_price,
                        'subtotal', od.subtotal
                    )
                ) AS products
            FROM "Payment" p
            JOIN "OrderTotal" ot ON p.orderTotal_id = ot.ordertotal_id
            JOIN "OrderDetail" od ON ot.ordertotal_id = od.order_id
            JOIN "Product" pr ON od.product_id = pr.product_id
            WHERE p.user_id = $1
            GROUP BY p.payment_id, ot.ordertotal_id
            ORDER BY p.transaction_date DESC
            LIMIT 5;
        `;

        const result = await db.query(query, [user_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron pagos para este cliente.' });
        }

        res.status(200).json({ message: 'Historial de pagos obtenido con éxito.', payments: result.rows });
    } catch (error) {
        console.error('Error al obtener el historial de pagos:', error);
        res.status(500).json({ error: 'Error al obtener el historial de pagos.' });
    }
});

module.exports = router;
