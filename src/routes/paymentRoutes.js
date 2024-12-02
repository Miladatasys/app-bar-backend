const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Ruta para procesar pagos
router.post('/payments/:orderTotal_id/pay', async (req, res) => {
    console.log('body: ', req.body)
    const { orderTotal_id } = req.params;
    const { user_id, groupMember_ids = [], amounts = [], payment_method } = req.body;
    //const { user_id, groupMember_ids, amounts, payment_method } = req.body;

    try {
        console.log(`Iniciando pago para la orden ${orderTotal_id}`);
        const orderQuery = `SELECT * FROM "OrderTotal" WHERE orderTotal_id = $1`;
        const orderResult = await db.query(orderQuery, [orderTotal_id]);

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }

        const order = orderResult.rows[0];
        if (order.status === 'paid') {
            return res.status(400).json({ message: 'El pedido ya está pagado.' });
        }

        console.log(`Estado actual de la orden: ${order.status}`);
        console.log(`Total confirmado actual: ${order.confirmed_total}`);
        console.log(`Total de la orden: ${order.total}`);

        let totalPaid = 0;

        // Registrar pagos grupales
        if (groupMember_ids.length > 0 && amounts.length) {
            // if (groupMember_ids && amounts) {
            console.log("Procesando pagos grupales...");

            for (let i = 0; i < groupMember_ids.length; i++) {
                const memberId = groupMember_ids[i];
                const amount = amounts[i];

                console.log(`Registrando pago del miembro ${memberId} por ${amount}`);
                await db.query(`
                    INSERT INTO "Payment"(orderTotal_id, groupMember_id, amount, payment_method, status)
                    VALUES ($1, $2, $3, $4, 'completed')
                `, [orderTotal_id, memberId, amount, payment_method]);

                totalPaid += parseFloat(amount);
            }
        }
        // Registrar pagos individuales
        else if (user_id) {
            console.log(`Procesando pago individual del usuario ${user_id}`);
            const paymentAmount = parseFloat(amounts[0] || order.total);

            const paymentResult = await db.query(`
                INSERT INTO "Payment"(orderTotal_id, user_id, amount, payment_method, status)
                VALUES ($1, $2, $3, $4, 'completed') RETURNING amount
            `, [orderTotal_id, user_id, paymentAmount, payment_method]);

            totalPaid = paymentResult.rows[0].amount;
        } else {
            return res.status(400).json({ message: 'Datos de pago no válidos.' });
        }

        console.log(`Total pagado: ${totalPaid}`);

        // Actualizar el total confirmado y el estado de la orden
        const newConfirmedTotal = parseFloat(order.confirmed_total ||0) + totalPaid;
        const orderStatus = newConfirmedTotal >= parseFloat(order.total) ? 'paid' : 'partially_paid';

        console.log(`Actualizando orden con total confirmado: ${newConfirmedTotal}, estado: ${orderStatus}`);

        await db.query(`
            UPDATE "OrderTotal"
            SET confirmed_total = $1, status = $2
            WHERE orderTotal_id = $3
        `, [newConfirmedTotal, orderStatus, orderTotal_id]);

        res.status(200).json({
            message: `Pago registrado exitosamente. Estado del pedido: ${orderStatus}`,
            totalPaid,
            orderStatus,
            newConfirmedTotal
        });
    } catch (error) {
        console.error('Error al procesar el pago:', error);
        res.status(500).json({ error: 'Error al procesar el pago.' });
    }
});



module.exports = router;
