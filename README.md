# Proyecto Barlink

Este es el repositorio del backend para el proyecto Barlink, una aplicación móvil que permite a los usuarios realizar pedidos en bares y restaurantes. Los usuarios pueden hacer pedidos individuales o en grupo, y dividir la cuenta al final de su estancia.

## Estructura del Proyecto

### Configuración
- **Archivo:** `src/config/db.js`
  - Configura la conexión con la base de datos PostgreSQL alojada en AWS RDS.
  - Utiliza variables de entorno para las credenciales de conexión.

### Rutas
El backend incluye las siguientes rutas principales:

1. **Usuarios (`src/routes/userRoutes.js`)**:
   - `POST /api/register-consumer`: Registro de usuarios consumidores.
   - `POST /api/register-bar-staff`: Registro de staff y administradores.
   - `POST /api/login`: Inicio de sesión.

2. **Bares (`src/routes/barRoutes.js`)**:
   - `GET /api/bars`: Obtener la lista de bares.
   - `GET /api/bars/:bar_id/products`: Obtener los productos de un bar específico.

3. **Pedidos (`src/routes/orderRoutes.js`)**:
   - `POST /api/orders`: Crear un nuevo pedido.
   - `POST /api/confirm`: Confirmar un pedido.
   - `GET /api/orders/:orderTotal_id`: Obtener detalles de un pedido.
   - `GET /api/bar/queue`: Obtener la cola de productos para la barra.
   - `GET /api/kitchen/queue`: Obtener la cola de productos para la cocina.
   - `PUT /api/bar/confirm`: Confirmar productos en la barra.
   - `PUT /api/kitchen/confirm`: Confirmar productos en la cocina.
   - `PUT /api/bar/reject`: Rechazar productos en la barra.
   - `PUT /api/kitchen/reject`: Rechazar productos en la cocina.
   - `PUT /api/clear-active-queues`: Limpiar colas activas.

4. **Pagos (`src/routes/paymentRoutes.js`)**:
   - `POST /api/payments/:orderTotal_id/pay`: Registrar pagos para pedidos.

5. **Grupos (`src/routes/groupRoutes.js`)**:
   - `POST /api/creategroup`: Crear un grupo de pedidos.
   - `POST /api/group/:group_id/join`: Unirse a un grupo.
   - `POST /api/group/:group_id/pay`: Realizar pago en grupo.
   - `GET /api/group/:group_id`: Obtener detalles de un grupo.

6. **Historial (`src/routes/historyRoutes.js`)**:
   - `GET /api/history/:user_id`: Obtener el historial de pedidos de un usuario.

7. **Resumen de Pedidos (`src/routes/orderSummaryRoutes.js`)**:
   - `GET /api/orderdetail/:table_id`: Obtener detalles de un pedido para una mesa específica.
   - `POST /api/orderdetail/confirm`: Confirmar un pedido.
   - `DELETE /api/orderdetail/cancel`: Cancelar un pedido.

8. **Procesamiento de Menús (`src/routes/pdf.js`)**:
   - `POST /api/process-menu`: Procesar un archivo PDF de menú y convertirlo a formato JSON.

### Controladores
- **Archivo:** `src/controllers/userController.js`
  - Maneja la lógica de registro, inicio de sesión y gestión de usuarios.

### Modelos
- **Archivo:** `src/models/userModel.js`
  - Interactúa con la tabla `AppUser` para gestionar usuarios.

### Servidor
- **Archivo principal:** `src/server.js`
  - Configura y ejecuta el servidor en Express.
  - Define una ruta para verificar la conexión a la base de datos (`/test-db`).

## Requisitos Previos
1. Node.js (v16 o superior)
2. PostgreSQL
3. Variables de entorno:
   - `AWS_USER`
   - `AWS_HOST`
   - `AWS_NAME`
   - `AWS_PASSWORD`
   - `AWS_PORT`
   - `OPENAI_API`

## Instalación
1. Clona este repositorio:
   ```
   git clone https://github.com/Miladatasys/app-bar-backend.git
   ```
2. Instala las dependencias:
   ```
   npm install
   ```
3. Configura las variables de entorno en un archivo `.env`.

4. Ejecuta el servidor:
   ```
   npm start
   ```

## Autor
- **snowcaz** ([Repositorio GitHub](https://github.com/Miladatasys/app-bar-backend))

## Contribuciones
Si deseas contribuir, realiza un fork de este repositorio, realiza tus cambios y envía un pull request.

## Licencia
Este proyecto está bajo la licencia MIT.
