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
        // for (const product of products) {
        //     const subtotal = product.quantity * product.unit_price;
        //     await db.query(queryOrderDetail, [orderTotal_id, product.product_id, product.quantity, product.unit_price, subtotal]);
        // }

        for (const product of products) {
            //Revisamos que estén los datos necesarios
            if (!product.product_id || !product.quantity || !product.unit_price) {
                console.error('Error: Falta información en el producto:', product);
                return res.status(400).json({ error: 'Falta información en uno o más productos.' });
            }

            const subtotal = product.quantity * product.unit_price;

            // Agregar logs para verificar valores
            console.log('Insertando detalle del pedido:', {
                order_id: orderTotal_id,
                product_id: product.product_id,
                quantity: product.quantity,
                unit_price: product.unit_price,
                subtotal: subtotal
            });

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
    const { orderTotal_id } = req.body;

    if (!orderTotal_id) {
        return res.status(400).json({ error: 'El ID del pedido es necesario para confirmarlo' });
    }

    try {
        const query = 'UPDATE "OrderTotal" SET status = $1, update_date = NOW() WHERE orderTotal_id = $2 RETURNING *';
        const result = await db.query(query, ['confirmed', orderTotal_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        res.status(200).json({ message: 'Pedido confirmado', order: result.rows[0] });
    } catch (error) {
        console.error('Error al confirmar el pedido:', error);
        res.status(500).json({ error: 'Error al confirmar el pedido' });
    }
});

// Ruta para obtener una orden por su ID
router.get('/orders/:orderTotal_id', async (req, res) => {
    const { orderTotal_id } = req.params;

    if (!orderTotal_id) {
        return res.status(400).json({ error: 'El ID del pedido es necesario para obtenerlo' });
    }

    try {
        //Consulta para obtener la orden
        console.log('Obteniendo pedido con ID:', orderTotal_id);
        const queryOrderTotal = `
            SELECT orderTotal_id, user_id, table_id, bar_id, status, creation_date, special_notes
            FROM "OrderTotal"
            WHERE orderTotal_id = $1
        `;
        const result = await db.query(queryOrderTotal, [orderTotal_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        //Obtener los detalles del pedido
        const queryOrderDetails = `
            SELECT od.product_id, od.quantity, od.unit_price, od.subtotal, p.name
            FROM "OrderDetail" od
            JOIN "Product" p ON od.product_id = p.product_id
            WHERE od.order_id = $1
        `;
        const orderDetailsResult = await db.query(queryOrderDetails, [orderTotal_id]);
        console.log('Detalles del pedido:', orderDetailsResult.rows);

        //Obtener los miembros del grupo si aplica
        const queryGroupMembers = `
            SELECT gm.groupMember_id, gm.user_id, gm.status
            FROM "GroupMember" gm
            JOIN "OrderGroup" og ON gm.orderGroup_id = og.orderGroup_id
            WHERE og.table_id = $1
        `;
        const groupMembersResult = await db.query(queryGroupMembers, [result.rows[0].table_id]);
        console.log('Miembros del grupo:', groupMembersResult.rows);

        //Obtener los pagos realizados para el pedido
        const queryPayments = `
            SELECT p.payment_id, p.amount, p.payment_method, p.status, p.transaction_date
            FROM "Payment" p
            WHERE p.orderTotal_id = $1
        `;
        const paymentsResult = await db.query(queryPayments, [orderTotal_id]);
        console.log('Pagos obtenidos:', paymentsResult.rows);

        res.status(200).json({
            message: 'Pedido obtenido con éxito',
            order: {
                ...result.rows[0], // Datos del pedido
                products: orderDetailsResult.rows,
                groupMembers: groupMembersResult.rows,
                payments: paymentsResult.rows
            }
        });
    } catch (error) {
        console.error('Error al obtener el pedido:', error);
        res.status(500).json({ error: 'Error al obtener el pedido' });
    }
});


module.exports = router;
