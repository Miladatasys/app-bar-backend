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


router.get('/bar/queue', async (req, res) => {
    console.log('Solicitud recibida en /bar/queue');
    try {
        const barQueueQuery = `
            SELECT bq.barQueue_id, od.orderDetail_id, od.product_id, od.quantity, od.unit_price, od.subtotal, od.status, 
                   p.name AS product_name, p.category
            FROM "BarQueue" bq
            JOIN "OrderDetail" od ON bq.orderDetail_id = od.orderDetail_id
            JOIN "Product" p ON od.product_id = p.product_id
            WHERE od.section = 'bar' AND bq.status = 'pending';
        `;
        const result = await db.query(barQueueQuery);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener productos para barra:', error);
        res.status(500).json({ error: 'Error al obtener productos para barra.' });
    }
});

router.get('/kitchen/queue', async (req, res) => {
    console.log('Solicitud recibida en /kitchen/queue');
    try {
        const kitchenQueueQuery = `
           SELECT kq.kitchenQueue_id, od.orderDetail_id, od.product_id, od.quantity, od.unit_price, od.subtotal, od.status, 
                   p.name AS product_name, p.category
            FROM "KitchenQueue" kq
            JOIN "OrderDetail" od ON kq.orderDetail_id = od.orderDetail_id
            JOIN "Product" p ON od.product_id = p.product_id
            WHERE od.section = 'kitchen' AND kq.status = 'pending';
             `;
        const result = await db.query(kitchenQueueQuery);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener productos para cocina:', error);
        res.status(500).json({ error: 'Error al obtener productos para cocina.' });
    }
});


//Para confirmar desde la vista respectiva
router.put('/bar/confirm', async (req, res) => {
    const { barQueue_ids } = req.body;

    try {
        const confirmedQuery = `
            UPDATE "BarQueue"
            SET status = 'confirmed', confirmation_date = NOW()
            WHERE barQueue_id = ANY($1)
            RETURNING orderDetail_id
        `;
        const confirmedResult = await db.query(confirmedQuery, [barQueue_ids]);

        const orderDetailIds = confirmedResult.rows.map(row => row.orderdetail_id);

        for (const orderDetailId of orderDetailIds) {
            const updateDetailQuery = `
                UPDATE "OrderDetail"
                SET status = 'ready', unit_price = (
                    SELECT price FROM "Product" WHERE product_id = (SELECT product_id FROM "OrderDetail" WHERE orderDetail_id = $1)
                ), subtotal = quantity * (
                    SELECT price FROM "Product" WHERE product_id = (SELECT product_id FROM "OrderDetail" WHERE orderDetail_id = $1)
                )
                WHERE orderDetail_id = $1
                RETURNING order_id, subtotal
            `;
            const detailResult = await db.query(updateDetailQuery, [orderDetailId]);
            const { order_id, subtotal } = detailResult.rows[0];

            await db.query(
                `UPDATE "OrderTotal" SET total = COALESCE(total, 0) + $1 WHERE orderTotal_id = $2`,
                [subtotal, order_id]
            );
        }

        res.status(200).json({ message: 'Productos confirmados en barra.' });
    } catch (error) {
        console.error('Error al confirmar productos en barra:', error);
        res.status(500).json({ error: 'Error al confirmar productos en barra.' });
    }
});


router.put('/kitchen/confirm', async (req, res) => {
    const { kitchenQueue_ids } = req.body;

    try {
        const confirmedQuery = `
            UPDATE "KitchenQueue"
            SET status = 'confirmed', confirmation_date = NOW()
            WHERE kitchenQueue_id = ANY($1)
            RETURNING orderDetail_id
        `;
        const confirmedResult = await db.query(confirmedQuery, [kitchenQueue_ids]);

        const orderDetailIds = confirmedResult.rows.map(row => row.orderdetail_id);

        for (const orderDetailId of orderDetailIds) {
            const updateDetailQuery = `
                UPDATE "OrderDetail"
                SET status = 'ready', unit_price = (
                    SELECT price FROM "Product" WHERE product_id = (SELECT product_id FROM "OrderDetail" WHERE orderDetail_id = $1)
                ), subtotal = quantity * (
                    SELECT price FROM "Product" WHERE product_id = (SELECT product_id FROM "OrderDetail" WHERE orderDetail_id = $1)
                )
                WHERE orderDetail_id = $1
                RETURNING order_id, subtotal
            `;
            const detailResult = await db.query(updateDetailQuery, [orderDetailId]);
            const { order_id, subtotal } = detailResult.rows[0];

            await db.query(
                `UPDATE "OrderTotal" SET total = COALESCE(total, 0) + $1 WHERE orderTotal_id = $2`,
                [subtotal, order_id]
            );
        }

        res.status(200).json({ message: 'Productos confirmados en cocina.' });
    } catch (error) {
        console.error('Error al confirmar productos en cocina:', error);
        res.status(500).json({ error: 'Error al confirmar productos en cocina.' });
    }
});


