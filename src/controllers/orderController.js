const db = require('../config/db'); // Conexión a la base de datos
const io = require('socket.io')(require('../server')); // Asegúrate de importar el servidor de Socket.IO

exports.confirmOrder = async (req, res) => {
    const { paymentMethod } = req.body; // Método de pago recibido desde la vista

    try {
        // Insertar el pedido en la base de datos
        const result = await db.query(
            `INSERT INTO Pedido (id_usuario, id_mesa, id_bar, total, estado, metodo_pago)
             VALUES ($1, $2, $3, $4, 'en proceso', $5) RETURNING id`,
            [req.user.id, req.body.id_mesa, req.body.id_bar, req.body.total, paymentMethod]
        );

        const orderId = result.rows[0].id;
        const orderDetails = {
            orderId,
            id_mesa: req.body.id_mesa,
            id_bar: req.body.id_bar,
            total: req.body.total,
            estado: 'en proceso',
            metodo_pago: paymentMethod,
        };

        // Emitir el evento solo a la barra
        io.emit('order_confirmed_bar', { orderId, tableNumber: req.body.id_mesa, status: 'confirmed' });

        res.status(201).json({
            message: 'Pedido confirmado',
            orderId,
        });
    } catch (error) {
        console.error('Error al confirmar el pedido:', error);
        res.status(500).json({ error: 'Error al confirmar el pedido' });
    }
};


exports.createOrder = async (req, res) => {
    const { products, user_id, table_id, bar_id, special_notes, orderGroup_id } = req.body;

    try {
        // Crear el pedido y obtener el orderTotal_id
        let orderTotal_id;

        const result = await db.query(
            `INSERT INTO "OrderTotal"(user_id, table_id, bar_id, status, creation_date, total)
            VALUES($1, $2, $3, 'in process', NOW(), $4) RETURNING orderTotal_id`,
            [user_id, table_id, bar_id, req.body.total]
        );

        orderTotal_id = result.rows[0].ordertotal_id; // Este es el orderTotal_id que necesitamos

        // Separar productos por categoría
        const drinks = products.filter(product => product.category.toLowerCase() === 'drink');
        const foods = products.filter(product => product.category.toLowerCase() === 'food');

        // Insertar los productos de la barra
        for (const product of drinks) {
            const subtotal = product.quantity * product.price;
            await db.query(
                `INSERT INTO "OrderDetail"(order_id, product_id, quantity, unit_price, subtotal, status, section)
                 VALUES ($1, $2, $3, $4, $5, 'pending', 'bar')`, 
                [orderTotal_id, product.product_id, product.quantity, product.price, subtotal]
            );
        }

        // Insertar los productos de la cocina
        for (const product of foods) {
            const subtotal = product.quantity * product.price;
            await db.query(
                `INSERT INTO "OrderDetail"(order_id, product_id, quantity, unit_price, subtotal, status, section)
                 VALUES ($1, $2, $3, $4, $5, 'pending', 'kitchen')`, 
                [orderTotal_id, product.product_id, product.quantity, product.price, subtotal]
            );
        }

        // Emitir notificaciones separadas para cada sección
        io.emit('new_order_bar', { 
            tableNumber: table_id, 
            items: drinks, 
            total: req.body.total,
            orderId: orderTotal_id  // Incluimos el orderId
        });

        io.emit('new_order_kitchen', { 
            tableNumber: table_id, 
            items: foods, 
            total: req.body.total,
            orderId: orderTotal_id  // Incluimos el orderId
        });

        res.status(201).json({ message: 'Pedido creado exitosamente', orderTotal_id });

    } catch (error) {
        console.error('Error al crear el pedido:', error);
        res.status(500).json({ error: 'Error al crear el pedido' });
    }
};


exports.confirmKitchenOrder = async (req, res) => {
    const { orderId, tableNumber } = req.body;

    try {
        // Actualizar el estado del pedido en la base de datos
        const result = await db.query(
            `UPDATE Pedido SET estado = 'Listo' WHERE id = $1 RETURNING id`,
            [orderId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }

        // Emitir el evento solo a la cocina
        io.emit('order_confirmed_kitchen', { orderId, tableNumber, status: 'ready' });

        res.status(200).json({ message: 'Pedido confirmado como listo', orderId });
    } catch (error) {
        console.error('Error al confirmar el pedido en cocina:', error);
        res.status(500).json({ error: 'Error al confirmar el pedido en cocina' });
    }
};

exports.rejectKitchenOrder = async (req, res) => {
    const { orderId, tableNumber } = req.body;

    try {
        // Actualizar el estado del pedido en la base de datos
        const result = await db.query(
            `UPDATE Pedido SET estado = 'Rechazado' WHERE id = $1 RETURNING id`,
            [orderId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }

        // Emitir el evento solo a la cocina
        io.emit('order_rejected_kitchen', { orderId, tableNumber, status: 'rejected' });

        res.status(200).json({ message: 'Pedido rechazado en cocina', orderId });
    } catch (error) {
        console.error('Error al rechazar el pedido en cocina:', error);
        res.status(500).json({ error: 'Error al rechazar el pedido en cocina' });
    }
};
