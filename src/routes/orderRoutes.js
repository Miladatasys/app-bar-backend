const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Ruta para confirmar un pedido
router.post('/confirm', orderController.confirmOrder);

//Posible función futura
//router.get('all', orderController.getAllOrders)

module.exports = router;