//Para limpiar las colas
router.put('/bar/reject', async (req, res) => {
    const { barQueue_ids } = req.body;

    try {
        const rejectQuery = `
            UPDATE "BarQueue"
            SET status = 'rejected', confirmation_date = NOW()
            WHERE barQueue_id = ANY($1)
        `;
        await db.query(rejectQuery, [barQueue_ids]);

        const deleteQuery = `
            DELETE FROM "OrderDetail"
            WHERE orderDetail_id IN (
                SELECT orderDetail_id FROM "BarQueue" WHERE barQueue_id = ANY($1)
            )
            RETURNING order_id, subtotal
        `;
        const deleteResult = await db.query(deleteQuery, [barQueue_ids]);

        for (const row of deleteResult.rows) {
            await db.query(
                `UPDATE "OrderTotal" SET total = total - $1 WHERE orderTotal_id = $2`,
                [row.subtotal || 0, row.order_id]
            );
        }

        res.status(200).json({ message: 'Productos rechazados y eliminados de la cola.' });
    } catch (error) {
        console.error('Error al rechazar productos en barra:', error);
        res.status(500).json({ error: 'Error al rechazar productos en barra.' });
    }
});


router.put('/kitchen/reject', async (req, res) => {
    const { kitchenQueue_ids } = req.body;

    try {
        const rejectQuery = `
            UPDATE "KitchenQueue"
            SET status = 'rejected', confirmation_date = NOW()
            WHERE kitchenQueue_id = ANY($1)
        `;
        await db.query(rejectQuery, [kitchenQueue_ids]);

        const deleteQuery = `
            DELETE FROM "OrderDetail"
            WHERE orderDetail_id IN (
                SELECT orderDetail_id FROM "KitchenQueue" WHERE kitchenQueue_id = ANY($1)
            )
            RETURNING order_id, subtotal
        `;
        const deleteResult = await db.query(deleteQuery, [kitchenQueue_ids]);

        for (const row of deleteResult.rows) {
            await db.query(
                `UPDATE "OrderTotal" SET total = total - $1 WHERE orderTotal_id = $2`,
                [row.subtotal || 0, row.order_id]
            );
        }

        res.status(200).json({ message: 'Productos rechazados y eliminados de la cola.' });
    } catch (error) {
        console.error('Error al rechazar productos en cocina:', error);
        res.status(500).json({ error: 'Error al rechazar productos en cocina.' });
    }
});


router.put('/clear-active-queues', async (req, res) => {
    try {
        console.log('Iniciando limpieza de colas activas...');

        const rejectBarQueueQuery = `
            UPDATE "BarQueue"
            SET status = 'rejected', confirmation_date = NOW()
            WHERE status IN ('pending', 'active')
            RETURNING orderDetail_id;
        `;
        const rejectKitchenQueueQuery = `
            UPDATE "KitchenQueue"
            SET status = 'rejected', confirmation_date = NOW()
            WHERE status IN ('pending', 'active')
            RETURNING orderDetail_id;
        `;

        const barQueueResult = await db.query(rejectBarQueueQuery);
        const kitchenQueueResult = await db.query(rejectKitchenQueueQuery);

        console.log('Resultados de BarQueue:', barQueueResult.rows);
        console.log('Resultados de KitchenQueue:', kitchenQueueResult.rows);

        const orderDetailIds = [
            ...barQueueResult.rows.map(row => row.orderdetail_id),
            ...kitchenQueueResult.rows.map(row => row.orderdetail_id),
        ];

        if (orderDetailIds.length === 0) {
            console.warn('No hay filas activas para rechazar.');
            return res.status(404).json({ message: 'No hay filas activas para rechazar.' });
        }

        // Eliminar productos rechazados de OrderDetail
        const deleteDetailsQuery = `
            DELETE FROM "OrderDetail"
            WHERE orderDetail_id = ANY($1)
            RETURNING order_id, subtotal;
        `;
        const deleteDetailsResult = await db.query(deleteDetailsQuery, [orderDetailIds]);

        console.log('Detalles eliminados:', deleteDetailsResult.rows);

        // Ajustar el total en OrderTotal
        for (const row of deleteDetailsResult.rows) {
            console.log(`Ajustando total para OrderTotal ${row.order_id}`);
            await db.query(`
                UPDATE "OrderTotal"
                SET total = COALESCE(total, 0) - $1
                WHERE orderTotal_id = $2;
            `, [row.subtotal, row.order_id]);
        }

        res.status(200).json({
            message: 'Todas las filas activas fueron rechazadas y eliminadas.',
            rejectedDetails: deleteDetailsResult.rows,
        });
    } catch (error) {
        console.error('Error al limpiar las filas activas:', error);
        res.status(500).json({ error: 'Error al limpiar las filas activas.' });
    }
});


module.exports = router;
