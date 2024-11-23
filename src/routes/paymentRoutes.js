const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Ruta para crear un nuevo pago
// Ruta para procesar pagos
router.post('/payments/:orderTotal_id/pay', async (req, res) => {
    const { orderTotal_id } = req.params;
    const { user_id, groupMember_ids, amounts, payment_method } = req.body;

    try {
        // Verificar que la orden existe
        const orderQuery = `SELECT * FROM "OrderTotal" WHERE orderTotal_id = $1`;
        const orderResult = await db.query(orderQuery, [orderTotal_id]);

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }

        const order = orderResult.rows[0];
        if (order.status === 'paid') {
            return res.status(400).json({ message: 'El pedido ya está pagado.' });
        }

        let totalPaid = 0;

        // Registrar pagos grupales
        if (groupMember_ids && amounts) {
            for (let i = 0; i < groupMember_ids.length; i++) {
                const memberId = groupMember_ids[i];
                const amount = amounts[i];

                await db.query(`
                    INSERT INTO "Payment"(orderTotal_id, groupMember_id, amount, payment_method, status)
                    VALUES ($1, $2, $3, $4, 'completed')
                `, [orderTotal_id, memberId, amount, payment_method]);

                totalPaid += parseFloat(amount);
            }
        } 
        // Registrar pagos individuales
        else if (user_id) {
            const paymentResult = await db.query(`
                INSERT INTO "Payment"(orderTotal_id, user_id, amount, payment_method, status)
                VALUES ($1, $2, $3, $4, 'completed') RETURNING amount
            `, [orderTotal_id, user_id, parseFloat(order.total), payment_method]);

            totalPaid = paymentResult.rows[0].amount;
        }

        // Actualizar el total confirmado y el estado de la orden
        const newConfirmedTotal = parseFloat(order.confirmed_total) + totalPaid;
        const orderStatus = newConfirmedTotal >= parseFloat(order.total) ? 'paid' : 'partially_paid';

        await db.query(`
            UPDATE "OrderTotal"
            SET confirmed_total = $1, status = $2
            WHERE orderTotal_id = $3
        `, [newConfirmedTotal, orderStatus, orderTotal_id]);

        res.status(200).json({
            message: `Pago registrado exitosamente. Estado del pedido: ${orderStatus}`,
            totalPaid,
            orderStatus
        });
    } catch (error) {
        console.error('Error al procesar el pago:', error);
        res.status(500).json({ error: 'Error al procesar el pago.' });
    }
});



module.exports = router;
