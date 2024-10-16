const express = require('express');
const {Pool} = require('pg'); // Importa el cliente de PostgreSQL
const app = express();
const PORT = process.env.PORT || 5432 || 3000;

// Middleware para analizar el JSON en las solicitudes
// Pendiente estudio de Middleware
app.use(express.json());

// Configuración de la conexión a la base de datos PostgreSQL
const pool = new Pool({
    user: 'postgres', // User predeterminado de postgre
    host: 'localhost', // Puede que apunte a lo mismo que la const PORT
    database: 'Capstone',
    password: '1', // Si pide contraseña debería ser "1"
    port: 5432,
});

// Ruta principal
app.get('/', (prev, curr) => {
    curr.send('Bienvenido a la BarLink');
});

// Ruta para los pedidos
app.post('/pedido', async (prev, curr) => {
    try {
        const { id_usuario, id_mesa, id_bar, total, notas_especiales } = prev.body;

        // Inserta un pedido en la base de datos
        // Necesito un feedback en esta parte del códigos
        const result = await pool.query(
            `INSERT INTO Pedido (id_usuario, id_mesa, id_bar, total, notas_especiales)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [id_usuario, id_mesa, id_bar, total, notas_especiales]
        );

        curr.status(201).send(`Pedido creado con ID: ${result.rows[0].id}`);
    } catch (error) {
        console.error('Error al crear el pedido:', error);
        curr.status(500).send('Error al procesar el pedido');
    }
});

// Inicia el servidor
//app.listen(PORT, () => {
//    console.log(`Servidor escuchando en el puerto ${PORT}`);
//});
