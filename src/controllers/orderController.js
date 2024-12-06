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

        // Obtener los detalles del pedido confirmado
        const orderId = result.rows[0].id;
        const orderDetails = {
            orderId,
            id_mesa: req.body.id_mesa,
            id_bar: req.body.id_bar,
            total: req.body.total,
            estado: 'en proceso',
            metodo_pago: paymentMethod,
        };

        // Emitir la notificación a la barra y cocina
        io.emit('new_order_bar', { tableNumber: req.body.id_mesa, items: req.body.products.filter(product => product.category.toLowerCase() === 'drink'), total: req.body.total });
        io.emit('new_order_kitchen', { tableNumber: req.body.id_mesa, items: req.body.products.filter(product => product.category.toLowerCase() === 'food'), total: req.body.total });

        // Responder con el ID del pedido confirmado
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

        // Lógica para obtener o crear un OrderTotal
        // (esto ya está en tu código)

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
        io.emit('new_order_bar', { tableNumber: table_id, items: drinks, total: req.body.total });
        io.emit('new_order_kitchen', { tableNumber: table_id, items: foods, total: req.body.total });

        res.status(201).json({ message: 'Pedido creado exitosamente', orderTotal_id });

    } catch (error) {
        console.error('Error al crear el pedido:', error);
        res.status(500).json({ error: 'Error al crear el pedido' });
    }
};
