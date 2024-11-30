const express = require('express');
const db = require('../config/db');
const router = express.Router();
const Flow = require('flow-pago');

const flow = new Flow({
    apiKey: process.env.FLOW_API_KEY,
    secretKey: process.env.FLOW_SECRET_KEY,
    sandbox: true
});


// Ruta para procesar pagos
router.post('/payments/:orderTotal_id/pay', async (req, res) => {
    const { orderTotal_id } = req.params;
    const { user_id, groupMember_ids, amounts, payment_method } = req.body;

    try {
        console.log(`Iniciando proceso de pago para OrderTotal ID: ${orderTotal_id}`);

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
            console.log('pago individual');

            const paymentResult = await db.query(`
                INSERT INTO "Payment"(orderTotal_id, user_id, amount, payment_method, status)
                VALUES ($1, $2, $3, $4, 'completed') RETURNING amount
            `, [orderTotal_id, user_id, parseFloat(order.total), payment_method]);

            totalPaid = paymentResult.rows[0].amount;
        }

        console.log(`Total pagado: ${totalPaid}`)
        //Utilizamos la api de Flow
        const flowOrder = await flow.createOrder({
            commerceOrder: orderTotal_id.toString(),
            subject: `Pago para la orden ${orderTotal_id}`,
            amount: totalPaid,
            currency: 'CLP',
            paymentMethod: payment_method, // Opcional, puede ser general
            urlConfirmation: `${process.env.BASE_URL}/api/payments/flow-confirmation`,
            urlReturn: `${process.env.BASE_URL}/payment-success`,
        });
        res.status(200).json({
            message: 'Pago iniciado exitosamente.',
            paymentUrl: flowOrder.url, // URL para redirigir al usuario a Flow
        });


        // Código previa integración de API pago
        // const newConfirmedTotal = parseFloat(order.confirmed_total) + totalPaid;
        // const orderStatus = newConfirmedTotal >= parseFloat(order.total) ? 'paid' : 'partially_paid';

        // await db.query(`
        //     UPDATE "OrderTotal"
        //     SET confirmed_total = $1, status = $2
        //     WHERE orderTotal_id = $3
        // `, [newConfirmedTotal, orderStatus, orderTotal_id]);

        // res.status(200).json({
        //     message: `Pago registrado exitosamente. Estado del pedido: ${orderStatus}`,
        //     totalPaid,
        //     orderStatus
        // });
    } catch (error) {
        console.error('Error al procesar el pago:', error);
        res.status(500).json({ error: 'Error al procesar el pago.' });
    }
});

//Confirmación de pago
router.post('/payments/flow-confirmation', async (req, res) => {
    try {
        const { commerceOrder, status } = req.body; // Ajustar según el esquema de notificaciones de Flow

        if (status === 'COMPLETED') {
            // Actualiza los pagos pendientes y el estado de la orden
            await db.query(`
                UPDATE "Payment"
                SET status = 'completed'
                WHERE orderTotal_id = $1 AND status = 'pending'
            `, [commerceOrder]);

            const orderQuery = `
                UPDATE "OrderTotal"
                SET confirmed_total = total, status = 'paid'
                WHERE orderTotal_id = $1
            `;
            await db.query(orderQuery, [commerceOrder]);

            res.status(200).json({ message: 'Pago confirmado y actualizado.' });
        } else {
            res.status(400).json({ message: 'El pago no fue completado.' });
        }
    } catch (error) {
        console.error('Error en la confirmación del pago:', error);
        res.status(500).json({ error: 'Error en la confirmación del pago.' });
    }
});


module.exports = router;
