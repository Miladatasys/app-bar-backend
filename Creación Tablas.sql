-- PostgreSQL Version 16.4

-- En caso real de uso, se reemplazaría la creación de ID autoincremental con uno aleatorio,
-- id UUID PRIMARY KEY DEFAULT gen_random_uuid()

-- Eliminar tablas existentes

--DROP TABLE IF EXISTS UserType CASCADE; 
--The syntax is correct for PostgreSQL, but as SQL language it will give a warning/error with CASCADE
DROP TABLE IF EXISTS GroupMember;
DROP TABLE IF EXISTS OrderGroup;
DROP TABLE IF EXISTS Payment;
DROP TABLE IF EXISTS OrderDetail;
DROP TABLE IF EXISTS Order;
DROP TABLE IF EXISTS Product;
DROP TABLE IF EXISTS Table;
DROP TABLE IF EXISTS Bar;
DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS UserType;

-- Indexes to optimize frequent queries
--
--CREATE INDEX idx_order_user ON Order(user_id);
--CREATE INDEX idx_order_bar ON Order(bar_id);
--CREATE INDEX idx_product_bar ON Product(bar_id);
--CREATE INDEX idx_table_bar ON Table(bar_id);

-- Table for user types (roles)
CREATE TABLE UserType (
    id SERIAL PRIMARY KEY,
    description VARCHAR(50) UNIQUE NOT NULL -- e.g., "customer", "staff_bar", "staff_kitchen" or "admin"
);

-- Creation of the User table
CREATE TABLE User (
    id SERIAL PRIMARY KEY,
    rut VARCHAR(12) UNIQUE NOT NULL,
   
    user_type_id INTEGER REFERENCES UserType(id), 
    -- Association with the role

    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(20),
    birth_date DATE,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_session TIMESTAMP
);

-- Creation of the Bar table
CREATE TABLE Bar (
    id SERIAL PRIMARY KEY,
    business_name VARCHAR(100) NOT NULL,
    commercial_name VARCHAR(100) NOT NULL,
    business_rut VARCHAR(12) UNIQUE NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    opening_hours VARCHAR(255),
    total_capacity INTEGER,
    category VARCHAR(50),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active'
);

-- Creation of the Table table
CREATE TABLE Table (
    id SERIAL PRIMARY KEY,
    bar_id INTEGER REFERENCES Bar(id) ON DELETE CASCADE,
    table_number INTEGER NOT NULL,
    capacity INTEGER,
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'available',
    UNIQUE (bar_id, table_number) -- No duplicate tables in the same bar
);

