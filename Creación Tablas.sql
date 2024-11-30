-- Eliminar tablas existentes (si ya están creadas)
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

-- Crear tipos relacionados (opcional, según necesidad)
-- CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed');
-- CREATE TYPE order_status AS ENUM ('in process', 'completed', 'rejected');

-- Crear secuencias (si no se usan UUIDs)
-- CREATE SEQUENCE IF NOT EXISTS ...

-- Tabla: Tipos de usuario
CREATE TABLE "UserType" (
    user_type_id SERIAL PRIMARY KEY,
    description VARCHAR(50) UNIQUE NOT NULL
    -- 1: Customer, 2: Staff_Bar, 3: Staff_Kitchen, 4: Waiter, 5: Admin
);

-- Tabla: Usuarios
CREATE TABLE "AppUser" (
    user_id SERIAL PRIMARY KEY,
    user_type_id INTEGER REFERENCES "UserType"(user_type_id),
    rut VARCHAR(12) UNIQUE,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    address VARCHAR(255),
    phone_number VARCHAR(20),
    birth_date DATE,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_session TIMESTAMP
);

-- Tabla: Bares
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

CREATE TABLE "UserBar" (
    user_id INTEGER REFERENCES "AppUser"(user_id) ON DELETE CASCADE,
    bar_id INTEGER REFERENCES "Bar"(bar_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, bar_id)
);


-- Tabla: Mesas del bar
CREATE TABLE "BarTable" (
    table_id SERIAL PRIMARY KEY,
    bar_id INTEGER REFERENCES "Bar"(bar_id) ON DELETE CASCADE,
    table_number INTEGER NOT NULL,
    capacity INTEGER,
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'available',
    UNIQUE (bar_id, table_number)
);

-- Tabla: Productos
CREATE TABLE "Product" (
    product_id SERIAL PRIMARY KEY,
    bar_id INTEGER REFERENCES "Bar"(bar_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(300),
    price DECIMAL(15, 2) NOT NULL, -- Admite CLP o valores con decimales
    category VARCHAR(50), -- Ejemplo: 'drink', 'food'
    availability BOOLEAN DEFAULT TRUE,
    preparation_time INTEGER, -- Tiempo de preparación en minutos
    image_url VARCHAR(255)
);

-- Tabla: Pedidos totales
CREATE TABLE "OrderTotal" (
    orderTotal_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "AppUser"(user_id) ON DELETE SET NULL,
    table_id INTEGER REFERENCES "BarTable"(table_id) ON DELETE SET NULL,
    bar_id INTEGER REFERENCES "Bar"(bar_id),
    status VARCHAR(20) DEFAULT 'in process',
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_date TIMESTAMP,
    total DECIMAL(15, 2) DEFAULT 0.00, -- Total acumulado en CLP
    special_notes VARCHAR(500),
    group_order BOOLEAN DEFAULT FALSE
);

-- Tabla: Detalles de pedido
CREATE TABLE "OrderDetail" (
    orderDetail_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES "OrderTotal"(orderTotal_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES "Product"(product_id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15, 2),
    subtotal DECIMAL(15, 2),
    section VARCHAR(20) CHECK (section IN ('bar', 'kitchen')), -- Identifica si el producto es de barra o cocina
    status VARCHAR(20) DEFAULT 'pending'
);

-- Tabla: Grupos de pedido
CREATE TABLE "OrderGroup" (
    orderGroup_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    creator_user_id INTEGER REFERENCES "AppUser"(user_id) ON DELETE SET NULL,
    table_id INTEGER REFERENCES "BarTable"(table_id) ON DELETE SET NULL,
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    total_order DECIMAL(15, 2) DEFAULT 0.00, -- Total del grupo
    split_type VARCHAR(20) DEFAULT 'equally', -- Cómo dividir: 'equally', 'custom'
    qr_code VARCHAR(255) UNIQUE, -- QR para compartir el grupo
    is_closed BOOLEAN DEFAULT FALSE
);

-- Tabla: Miembros del grupo
CREATE TABLE "GroupMember" (
    groupMember_id SERIAL PRIMARY KEY,
    orderGroup_id INTEGER REFERENCES "OrderGroup"(orderGroup_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES "AppUser"(user_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    is_payer BOOLEAN DEFAULT FALSE,
    amount_to_pay DECIMAL(15, 2) DEFAULT 0.00, -- Monto asignado en CLP
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Pagos
CREATE TABLE "Payment" (
    payment_id SERIAL PRIMARY KEY,
    orderTotal_id INTEGER REFERENCES "OrderTotal"(orderTotal_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES "AppUser"(user_id) ON DELETE SET NULL,
    groupMember_id INTEGER REFERENCES "GroupMember"(groupMember_id) ON DELETE SET NULL,
    orderGroup_id INTEGER REFERENCES "OrderGroup"(orderGroup_id) ON DELETE CASCADE;
    amount DECIMAL(15, 2) NOT NULL, -- Monto en CLP
    payment_method VARCHAR(50) NOT NULL, -- Método de pago: 'cash', 'credit card', etc.
    status VARCHAR(20) DEFAULT 'pending',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transaction_number VARCHAR(100)
);

CREATE TABLE "BarQueue" (
    barQueue_id SERIAL PRIMARY KEY,
    orderDetail_id INTEGER REFERENCES "OrderDetail"(orderDetail_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- Estado del producto (pending, confirmed)
    confirmation_date TIMESTAMP
);

CREATE TABLE "KitchenQueue" (
    kitchenQueue_id SERIAL PRIMARY KEY,
    orderDetail_id INTEGER REFERENCES "OrderDetail"(orderDetail_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- Estado del producto (pending, confirmed)
    confirmation_date TIMESTAMP
);

CREATE TABLE "Notifications" (
    notification_id SERIAL PRIMARY KEY,
    bar_id INT NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_order_total_user ON "OrderTotal"(user_id);
CREATE INDEX idx_order_total_bar ON "OrderTotal"(bar_id);
CREATE INDEX idx_product_bar ON "Product"(bar_id);
CREATE INDEX idx_bar_table_bar ON "BarTable"(bar_id);
CREATE INDEX idx_payment_user ON "Payment"(user_id);
CREATE INDEX idx_payment_transaction_date ON "Payment"(transaction_date);
CREATE INDEX idx_group_member_order_group ON "GroupMember"(orderGroup_id);
