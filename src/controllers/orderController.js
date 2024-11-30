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
        io.emit('new_order', orderDetails); // Emitimos el evento 'new_order' con los detalles del pedido

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
