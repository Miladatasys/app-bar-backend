const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const db = require('./config/db');  // Tu configuración de base de datos
const app = express();
const PORT = process.env.PORT || 3000;

// Crear el servidor HTTP y conectarlo con Socket.IO
const server = http.createServer(app);  // Usamos http.createServer en lugar de app.listen
const io = socketIo(server);  // Inicializamos Socket.IO con el servidor HTTP

// Middleware para parsear JSON
app.use(express.json());

// Usar las rutas
const userRoutes = require('./routes/userRoutes');
const barRoutes = require('./routes/barRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const groupRoutes = require('./routes/groupRoutes');
const orderSummaryRoutes = require('./routes/orderSummaryRoutes');
const historyRoutes = require('./routes/historyRoutes');

app.use('/api', userRoutes);
app.use('/api', barRoutes);
app.use('/api', orderRoutes);
app.use('/api', paymentRoutes);
app.use('/api', groupRoutes);
app.use('/api', orderSummaryRoutes);
app.use('/api', historyRoutes);

// Ruta básica en la raíz
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

// Evento cuando un cliente se conecta al socket
io.on('connection', (socket) => {
  console.log('Un cliente se ha conectado');

  // Escuchar el evento 'new_order_bar' y emitir a los clientes correspondientes
  socket.on('new_order_bar', (orderDetails) => {
    console.log('Nuevo pedido para la barra recibido:', orderDetails);
    // Emitir solo a la barra
    io.emit('new_order_bar', orderDetails);  // Emitir a todos los clientes conectados
  });

  // Escuchar el evento 'new_order_kitchen' y emitir a los clientes correspondientes
  socket.on('new_order_kitchen', (orderDetails) => {
    console.log('Nuevo pedido para la cocina recibido:', orderDetails);
    io.emit('new_order_kitchen', orderDetails); // Emitir a todos los clientes conectados
  });

  // Evento para cuando un cliente se desconecta
  socket.on('disconnect', () => {
    console.log('Un cliente se ha desconectado');
  });
});

// Función para confirmar un pedido (barra)
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

// Función para crear un nuevo pedido (barra y cocina)
exports.createOrder = async (req, res) => {
  const { products, user_id, table_id, bar_id, special_notes, orderGroup_id } = req.body;

  try {
    // Crear el pedido y obtener el orderTotal_id
    let orderTotal_id;

    // Lógica para obtener o crear un OrderTotal

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
    io.emit('new_order_bar', { tableNumber: table_id, items: drinks, total: req.body.total, orderId: orderTotal_id });
    io.emit('new_order_kitchen', { tableNumber: table_id, items: foods, total: req.body.total, orderId: orderTotal_id });

    res.status(201).json({ message: 'Pedido creado exitosamente', orderTotal_id });

  } catch (error) {
    console.error('Error al crear el pedido:', error);
    res.status(500).json({ error: 'Error al crear el pedido' });
  }
};

// Confirmar el pedido en cocina
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

// Rechazar el pedido en cocina
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

// Arrancar el servidor en el puerto configurado
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
