// Configuración básica
const express = require('express');
const db = require('./config/db');
const app = express();
const PORT = process.env.PORT || 3000;

//Controladores
//const orderController = require('../controllers/orderController');

// Rutas
//const router = express.Router();
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const barRoutes = require('./routes/barRoutes')
//module.exports = router; //No estoy seguro de si borrarlo aún o no, creo que va en otra ubicación

// Middleware -para la comunicación entre distintas partes
app.use(express.json());

// Para utiliazr las rutas -Rutas pendientes a corrección en base al frontend
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bars', barRoutes)

//router.post('/confirm', orderController.confirmOrder); //sí const router está comentado, este se queda así



// Para probar la conexión al servidor
app.get('/', (req, res) => {
  res.send('Bienvenido a la API de la APP Bar');
});

// Para probar la conexión o disponibilidad de la bbdd
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
