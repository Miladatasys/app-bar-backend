const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Ruta para crear un nuevo pedido
router.post('/orders', async (req, res) => {
    const { products, user_id, table_id, bar_id, special_notes, orderGroup_id } = req.body;

    try {
        // Crear el pedido en OrderTotal
        const queryOrderTotal = `
            INSERT INTO "OrderTotal"(user_id, table_id, bar_id, status, creation_date, special_notes, group_order, orderGroup_id, total)
            VALUES($1, $2, $3, $4, NOW(), $5, $6, $7, $8) RETURNING orderTotal_id
        `;
        const result = await db.query(queryOrderTotal, [
            user_id,
            table_id,
            bar_id,
            'in process',
            special_notes,
            !!orderGroup_id,
            orderGroup_id || null,
            0 // Total inicial en 0
        ]);
        const orderTotal_id = result.rows[0].ordertotal_id;

        console.log('Pedido creado con ID:', orderTotal_id);

        // Insertar productos en OrderDetail y colas correspondientes
        const queryOrderDetail = `
            INSERT INTO "OrderDetail"(order_id, product_id, quantity, status, section)
            VALUES ($1, $2, $3, 'pending', $4) RETURNING orderDetail_id
        `;

        for (const product of products) {
            const detailResult = await db.query(queryOrderDetail, [
                orderTotal_id,
                product.product_id,
                product.quantity,
                    product.category.toLowerCase() === 'drink' ? 'bar' : 'kitchen'
            ]);

            const orderDetail_id = detailResult.rows[0].orderdetail_id;
            console.log(`Producto insertado en OrderDetail con ID: ${orderDetail_id}`);

            if (product.category.toLowerCase() === 'drink') {
                await db.query(
                    `INSERT INTO "BarQueue"(orderDetail_id) VALUES ($1)`,
                    [orderDetail_id]
                );
                console.log(`Producto con ID ${orderDetail_id} insertado en BarQueue`);
            } else if (product.category.toLowerCase() === 'food') {
                await db.query(
                    `INSERT INTO "KitchenQueue"(orderDetail_id) VALUES ($1)`,
                    [orderDetail_id]
                );
                console.log(`Producto con ID ${orderDetail_id} insertado en KitchenQueue`);
            }
        }

        res.status(201).json({ message: 'Pedido creado exitosamente', orderTotal_id });
    } catch (error) {
        console.error('Error al crear el pedido:', error);
        res.status(500).json({ error: 'Error al crear el pedido.' });
    }
});


// Ruta para confirmar un pedido
router.post('/confirm', async (req, res) => {
    const { orderTotal_id } = req.body;

    if (!orderTotal_id) {
        return res.status(400).json({ error: 'El ID del pedido es necesario para confirmarlo.' });
    }

    try {
        // Confirmar el pedido
        const query =
            `UPDATE "OrderTotal" 
            SET status = 'confirmed', update_date = NOW() 
            WHERE orderTotal_id = $1 RETURNING*`;
        console.log(query)
        const result = await db.query(query, [orderTotal_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }

        // Si el pedido pertenece a un grupo, marca el grupo como actualizado
        const order = result.rows[0];
        if (order.group_order) {
            const updateGroupQuery =
                `UPDATE "OrderGroup"
                SET status = 'updated'
                WHERE orderGroup_id = $1`;
            await db.query(updateGroupQuery, [order.ordergroup_id]);
        }

        res.status(200).json({ message: 'Pedido confirmado', order: result.rows[0] });
    } catch (error) {
        console.error('Error al confirmar el pedido:', error);
        res.status(500).json({ error: 'Error al confirmar el pedido.' });
    }
});


// Ruta para obtener una orden por su ID (este es el que utilizamos para BarOrderDetails)
router.get('/orders/:orderTotal_id', async (req, res) => {
    const { orderTotal_id } = req.params;

    try {
        // Obtener información del pedido
        const orderQuery =
            `SELECT 
                ot.*, 
                og.orderGroup_id, 
                og.name AS group_name, 
                og.total_order AS group_total
            FROM "OrderTotal" ot
            LEFT JOIN "OrderGroup" og ON ot.group_order = TRUE AND ot.table_id = og.table_id
            WHERE ot.orderTotal_id = $1;`;

        const orderResult = await db.query(orderQuery, [orderTotal_id]);

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }

        const order = orderResult.rows[0];

        // Obtener los detalles del pedido
        const orderDetailsQuery = `
            SELECT od.*, p.name AS product_name, p.category
            FROM "OrderDetail" od
            JOIN "Product" p ON od.product_id = p.product_id
            WHERE od.order_id = $1
        `;
        const orderDetailsResult = await db.query(orderDetailsQuery, [orderTotal_id]);

        // 3. Obtener miembros del grupo si aplica
        let groupMembers = [];
        if (order.group_order) {
            const groupMembersQuery =
                `SELECT DISTINCT gm.user_id, gm.status, gm.is_payer, gm.amount_to_pay, au.first_name, au.last_name
                FROM "GroupMember" gm
                JOIN "AppUser" au ON gm.user_id = au.user_id
                WHERE gm.orderGroup_id = $1`;
            const groupMembersResult = await db.query(groupMembersQuery, [order.ordergroup_id]);
            groupMembers = groupMembersResult.rows;
        }

        // 4. Obtener pagos asociados al grupo (si aplica)
        let payments = [];
        if (order.group_order) {
            const paymentsQuery =
                `SELECT p.payment_id, p.amount, p.payment_method, p.status, p.transaction_date
            FROM "Payment" p
            WHERE p.orderGroup_id = $1`;

            const paymentsResult = await db.query(paymentsQuery, [order.ordergroup_id]);
            payments = paymentsResult.rows.length > 0 ? paymentsResult.rows : "No se han registrado pagos aún.";
        }

        // Respuesta consolidada
        res.status(200).json({
            message: 'Pedido obtenido con éxito',
            order: {
                ...order,
                products: orderDetailsResult.rows, // Detalles de productos
                groupMembers: groupMembers, // Miembros del grupo
                payments: payments // Pagos asociados
            }
        });
    } catch (error) {
        console.error('Error al obtener el pedido:', error);
        res.status(500).json({ error: 'Error al obtener el pedido.' });
    }
});

module.exports = router;
