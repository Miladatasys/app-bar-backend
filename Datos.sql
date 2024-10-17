-- Datos para rellenar tablas y realizar pruebas técnicas

-- Inserción de los cuatro tipos de usuario
INSERT INTO UserType (role_name)
VALUES
('customer'),
('staff_bar'),
('staff_kitchen'),
('admin');

-- Inserción de datos en la tabla User
INSERT INTO "User" (rut, user_type_id, email, password, first_name, last_name, address, phone, birth_date, registration_date, last_session)
VALUES
('12345678-9', 1, 'user1@example.com', 'password123', 'John', 'Doe', '123 Main St', '+1234567890', '1990-01-01', NOW(), NOW()),
('98765432-1', 2, 'user2@example.com', 'password456', 'Jane', 'Smith', '456 Elm St', '+0987654321', '1985-05-15', NOW(), NOW()),
('56789012-3', 3, 'user3@example.com', 'password789', 'Alice', 'Johnson', '789 Oak St', '+1122334455', '1978-12-25', NOW(), NOW());

-- Inserción de datos en la tabla Bar
-- Todos los bares tienen el status de "active"
INSERT INTO Bar (business_name, commercial_name, business_rut, address, phone, email, opening_hours, total_capacity, category, registration_date, status)
VALUES
('Bar Central Ltda.', 'Central Bar', '11111111-1', 'Av. Principal 123, Santiago', '+56912345678', 'central@example.com', 'Lunes a Viernes, 18:00-02:00', 100, 'bar', NOW(), 'active'),
('Restaurante y Bar El Buen Sabor', 'El Buen Sabor', '22222222-2', 'Calle Secundaria 456, Valparaíso', '+56987654321', 'buen_sabor@example.com', 'Todos los días, 12:00-00:00', 150, 'restaurant', NOW(), 'active'),
('Pub y Bar Noche Mágica', 'Noche Mágica', '33333333-3', 'Paseo Nocturno 789, Concepción', '+56911223344', 'noche_magica@example.com', 'Jueves a Sábado, 20:00-04:00', 80, 'pub', NOW(), 'active');

-- Inserción de datos en la tabla Table
INSERT INTO Table (bar_id, table_number, capacity, qr_code, status)
VALUES
(1, 1, 4, 'https://example.com/qr/1', 'available'),
(1, 2, 6, 'https://example.com/qr/2', 'occupied'),
(2, 1, 8, 'https://example.com/qr/3', 'reserved');

-- Inserción de datos en la tabla Product
INSERT INTO Product (bar_id, name, description, price, category, availability, preparation_time, image_url)
VALUES
(1, 'Cerveza Artesanal', 'Cerveza elaborada localmente con un toque cítrico y aroma a lúpulo.', 3500.00, 'Bebida', true, 5, 'https://example.com/images/cerveza.jpg'),
(2, 'Pizza Margherita', 'Pizza clásica con salsa de tomate, albahaca fresca y mozzarella.', 8500.00, 'Comida', true, 15, 'https://example.com/images/pizza.jpg'),
(3, 'Mojito', 'Cóctel refrescante con ron, menta, azúcar y agua con gas.', 4500.00, 'Cóctel', false, 10, 'https://example.com/images/mojito.jpg');

-- Inserción de datos en la tabla Order
INSERT INTO "Order" (user_id, table_id, bar_id, status, creation_date, update_date, total, special_notes)
VALUES
(1, 1, 1, 'in process', NOW(), NULL, 15000.00, 'Sin hielo en las bebidas.'),
(2, 2, 1, 'completed', NOW() - INTERVAL '1 DAY', NOW() - INTERVAL '1 HOUR', 22000.00, 'Mesa cerca de la ventana.'),
(3, 1, 2, 'cancelled', NOW() - INTERVAL '2 DAYS', NOW() - INTERVAL '1 DAY', 8000.00, 'Cliente canceló por retraso en la cocina.');

-- Inserción de datos en la tabla OrderDetail
INSERT INTO OrderDetail (order_id, product_id, quantity, unit_price, subtotal)
VALUES
(1, 1, 2, 3500.00, 7000.00), -- Pedido 1, 2 unidades del producto 1
(2, 2, 1, 8500.00, 8500.00), -- Pedido 2, 1 unidad del producto 2
(3, 3, 3, 4500.00, 13500.00); -- Pedido 3, 3 unidades del producto 3

-- Inserción de datos en la tabla Payment
INSERT INTO Payment (order_id, amount, payment_method, status, transaction_date, transaction_number)
VALUES
(1, 15000.00, 'credit_card', 'completed', NOW(), 'TXN1234567890'), -- Pago asociado al pedido 1
(2, 22000.00, 'cash', 'completed', NOW() - INTERVAL '1 DAY', 'TXN0987654321'), -- Pago asociado al pedido 2
(3, 8000.00, 'debit_card', 'failed', NOW() - INTERVAL '2 DAYS', 'TXN1122334455'); -- Pago asociado al pedido 3

-- Inserción de datos en la tabla OrderGroup
INSERT INTO OrderGroup (name, creator_user_id, creation_date, status)
VALUES
('Grupo de Amigos', 1, NOW(), 'active'), -- Grupo creado por el usuario 1
('Cena de Negocios', 2, NOW() - INTERVAL '1 DAY', 'completed'), -- Grupo creado por el usuario 2
('Reunión Familiar', 3, NOW() - INTERVAL '2 DAYS', 'cancelled'); -- Grupo creado por el usuario 3

-- Inserción de datos en la tabla GroupMember
INSERT INTO GroupMember (order_group_id, user_id, status)
VALUES
(1, 1, 'active'),    -- Usuario 1 en el grupo 1, estado activo
(1, 2, 'pending'),   -- Usuario 2 en el grupo 1, estado pendiente
(2, 3, 'active');    -- Usuario 3 en el grupo 2, estado activo




