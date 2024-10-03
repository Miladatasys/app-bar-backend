-- PostgreSQL Versión 16.4

-- En caso real de uso, se reemplazaría la creación de ID autoincremental con uno aleatorio,
-- id UUID PRIMARY KEY DEFAULT gen_random_uuid()

-- Eliminar tablas existentes
--
--DROP TABLE IF EXISTS TipoUsuario CASCADE; 
--Está bien la redacción para postgre, pero como lenguaje SQL dará alerta/error el CASCADE
DROP TABLE IF EXISTS Miembro_Grupo;
DROP TABLE IF EXISTS Grupo_Pedido;
DROP TABLE IF EXISTS Pago;
DROP TABLE IF EXISTS Detalle_Pedido;
DROP TABLE IF EXISTS Pedido;
DROP TABLE IF EXISTS Producto;
DROP TABLE IF EXISTS Mesa;
DROP TABLE IF EXISTS Bar;
DROP TABLE IF EXISTS Usuario;


-- Índices para optimizar consultas frecuentes
--
--CREATE INDEX idx_pedido_usuario ON Pedido(id_usuario);
--CREATE INDEX idx_pedido_bar ON Pedido(id_bar);
--CREATE INDEX idx_producto_bar ON Producto(id_bar);
--CREATE INDEX idx_mesa_bar ON Mesa(id_bar);


-- Tabla de tipos de usuario (roles)
CREATE TABLE TipoUsuario (
    id SERIAL PRIMARY KEY,
    descripcion VARCHAR(50) UNIQUE NOT NULL -- ej: 'consumidor', 'garzon', 'administrador'
);

-- Creación de la tabla Usuario
CREATE TABLE Usuario (
    id SERIAL PRIMARY KEY,
    rut VARCHAR(12) UNIQUE NOT NULL,
   
    id_tipo_usuario INTEGER REFERENCES TipoUsuario(id), 
    -- Asociación con el rol

    correo_electronico VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    direccion VARCHAR(255),
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_sesion TIMESTAMP
);

-- Creación de la tabla Bar
CREATE TABLE Bar (
    id SERIAL PRIMARY KEY,
    razon_social VARCHAR(100) NOT NULL,
    nombre_comercial VARCHAR(100) NOT NULL,
    rut_empresarial VARCHAR(12) UNIQUE NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    correo_electronico VARCHAR(100),
    horario_atencion VARCHAR(255),
    capacidad_total INTEGER,
    categoria VARCHAR(50),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'activo'
);

-- Creación de la tabla Mesa
CREATE TABLE Mesa (
    id SERIAL PRIMARY KEY,
    id_bar INTEGER REFERENCES Bar(id) ON DELETE CASCADE,
    numero_mesa INTEGER NOT NULL,
    capacidad INTEGER,
    codigo_qr VARCHAR(255) UNIQUE NOT NULL,
    estado VARCHAR(20) DEFAULT 'libre',
    UNIQUE (id_bar, numero_mesa) -- No puede haber mesas duplicadas en un mismo bar
);

-- Creación de la tabla Producto
CREATE TABLE Producto (
    id SERIAL PRIMARY KEY,
    id_bar INTEGER REFERENCES Bar(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(500),
    precio DECIMAL(10, 2) NOT NULL,
    categoria VARCHAR(50),
    disponibilidad BOOLEAN DEFAULT true,
    tiempo_preparacion INTEGER, -- en minutos
    imagen_url VARCHAR(255)
);

-- Creación de la tabla Pedido
CREATE TABLE Pedido (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES Usuario(id) ON DELETE SET NULL, -- Si el usuario se elimina, el pedido no desaparece
    id_mesa INTEGER REFERENCES Mesa(id) ON DELETE SET NULL, -- La mesa puede desaparecer pero se guarda el historial del pedido
    id_bar INTEGER REFERENCES Bar(id),
    estado VARCHAR(20) DEFAULT 'en proceso',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    total DECIMAL(10, 2),
    notas_especiales VARCHAR(500)
);

-- Creación de la tabla Detalle_Pedido
CREATE TABLE Detalle_Pedido (
    id SERIAL PRIMARY KEY,
    id_pedido INTEGER REFERENCES Pedido(id) ON DELETE CASCADE,
    id_producto INTEGER REFERENCES Producto(id),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

-- Creación de la tabla Pago
CREATE TABLE Pago (
    id SERIAL PRIMARY KEY,
    id_pedido INTEGER REFERENCES Pedido(id) ON DELETE CASCADE,
    monto DECIMAL(10, 2) NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente',
    fecha_transaccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    numero_transaccion VARCHAR(100)
);

-- Creación de la tabla Grupo_Pedido
CREATE TABLE Grupo_Pedido (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    id_usuario_creador INTEGER REFERENCES Usuario(id) ON DELETE SET NULL, -- El creador puede ser eliminado pero se mantiene el grupo
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'activo'
);

-- Creación de la tabla Miembro_Grupo
CREATE TABLE Miembro_Grupo (
    id SERIAL PRIMARY KEY,
    id_grupo_pedido INTEGER REFERENCES Grupo_Pedido(id) ON DELETE CASCADE,
    id_usuario INTEGER REFERENCES Usuario(id) ON DELETE CASCADE,
    estado VARCHAR(20) DEFAULT 'pendiente'
);
