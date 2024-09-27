const express = require('express');
const app = express();
const PORT = process.env.PORT || 5432;
//const port = 5432

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Bienvenido a la API de la APP Bar');
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});


// ruta para manejar los pedidos
app.post('/pedido', (req, res) => {
    // Aquí manejarás los pedidos
    res.send('Pedido recibido');
  });
  
