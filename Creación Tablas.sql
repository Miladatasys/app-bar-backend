-- PostgreSQL Version 16.4

-- En caso real de uso, se reemplazaría la creación de ID autoincremental con uno aleatorio,
-- id UUID PRIMARY KEY DEFAULT gen_random_uuid()

-- Eliminar tablas existentes

DROP TABLE IF EXISTS "GroupMember" CASCADE;
DROP TABLE IF EXISTS "OrderGroup" CASCADE;
DROP TABLE IF EXISTS "Payment" CASCADE;
DROP TABLE IF EXISTS "OrderDetail" CASCADE;
DROP TABLE IF EXISTS "OrderTotal" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "BarTable" CASCADE;
DROP TABLE IF EXISTS "Bar" CASCADE;
DROP TABLE IF EXISTS "AppUser" CASCADE;
DROP TABLE IF EXISTS "UserType" CASCADE;


-- Drop sequences for all tables
DROP SEQUENCE IF EXISTS "UserType_user_type_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "AppUser_user_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "Bar_bar_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "BarTable_table_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "Product_product_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "OrderTotal_orderTotal_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "OrderDetail_orderDetail_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "Payment_payment_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "OrderGroup_orderGroup_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "GroupMember_groupMember_id_seq" CASCADE;


-- Crear índices para optimizar consultas frecuentes
CREATE INDEX idx_order_total_user ON OrderTotal(user_id);
CREATE INDEX idx_order_total_bar ON OrderTotal(bar_id);
CREATE INDEX idx_product_bar ON Product(bar_id);
CREATE INDEX idx_bar_table_bar ON BarTable(bar_id);
CREATE INDEX idx_payment_user ON Payment(user_id);
CREATE INDEX idx_payment_transaction_date ON Payment(transaction_date);
CREATE INDEX idx_group_member_order_group ON GroupMember(orderGroup_id);


-- Table for user types (roles)
CREATE TABLE "UserType"(
    user_type_id SERIAL PRIMARY KEY,
    description VARCHAR(50) UNIQUE NOT NULL -- e.g., "customer", "staff_bar", "staff_kitchen" or "admin"
);

-- Creation of the User table
CREATE TABLE "AppUser" (
    user_id SERIAL PRIMARY KEY,
    user_type_id INTEGER REFERENCES "UserType"(user_type_id), 
    -- Association with the role
    rut VARCHAR(12) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    address VARCHAR(255),
    phone_number VARCHAR(20),
    birth_date DATE,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_session TIMESTAMP
);

-- Creation of the Bar table
CREATE TABLE "Bar" (
    bar_id SERIAL PRIMARY KEY,
    business_name VARCHAR(100) NOT NULL,
    commercial_name VARCHAR(100) NOT NULL,
    business_rut VARCHAR(12) UNIQUE NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    email VARCHAR(100),
    opening_hours VARCHAR(255),
    total_capacity INTEGER,
    category VARCHAR(50),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active'
);

-- Creation of the BarTable table
CREATE TABLE "BarTable" (
    table_id SERIAL PRIMARY KEY,
    bar_id INTEGER REFERENCES "Bar"(bar_id) ON DELETE CASCADE,
    table_number INTEGER NOT NULL,
    capacity INTEGER,
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'available',
    UNIQUE (bar_id, table_number) -- No duplicate tables in the same bar
);

-- Creation of the Product table
CREATE TABLE "Product" (
    product_id SERIAL PRIMARY KEY,
    bar_id INTEGER REFERENCES "Bar"(bar_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    availability BOOLEAN DEFAULT true,
    preparation_time INTEGER, -- in minutes
    image_url VARCHAR(255)
);

-- Creation of the Order table
CREATE TABLE "OrderTotal" (
    orderTotal_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "AppUser"(user_id) ON DELETE SET NULL, -- If the user is deleted, the order does not disappear
    table_id INTEGER REFERENCES "BarTable"(table_id) ON DELETE SET NULL, -- The table may disappear but the order history is retained
    bar_id INTEGER REFERENCES "Bar"(bar_id),
    status VARCHAR(20) DEFAULT 'in process',
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_date TIMESTAMP,
    total DECIMAL(10, 2),
    special_notes VARCHAR(500)
);

-- Creation of the OrderDetail table
CREATE TABLE "OrderDetail" (
    orderDetail_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES "OrderTotal"(orderTotal_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES "Product"(product_id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

-- Creation of the OrderGroup table
CREATE TABLE "OrderGroup" (
    orderGroup_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    creator_user_id INTEGER REFERENCES "AppUser"(user_id) ON DELETE SET NULL, -- The creator can be deleted but the group remains
    table_id INTEGER REFERENCES "BarTable"(table_id) ON DELETE SET NULL,
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active'
);

-- Creation of the GroupMember table
CREATE TABLE "GroupMember" (
    groupMember_id SERIAL PRIMARY KEY,
    orderGroup_id INTEGER REFERENCES "OrderGroup"(orderGroup_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES "AppUser"(user_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending'
);

-- Creation of the Payment table
CREATE TABLE "Payment" (
    payment_id SERIAL PRIMARY KEY,
    orderTotal_id INTEGER REFERENCES "OrderTotal"(orderTotal_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES "AppUser"(user_id) ON DELETE SET NULL,
    groupMember_id INTEGER REFERENCES "GroupMember"(groupMember_id) ON DELETE SET NULL,
    orderGroup_id INTEGER REFERENCES "OrderGroup"(orderGroup_id),
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transaction_number VARCHAR(100)
);


-- Para ver histórico de pagos de un usuario
-- SELECT p.payment_id, p.amount, p.payment_method, p.status, p.transaction_date, p.transaction_number
-- FROM Payment p
-- JOIN User u ON p.user_id = u.user_id
-- WHERE u.user_id = 1; -- Cambia el ID según el usuario que desees consultar


-- Para ver todos los grupos de una mesa específica
-- SELECT og.orderGroup_id, og.name, og.creation_date, og.status
-- FROM OrderGroup og
-- WHERE og.table_id = 1; -- Reemplaza "1" con el ID de la mesa que deseas consultar


-- Para ver los detalles de un pedido específico
-- SELECT od.orderDetail_id, od.product_id, od.quantity, od.unit_price, od.subtotal
-- FROM "OrderDetail" od
-- JOIN "OrderTotal" ot ON od.order_id = ot.orderTotal_id
-- WHERE ot.orderTotal_id = 1; -- Reemplaza con el ID del pedido que deseas consultar


