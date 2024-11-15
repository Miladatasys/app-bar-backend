const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Ruta para crear un nuevo pago
router.post('/payments', 
// [
//     body('orderTotal_id').notEmpty().withMessage('El ID del pedido es necesario'),
//     body('amount').isDecimal().withMessage('El monto debe ser un número decimal'),
//     body('payment_method').notEmpty().withMessage('El método de pago es obligatorio'),
// ],
 async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { orderTotal_id, user_id, groupMember_id, orderGroup_id, amount, payment_method } = req.body;

    try {
        const query = `
            INSERT INTO "Payment"(orderTotal_id, user_id, groupMember_id, orderGroup_id, amount, payment_method, status)
            VALUES($1, $2, $3, $4, $5, $6, 'pending') RETURNING payment_id
        `;
        const result = await db.query(query, [orderTotal_id, user_id, groupMember_id, orderGroup_id, amount, payment_method]);

        res.status(201).json({ message: 'Pago creado exitosamente', payment_id: result.rows[0].payment_id });
    } catch (error) {
        console.error('Error al crear el pago:', error);
        res.status(500).json({ error: 'Error al crear el pago' });
    }
// });
 });

 router.post('/:group_id/creator-pay', async (req, res) => {
    const { group_id } = req.params;
    const { user_id, payment_method } = req.body;

    try {
        console.log('Solicitud de pago total por el creador:', { group_id, user_id, payment_method });

        // Verificar si el usuario es el creador del grupo y tiene is_payer = true
        const payerCheckQuery = `
            SELECT is_payer FROM "GroupMember"
            WHERE orderGroup_id = $1 AND user_id = $2
        `;
        const payerCheckResult = await db.query(payerCheckQuery, [group_id, user_id]);

        if (payerCheckResult.rows.length === 0 || !payerCheckResult.rows[0].is_payer) {
            return res.status(403).json({ message: 'El usuario no está autorizado para pagar el total del grupo.' });
        }

        // Obtener el total del grupo
        const totalQuery = `
            SELECT total_order FROM "OrderGroup"
            WHERE orderGroup_id = $1
        `;
        const totalResult = await db.query(totalQuery, [group_id]);

        if (totalResult.rows.length === 0 || totalResult.rows[0].total_order <= 0) {
            return res.status(400).json({ message: 'No hay total para pagar en el grupo.' });
        }

        const total_order = totalResult.rows[0].total_order;

        // Registrar el pago en la tabla "Payment"
        const paymentQuery = `
            INSERT INTO "Payment" (orderGroup_id, user_id, amount, payment_method, status)
            VALUES ($1, $2, $3, $4, 'completed') RETURNING payment_id
        `;
        const paymentResult = await db.query(paymentQuery, [group_id, user_id, total_order, payment_method]);

        console.log('Pago total registrado correctamente:', paymentResult.rows[0].payment_id);

        res.status(201).json({ message: 'Pago total realizado exitosamente', payment_id: paymentResult.rows[0].payment_id });
    } catch (error) {
        console.error('Error al realizar el pago total:', error);
        res.status(500).json({ error: 'Error al realizar el pago total del grupo' });
    }
});



module.exports = router;
