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
                ot.ordertotal_id,
                ot.creation_date,
                ot.total,
                ot.confirmed_total,
                ot.status,
                json_agg(
                    json_build_object(
                        'orderDetail_id', od.orderDetail_id,
                        'product_name', p.name,
                        'quantity', od.quantity,
                        'unit_price', od.unit_price,
                        'subtotal', od.subtotal
                    )
                ) AS products
            FROM "OrderTotal" ot
            JOIN "OrderDetail" od ON ot.ordertotal_id = od.order_id
            JOIN "Product" p ON od.product_id = p.product_id
            WHERE ot.user_id = $1
            GROUP BY ot.ordertotal_id
            ORDER BY ot.creation_date DESC;
        `;

        const result = await db.query(query, [user_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron pedidos para este cliente.' });
        }

        res.status(200).json({ message: 'Historial de pedidos obtenido con éxito.', orders: result.rows });
    } catch (error) {
        console.error('Error al obtener el historial de pedidos:', error);
        res.status(500).json({ error: 'Error al obtener el historial de pedidos.' });
    }
});

module.exports = router;
