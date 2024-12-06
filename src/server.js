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

  // Escuchar el evento para la barra
  socket.on('new_order_bar', (orderDetails) => {
    console.log('Nuevo pedido para la barra recibido:', orderDetails);
    // Emitir solo a la barra
    io.emit('new_order_bar', orderDetails);  // Emitir solo a la barra
  });

  // Escuchar el evento para la cocina
  socket.on('new_order_kitchen', (orderDetails) => {
    console.log('Nuevo pedido para la cocina recibido:', orderDetails);
    // Emitir solo a la cocina
    io.emit('new_order_kitchen', orderDetails);  // Emitir solo a la cocina
  });

  // Evento para cuando un cliente se desconecta
  socket.on('disconnect', () => {
    console.log('Un cliente se ha desconectado');
  });
});

// Arrancar el servidor en el puerto configurado
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
