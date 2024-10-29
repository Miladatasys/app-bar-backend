-- Datos para rellenar tablas y realizar pruebas técnicas

-- Inserción de los cuatro tipos de usuario
INSERT INTO "UserType" (description)
VALUES
('customer'),
('staff_bar'),
('staff_kitchen'),
('admin');

-- Inserción de datos en la tabla User
    INSERT INTO "AppUser" (rut, user_type_id, email, password, first_name, last_name, address, phone_number, birth_date, registration_date, last_session)
    VALUES
    ('12345678-9', 1, 'consumidor1@barlink.com', 'pass123', 'John', 'Doe', '123 Main St', '+1234567890', '1990-01-01', NOW(), NOW()),
    ('13355678-9', 1, 'consumidor2@barlink.com', 'pass123', 'Diego', 'Doe', '123 Main St', '+1234567890', '1990-01-01', NOW(), NOW()),
    ('14365678-9', 1, 'consumidor3@barlink.com', 'pass123', 'Camila', 'Doe', '123 Main St', '+1234567890', '1990-01-01', NOW(), NOW()),
    ('98765432-1', 2, 'staffbar@barlink.com', 'pass123', 'Jane', 'Smith', '456 Elm St', '+0987654321', '1985-05-15', NOW(), NOW()),
    ('56789012-3', 3, 'staffcocina@barlink.com', 'pass123', 'Alice', 'Johnson', '789 Oak St', '+1122334455', '1978-12-25', NOW(), NOW()),
    ('12345679-9', 4, 'admin@barlink.com', 'pass123', 'John', 'Doe', '123 Main St', '+1234567890', '1990-01-01', NOW(), NOW());

-- Inserción de datos en la tabla Bar
INSERT INTO "Bar" (business_name, commercial_name, business_rut, address, phone_number, email, opening_hours, total_capacity, category, registration_date, status)
VALUES
('Bar Central Ltda.', 'Central Bar', '11111111-1', 'Av. Principal 123, Santiago', '+56912345678', 'central@example.com', 'Lunes a Viernes, 18:00-02:00', 100, 'bar', NOW(), 'active'),
('Restaurante y Bar El Buen Sabor', 'El Buen Sabor', '22222222-2', 'Calle Secundaria 456, Valparaíso', '+56987654321', 'buen_sabor@example.com', 'Todos los días, 12:00-00:00', 150, 'restaurant', NOW(), 'active'),
('Pub y Bar Noche Mágica', 'Noche Mágica', '33333333-3', 'Paseo Nocturno 789, Concepción', '+56911223344', 'noche_magica@example.com', 'Jueves a Sábado, 20:00-04:00', 80, 'pub', NOW(), 'active');

-- Inserción de datos en la tabla BarTable
INSERT INTO "BarTable" (bar_id, table_number, capacity, qr_code, status)
VALUES
(1, 1, 4, 'https://example.com/qr/1', 'available'),
(1, 2, 4, 'https://example.com/qr/2', 'available'),
(1, 3, 4, 'https://example.com/qr/3', 'occupied'),
(2, 1, 6, 'https://example.com/qr/4', 'available'),
(2, 2, 8, 'https://example.com/qr/5', 'available'),
(2, 3, 8, 'https://example.com/qr/6', 'reserved'),
(3, 1, 6, 'https://example.com/qr/7', 'occupied'),
(3, 2, 8, 'https://example.com/qr/8', 'reserved'),
(3, 3, 8, 'https://example.com/qr/9', 'reserved');


-- Inserción de datos en la tabla Product
INSERT INTO "Product" (bar_id, name, description, price, category, availability, preparation_time, image_url)
VALUES
(1, 'Cerveza Artesanal', 'Cerveza elaborada localmente con un toque cítrico y aroma a lúpulo.', 3500.00, 'Drink', true, 5, 'https://example.com/images/cerveza.jpg'),
(1, 'Pizza Margherita', 'Pizza clásica con salsa de tomate, albahaca fresca y mozzarella.', 8500.00, 'Food', true, 15, 'https://example.com/images/pizza.jpg'),
(1, 'Mojito', 'Cóctel refrescante con ron, menta, azúcar y agua con gas.', 4500.00, 'Drink', false, 10, 'https://example.com/images/mojito.jpg'),
(2, 'Cerveza Artesanal', 'Cerveza elaborada localmente con un toque cítrico y aroma a lúpulo.', 3500.00, 'Drink', true, 5, 'https://example.com/images/cerveza.jpg'),
(2, 'Pizza Margherita', 'Pizza clásica con salsa de tomate, albahaca fresca y mozzarella.', 8500.00, 'Food', true, 15, 'https://example.com/images/pizza.jpg'),
(2, 'Mojito', 'Cóctel refrescante con ron, menta, azúcar y agua con gas.', 4500.00, 'Drink', false, 10, 'https://example.com/images/mojito.jpg'),
(3, 'Cerveza Artesanal', 'Cerveza elaborada localmente con un toque cítrico y aroma a lúpulo.', 3500.00, 'Drink', true, 5, 'https://example.com/images/cerveza.jpg'),
(3, 'Pizza Margherita', 'Pizza clásica con salsa de tomate, albahaca fresca y mozzarella.', 8500.00, 'Food', true, 15, 'https://example.com/images/pizza.jpg'),
(3, 'Mojito', 'Cóctel refrescante con ron, menta, azúcar y agua con gas.', 4500.00, 'Drink', false, 10, 'https://example.com/images/mojito.jpg');


