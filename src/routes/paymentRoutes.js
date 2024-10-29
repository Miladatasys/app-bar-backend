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

//Otras rutas relacionadas con el pago pueden ser añadidas aquí

module.exports = router;
