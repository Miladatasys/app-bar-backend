const express = require('express');
const db = require('./config/db');
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

// Middleware para parsear JSON
app.use(express.json());

// Usar las rutas
app.use('/api', userRoutes);
app.use('/api', barRoutes);  
app.use('/api', orderRoutes);
app.use('/api', paymentRoutes);
app.use ('/api', groupRoutes);
app.use ('/api', orderSummaryRoutes);
app.use('/api', historyRoutes);


// app.use('/api/users', userRoutes);  
// app.use('/api/bars', barRoutes);
// app.use('/api/orders', orderRoutes);

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

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Ruta básica en la raíz
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});