-- Creation of the Product table
CREATE TABLE Product (
    id SERIAL PRIMARY KEY,
    bar_id INTEGER REFERENCES Bar(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    availability BOOLEAN DEFAULT true,
    preparation_time INTEGER, -- in minutes
    image_url VARCHAR(255)
);

-- Creation of the Order table
CREATE TABLE Order (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES User(id) ON DELETE SET NULL, -- If the user is deleted, the order does not disappear
    table_id INTEGER REFERENCES Table(id) ON DELETE SET NULL, -- The table may disappear but the order history is retained
    bar_id INTEGER REFERENCES Bar(id),
    status VARCHAR(20) DEFAULT 'in process',
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_date TIMESTAMP,
    total DECIMAL(10, 2),
    special_notes VARCHAR(500)
);

-- Creation of the OrderDetail table
CREATE TABLE OrderDetail (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES Order(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES Product(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

-- Creation of the Payment table
CREATE TABLE Payment (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES Order(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transaction_number VARCHAR(100)
);

-- Creation of the OrderGroup table
CREATE TABLE OrderGroup (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    creator_user_id INTEGER REFERENCES User(id) ON DELETE SET NULL, -- The creator can be deleted but the group remains
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active'
);

-- Creation of the GroupMember table
CREATE TABLE GroupMember (
    id SERIAL PRIMARY KEY,
    order_group_id INTEGER REFERENCES OrderGroup(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES User(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending'
);


















-- -- Tabla de tipos de usuario (roles)
-- CREATE TABLE TipoUsuario (
--     id SERIAL PRIMARY KEY,
--     descripcion VARCHAR(50) UNIQUE NOT NULL -- ej: "customer", "staff_bar", "staff_kitchen" o "admin"
-- );

-- -- Creación de la tabla Usuario
-- CREATE TABLE Usuario (
--     id SERIAL PRIMARY KEY,
--     rut VARCHAR(12) UNIQUE NOT NULL,
   
--     id_tipo_usuario INTEGER REFERENCES TipoUsuario(id), 
--     -- Asociación con el rol

--     correo_electronico VARCHAR(100) UNIQUE NOT NULL,
--     contrasena VARCHAR(255) NOT NULL,
--     nombre VARCHAR(50) NOT NULL,
--     apellido VARCHAR(50) NOT NULL,
--     direccion VARCHAR(255),
--     telefono VARCHAR(20),
--     fecha_nacimiento DATE,
--     fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     ultima_sesion TIMESTAMP
-- );

-- -- Creación de la tabla Bar
-- CREATE TABLE Bar (
--     id SERIAL PRIMARY KEY,
--     razon_social VARCHAR(100) NOT NULL,
--     nombre_comercial VARCHAR(100) NOT NULL,
--     rut_empresarial VARCHAR(12) UNIQUE NOT NULL,
--     direccion VARCHAR(255) NOT NULL,
--     telefono VARCHAR(20),
--     correo_electronico VARCHAR(100),
--     horario_atencion VARCHAR(255),
--     capacidad_total INTEGER,
--     categoria VARCHAR(50),
--     fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     estado VARCHAR(20) DEFAULT 'activo'
-- );

-- -- Creación de la tabla Mesa
-- CREATE TABLE Mesa (
--     id SERIAL PRIMARY KEY,
--     id_bar INTEGER REFERENCES Bar(id) ON DELETE CASCADE,
--     numero_mesa INTEGER NOT NULL,
--     capacidad INTEGER,
--     codigo_qr VARCHAR(255) UNIQUE NOT NULL,
--     estado VARCHAR(20) DEFAULT 'libre',
--     UNIQUE (id_bar, numero_mesa) -- No puede haber mesas duplicadas en un mismo bar
-- );

-- -- Creación de la tabla Producto
-- CREATE TABLE Producto (
--     id SERIAL PRIMARY KEY,
--     id_bar INTEGER REFERENCES Bar(id) ON DELETE CASCADE,
--     nombre VARCHAR(100) NOT NULL,
--     descripcion VARCHAR(500),
--     precio DECIMAL(10, 2) NOT NULL,
--     categoria VARCHAR(50),
--     disponibilidad BOOLEAN DEFAULT true,
--     tiempo_preparacion INTEGER, -- en minutos
--     imagen_url VARCHAR(255)
-- );

-- -- Creación de la tabla Pedido
-- CREATE TABLE Pedido (
--     id SERIAL PRIMARY KEY,
--     id_usuario INTEGER REFERENCES Usuario(id) ON DELETE SET NULL, -- Si el usuario se elimina, el pedido no desaparece
--     id_mesa INTEGER REFERENCES Mesa(id) ON DELETE SET NULL, -- La mesa puede desaparecer pero se guarda el historial del pedido
--     id_bar INTEGER REFERENCES Bar(id),
--     estado VARCHAR(20) DEFAULT 'en proceso',
--     fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     fecha_actualizacion TIMESTAMP,
--     total DECIMAL(10, 2),
--     notas_especiales VARCHAR(500)
-- );

-- -- Creación de la tabla Detalle_Pedido
-- CREATE TABLE Detalle_Pedido (
--     id SERIAL PRIMARY KEY,
--     id_pedido INTEGER REFERENCES Pedido(id) ON DELETE CASCADE,
--     id_producto INTEGER REFERENCES Producto(id),
--     cantidad INTEGER NOT NULL,
--     precio_unitario DECIMAL(10, 2) NOT NULL,
--     subtotal DECIMAL(10, 2) NOT NULL
-- );

-- -- Creación de la tabla Pago
-- CREATE TABLE Pago (
--     id SERIAL PRIMARY KEY,
--     id_pedido INTEGER REFERENCES Pedido(id) ON DELETE CASCADE,
--     monto DECIMAL(10, 2) NOT NULL,
--     metodo_pago VARCHAR(50) NOT NULL,
--     estado VARCHAR(20) DEFAULT 'pendiente',
--     fecha_transaccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     numero_transaccion VARCHAR(100)
-- );

-- -- Creación de la tabla Grupo_Pedido
-- CREATE TABLE Grupo_Pedido (
--     id SERIAL PRIMARY KEY,
--     nombre VARCHAR(100) NOT NULL,
--     id_usuario_creador INTEGER REFERENCES Usuario(id) ON DELETE SET NULL, -- El creador puede ser eliminado pero se mantiene el grupo
--     fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     estado VARCHAR(20) DEFAULT 'activo'
-- );

-- -- Creación de la tabla Miembro_Grupo
-- CREATE TABLE Miembro_Grupo (
--     id SERIAL PRIMARY KEY,
--     id_grupo_pedido INTEGER REFERENCES Grupo_Pedido(id) ON DELETE CASCADE,
--     id_usuario INTEGER REFERENCES Usuario(id) ON DELETE CASCADE,
--     estado VARCHAR(20) DEFAULT 'pendiente'
-- );


