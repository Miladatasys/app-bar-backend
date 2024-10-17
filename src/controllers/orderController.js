// controllers/orderController.js
const db = require('../config/db'); // Conexión a la base de datos

exports.confirmOrder = async (req, res) => {
    const { paymentMethod } = req.body; // Método de pago recibido desde la vista

    try {
        // Aquí debes realizar la lógica para guardar la confirmación del pedido
        // Por ejemplo, podrías insertar un nuevo registro en la tabla 'Pedido'

        const result = await db.query(
            `INSERT INTO Pedido (id_usuario, id_mesa, id_bar, total, estado, metodo_pago)
             VALUES ($1, $2, $3, $4, 'en proceso', $5) RETURNING id`,
            [req.user.id, req.body.id_mesa, req.body.id_bar, req.body.total, paymentMethod]
        );

        // Responder con el ID del pedido confirmado
        res.status(201).json({
            message: 'Pedido confirmado',
            orderId: result.rows[0].id,
        });
    } catch (error) {
        console.error('Error al confirmar el pedido:', error);
        res.status(500).json({ error: 'Error al confirmar el pedido' });
    }
};