-- Inserción de datos en la tabla OrderTotal
INSERT INTO "OrderTotal" (user_id, table_id, bar_id, status, creation_date, update_date, total, special_notes)
VALUES
(1, 1, 1, 'in process', NOW(), NULL, 15000.00, 'Sin hielo en las bebidas.'),
(1, 2, 1, 'completed', NOW() - INTERVAL '1 DAY', NOW() - INTERVAL '1 HOUR', 22000.00, 'Mesa cerca de la ventana.'),
(1, 3, 1, 'cancelled', NOW() - INTERVAL '2 DAYS', NOW() - INTERVAL '1 DAY', 8000.00, 'Cliente canceló por retraso en la cocina.'),
(1, 1, 2, 'in process', NOW(), NULL, 15000.00, 'Sin hielo en las bebidas.'),
(1, 2, 2, 'completed', NOW() - INTERVAL '1 DAY', NOW() - INTERVAL '1 HOUR', 22000.00, 'Mesa cerca de la ventana.'),
(1, 3, 2, 'cancelled', NOW() - INTERVAL '2 DAYS', NOW() - INTERVAL '1 DAY', 8000.00, 'Cliente canceló por retraso en la cocina.'),
(1, 1, 3, 'in process', NOW(), NULL, 15000.00, 'Sin hielo en las bebidas.'),
(1, 2, 3, 'completed', NOW() - INTERVAL '1 DAY', NOW() - INTERVAL '1 HOUR', 22000.00, 'Mesa cerca de la ventana.'),
(1, 3, 3, 'cancelled', NOW() - INTERVAL '2 DAYS', NOW() - INTERVAL '1 DAY', 8000.00, 'Cliente canceló por retraso en la cocina.');



-- Inserción de datos en la tabla OrderDetail
INSERT INTO "OrderDetail" (order_id, product_id, quantity, unit_price, subtotal)
VALUES
(1, 1, 2, 3500.00, 7000.00), -- Pedido 1, 2 unidades del producto 1
(2, 2, 1, 8500.00, 8500.00), -- Pedido 2, 1 unidad del producto 2
(3, 3, 3, 4500.00, 13500.00); -- Pedido 3, 3 unidades del producto 3


-- Inserción de datos en la tabla OrderGroup
INSERT INTO "OrderGroup" (name, creator_user_id, table_id, creation_date, status)
VALUES
('Grupo de Amigos', 1, 1, NOW(), 'active'), -- Grupo creado por el usuario 1 en la mesa 1
('Cena de Negocios', 2, 2, NOW() - INTERVAL '1 DAY', 'completed'), -- Grupo creado por el usuario 2 en la mesa 2
('Reunión Familiar', 3, 1, NOW() - INTERVAL '2 DAYS', 'cancelled'); -- Grupo creado por el usuario 3 en la mesa 1

-- Inserción de datos en la tabla GroupMember
INSERT INTO "GroupMember" (orderGroup_id, user_id, status)
VALUES
(1, 1, 'active'),   
(1, 2, 'active'),  
(1, 3, 'active'),   
(2, 1, 'active'),   
(2, 2, 'active'),  
(2, 3, 'active'),   
(3, 1, 'pending'),  
(3, 2, 'pending'),
(3, 3, 'pending');  


-- Inserción de datos en la tabla Payment
INSERT INTO "Payment" (orderTotal_id, user_id, groupMember_id, orderGroup_id, amount, payment_method, status, transaction_date, transaction_number)
VALUES
(1, 1, 1, 1, 15000.00, 'credit_card', 'completed', NOW(), 'TXN1234567890'), 
(2, 2, 2, 1, 22000.00, 'cash', 'completed', NOW() - INTERVAL '1 DAY', 'TXN0987654321'), 
(3, 3, 3, 2, 8000.00, 'debit_card', 'failed', NOW() - INTERVAL '2 DAYS', 'TXN1122334455');