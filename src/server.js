const express = require('express');
const http = require('http');  // Importa el módulo http
const socketIo = require('socket.io');  // Importa Socket.IO
const db = require('./config/db');  // Tu configuración de base de datos
const app = express();
const PORT = process.env.PORT || 3000;

// Importar rutas
const userRoutes = require('./routes/userRoutes');
const barRoutes = require('./routes/barRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const groupRoutes = require('./routes/groupRoutes');
const orderSummaryRoutes = require('./routes/orderSummaryRoutes');
const historyRoutes = require('./routes/historyRoutes');

// Crear el servidor HTTP y conectarlo con Socket.IO
const server = http.createServer(app);  // Usamos http.createServer en lugar de app.listen
const io = socketIo(server);  // Inicializamos Socket.IO con el servidor HTTP

// Middleware para parsear JSON
app.use(express.json());

// Usar las rutas
app.use('/api', userRoutes);
app.use('/api', barRoutes);
app.use('/api', orderRoutes);
app.use('/api', paymentRoutes);
app.use('/api', groupRoutes);
app.use('/api', orderSummaryRoutes);
app.use('/api', historyRoutes);

// Ruta para verificar la conexión a la base de datos
app.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error de conexión a la base de datos' });
  }
});

// Evento cuando un cliente se conecta al socket
io.on('connection', (socket) => {
  console.log('Un cliente se ha conectado');
  
  // Emitir eventos de notificación de nuevos pedidos cuando se recibe un pedido en el sistema
  socket.on('new_order', (orderDetails) => {
    console.log('Nuevo pedido recibido:', orderDetails);
    // Emitir el pedido a todos los clientes conectados (bar y cocina)
    io.emit('new_order', orderDetails);  // Enviar a todos los clientes conectados
  });

  // Evento para cuando un cliente se desconecta
  socket.on('disconnect', () => {
    console.log('Un cliente se ha desconectado');
  });
});

// Ruta básica en la raíz
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

// Arrancar el servidor en el puerto configurado
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
