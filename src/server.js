const express = require('express');
const db = require('./config/db');
const app = express();
const PORT = process.env.PORT || 3000;

// Importar rutas
const userRoutes = require('./routes/userRoutes');
const barRoutes = require('./routes/barRoutes');  // Aquí importamos barRoutes

// Middleware para parsear JSON
app.use(express.json());

// Usar las rutas
app.use('/api', userRoutes);
app.use('/api', barRoutes);  // Aquí montamos las rutas de barRoutes

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
