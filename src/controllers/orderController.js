const db = require('../config/db'); // Conexión a la base de datos
const io = require('socket.io')(require('../server')); // Asegúrate de importar el servidor de Socket.IO

// Confirmar el pedido (al realizar el pago)
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

<<<<<<< HEAD
        // Emitir la notificación a la barra y cocina
        io.emit('new_order_bar', { tableNumber: req.body.id_mesa, items: req.body.products.filter(product => product.category.toLowerCase() === 'drink'), total: req.body.total });
        io.emit('new_order_kitchen', { tableNumber: req.body.id_mesa, items: req.body.products.filter(product => product.category.toLowerCase() === 'food'), total: req.body.total });
=======
        // Separar los productos en 'drink' y 'food'
        const drinks = req.body.products.filter(product => product.category.toLowerCase() === 'drink');
        const foods = req.body.products.filter(product => product.category.toLowerCase() === 'food');

        // Calcular el total para cada categoría
        const totalDrinks = drinks.reduce((acc, product) => acc + (product.price * product.quantity), 0);
        const totalFoods = foods.reduce((acc, product) => acc + (product.price * product.quantity), 0);

        // Emitir las notificaciones con el total calculado para cada categoría
        io.emit('new_order_bar', { 
            tableNumber: req.body.id_mesa, 
            items: drinks.map(product => `${product.name} (${product.quantity})`),
            total: totalDrinks  // Total solo de bebidas
        });

        io.emit('new_order_kitchen', { 
            tableNumber: req.body.id_mesa, 
            items: foods.map(product => `${product.name} (${product.quantity})`),
            total: totalFoods  // Total solo de comida
        });
>>>>>>> 9fca3d38e3cf86f8c0fc7c8e9c7c31d47230bc51

        res.status(201).json({
            message: 'Pedido confirmado',
            orderId,
        });
    } catch (error) {
        console.error('Error al confirmar el pedido:', error);
        res.status(500).json({ error: 'Error al confirmar el pedido' });
    }
};

<<<<<<< HEAD
=======

// Crear el pedido
>>>>>>> 9fca3d38e3cf86f8c0fc7c8e9c7c31d47230bc51
exports.createOrder = async (req, res) => {
    const { products, user_id, table_id, bar_id, special_notes, orderGroup_id } = req.body;

    try {
        // Crear el pedido y obtener el orderTotal_id
        let orderTotal_id;

<<<<<<< HEAD
        // Lógica para obtener o crear un OrderTotal
=======
        const result = await db.query(
            `INSERT INTO "OrderTotal"(user_id, table_id, bar_id, status, creation_date, special_notes, group_order, orderGroup_id, total)
             VALUES($1, $2, $3, 'in process', NOW(), $4, $5, $6, $7) RETURNING orderTotal_id`,
            [user_id, table_id, bar_id, special_notes, !!orderGroup_id, orderGroup_id || null, 0]
        );

        orderTotal_id = result.rows[0].ordertotal_id;
>>>>>>> 9fca3d38e3cf86f8c0fc7c8e9c7c31d47230bc51

        // Separar productos por categoría
        const drinks = products.filter(product => product.category.toLowerCase() === 'drink');
        const foods = products.filter(product => product.category.toLowerCase() === 'food');

<<<<<<< HEAD
=======
        // Calcular los subtotales de cada categoría
        const totalDrinks = drinks.reduce((acc, product) => acc + (product.price * product.quantity), 0);
        const totalFoods = foods.reduce((acc, product) => acc + (product.price * product.quantity), 0);

>>>>>>> 9fca3d38e3cf86f8c0fc7c8e9c7c31d47230bc51
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

<<<<<<< HEAD
        // Emitir notificaciones separadas para cada sección
        io.emit('new_order_bar', { tableNumber: table_id, items: drinks, total: req.body.total });
        io.emit('new_order_kitchen', { tableNumber: table_id, items: foods, total: req.body.total });
=======
        // Emitir las notificaciones para cada sección
        io.emit('new_order_bar', { 
            tableNumber: req.body.id_mesa, 
            items: drinks.map(product => `${product.name} (${product.quantity})`),
            total: totalDrinks  // Enviar solo el total de bebidas
        });

        io.emit('new_order_kitchen', { 
            tableNumber: req.body.id_mesa, 
            items: foods.map(product => `${product.name} (${product.quantity})`),
            total: totalFoods  // Enviar solo el total de comida
        });
>>>>>>> 9fca3d38e3cf86f8c0fc7c8e9c7c31d47230bc51

        res.status(201).json({ message: 'Pedido creado exitosamente', orderTotal_id });

    } catch (error) {
        console.error('Error al crear el pedido:', error);
        res.status(500).json({ error: 'Error al crear el pedido' });
    }
};
<<<<<<< HEAD
=======


// Confirmar el pedido (bar o cocina)
exports.confirmOrderSection = async (req, res) => {
    const { orderId, section } = req.body;  // section puede ser 'bar' o 'kitchen'

    try {
        // Actualizar el estado del pedido en la base de datos
        const result = await db.query(
            `UPDATE "OrderDetail" 
            SET status = $1 
            WHERE order_id = $2 AND section = $3 RETURNING order_id`,
            ['confirmed', orderId, section]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado o sección incorrecta' });
        }

        // Emitir la confirmación a la sección correspondiente
        if (section === 'bar') {
            io.emit('order_confirmed_bar', { orderId, status: 'confirmed' });
        } else if (section === 'kitchen') {
            io.emit('order_confirmed_kitchen', { orderId, status: 'ready' });
        }

        res.status(200).json({ message: `Pedido confirmado para ${section}` });
    } catch (error) {
        console.error('Error al confirmar el pedido en la sección:', error);
        res.status(500).json({ error: 'Error al confirmar el pedido en la sección' });
    }
};

// Rechazar el pedido (bar o cocina)
exports.rejectOrderSection = async (req, res) => {
    const { orderId, section } = req.body;  // section puede ser 'bar' o 'kitchen'

    try {
        const result = await db.query(
            `UPDATE "OrderDetail" 
            SET status = $1 
            WHERE order_id = $2 AND section = $3 RETURNING order_id`,
            ['rejected', orderId, section]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado o sección incorrecta' });
        }

        // Emitir el rechazo a la sección correspondiente
        if (section === 'bar') {
            io.emit('order_rejected_bar', { orderId, status: 'rejected' });
        } else if (section === 'kitchen') {
            io.emit('order_rejected_kitchen', { orderId, status: 'rejected' });
        }

        res.status(200).json({ message: `Pedido rechazado para ${section}` });
    } catch (error) {
        console.error('Error al rechazar el pedido en la sección:', error);
        res.status(500).json({ error: 'Error al rechazar el pedido en la sección' });
    }
};
>>>>>>> 9fca3d38e3cf86f8c0fc7c8e9c7c31d47230bc51
