-- Esquema de consultas para EDR
-- Table "UserType" {
--     user_type_id serial [pk]
--     description varchar(50) [unique, not null]
-- }

-- Table "AppUser" {
--     user_id serial [pk]
--     user_type_id integer [ref: > UserType.user_type_id]
--     rut varchar(12) [unique]
--     email varchar(100) [unique]
--     password varchar(255)
--     first_name varchar(50)
--     last_name varchar(50)
--     address varchar(255)
--     phone_number varchar(20)
--     birth_date date
--     registration_date timestamp [default: 'CURRENT_TIMESTAMP']
--     last_session timestamp
-- }

-- Table "Bar" {
--     bar_id serial [pk]
--     business_name varchar(100) [not null]
--     commercial_name varchar(100) [not null]
--     business_rut varchar(12) [unique, not null]
--     address varchar(255) [not null]
--     phone_number varchar(20)
--     email varchar(100)
--     opening_hours varchar(255)
--     total_capacity integer
--     category varchar(50)
--     registration_date timestamp [default: 'CURRENT_TIMESTAMP']
--     status varchar(20) [default: 'active']
-- }

-- Table "UserBar" {
--     user_id integer [ref: > AppUser.user_id]
--     bar_id integer [ref: > Bar.bar_id]
--     primary key (user_id, bar_id)
-- }

-- Table "BarTable" {
--     table_id serial [pk]
--     bar_id integer [ref: > Bar.bar_id]
--     table_number integer [not null]
--     capacity integer
--     qr_code varchar(255) [unique, not null]
--     status varchar(20) [default: 'available']
 
-- }

-- Table "Product" {
--     product_id serial [pk]
--     bar_id integer [ref: > Bar.bar_id]
--     name varchar(100) [not null]
--     description varchar(300)
--     price decimal(15, 2) [not null]
--     category varchar(50)
--     availability boolean [default: true]
--     preparation_time integer
--     image_url varchar(255)
-- }

-- Table "OrderTotal" {
--     orderTotal_id serial [pk]
--     user_id integer [ref: > AppUser.user_id]
--     table_id integer [ref: > BarTable.table_id]
--     bar_id integer [ref: > Bar.bar_id]
--     status varchar(20) [default: 'in process']
--     creation_date timestamp [default: 'CURRENT_TIMESTAMP']
--     update_date timestamp
--     total decimal(15, 2) [default: 0.00]
--     special_notes varchar(500)
--     group_order boolean [default: false]
-- }

-- Table "OrderDetail" {
--     orderDetail_id serial [pk]
--     order_id integer [ref: > OrderTotal.orderTotal_id]
--     product_id integer [ref: > Product.product_id]
--     quantity integer [not null]
--     unit_price decimal(15, 2)
--     subtotal decimal(15, 2)
--     section varchar(20)
--     status varchar(20) [default: 'pending']
-- }

-- Table "OrderGroup" {
--     orderGroup_id serial [pk]
--     name varchar(100) [not null]
--     creator_user_id integer [ref: > AppUser.user_id]
--     table_id integer [ref: > BarTable.table_id]
--     creation_date timestamp [default: 'CURRENT_TIMESTAMP']
--     status varchar(20) [default: 'active']
--     total_order decimal(15, 2) [default: 0.00]
--     split_type varchar(20) [default: 'equally']
--     qr_code varchar(255) [unique]
--     is_closed boolean [default: false]
-- }

-- Table "GroupMember" {
--     groupMember_id serial [pk]
--     orderGroup_id integer [ref: > OrderGroup.orderGroup_id]
--     user_id integer [ref: > AppUser.user_id]
--     status varchar(20) [default: 'pending']
--     is_payer boolean [default: false]
--     amount_to_pay decimal(15, 2) [default: 0.00]
--     join_date timestamp [default: 'CURRENT_TIMESTAMP']
-- }

-- Table "Payment" {
--     payment_id serial [pk]
--     orderTotal_id integer [ref: > OrderTotal.orderTotal_id]
--     user_id integer [ref: > AppUser.user_id]
--     groupMember_id integer [ref: > GroupMember.groupMember_id]
--     orderGroup_id integer [ref: > OrderGroup.orderGroup_id]
--     amount decimal(15, 2) [not null]
--     payment_method varchar(50) [not null]
--     status varchar(20) [default: 'pending']
--     transaction_date timestamp [default: 'CURRENT_TIMESTAMP']
--     transaction_number varchar(100)
-- }

-- Table "BarQueue" {
--     barQueue_id serial [pk]
--     orderDetail_id integer [ref: > OrderDetail.orderDetail_id]
--     status varchar(20) [default: 'pending']
--     confirmation_date timestamp
-- }

-- Table "KitchenQueue" {
--     kitchenQueue_id serial [pk]
--     orderDetail_id integer [ref: > OrderDetail.orderDetail_id]
--     status varchar(20) [default: 'pending']
--     confirmation_date timestamp
-- }

-- Table "Notifications" {
--     notification_id serial [pk]
--     bar_id integer [ref: > Bar.bar_id]
--     message text [not null]
--     status varchar(50) [default: 'pending']
--     created_at timestamp [default: 'NOW()']
-- }


-- Para revisión de datos de una orden
-- SELECT 
--     ot.orderTotal_id,
--     ot.user_id,
--     ot.table_id,
--     ot.bar_id,
--     ot.status,
--     ot.creation_date,
--     ot.update_date,
--     ot.total,
--     ot.special_notes,
--     au.first_name AS user_first_name,
--     au.last_name AS user_last_name,
--     bt.table_number AS table_number,
--     b.business_name AS bar_name
-- FROM 
--     "OrderTotal" ot
-- LEFT JOIN 
--     "AppUser" au ON ot.user_id = au.user_id
-- LEFT JOIN 
--     "BarTable" bt ON ot.table_id = bt.table_id
-- LEFT JOIN 
--     "Bar" b ON ot.bar_id = b.bar_id
-- WHERE 
--     ot.orderTotal_id IN (94) -- Filtra por los IDs deseados
-- ORDER BY 
--     ot.creation_date DESC; -- Ordenar por fecha de creación, de más reciente a más antiguo


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


-- SELECT user_id, first_name, last_name FROM "AppUser" WHERE user_id = 1;
-- SELECT bar_id, business_name FROM "Bar" WHERE bar_id = (SELECT DISTINCT bar_id FROM "OrderTotal" WHERE orderTotal_id IN (85, 86, 87));
-- SELECT table_id, table_number, bar_id FROM "BarTable" WHERE table_id IN (SELECT DISTINCT table_id FROM "OrderTotal" WHERE orderTotal_id IN (85, 86, 87));
-- SELECT * FROM "Bar" WHERE bar_id = 1;
-- SELECT orderTotal_id, bar_id FROM "OrderTotal" WHERE orderTotal_id IN (85, 86, 87, 91, 92, 93);


--Para conseguir todos los miembros de un grupo
-- SELECT 
--     gm.groupMember_id,
--     gm.orderGroup_id,
--     gm.user_id,
--    -- gm.status,
--     gm.is_payer
-- FROM "GroupMember" gm
-- JOIN "AppUser" au ON gm.user_id = au.user_id
-- WHERE gm.orderGroup_id = 54;


-- Para conseguir todos los miembros de un grupo y el creador del grupo
-- SELECT 
--     gm.groupMember_id,
--     gm.orderGroup_id,
--     gm.user_id,
--     gm.is_payer,
--     au.first_name AS member_first_name,
--     og.creator_user_id,
--     creator.first_name AS creator_first_name
-- FROM "GroupMember" gm
-- JOIN "AppUser" au ON gm.user_id = au.user_id
-- JOIN "OrderGroup" og ON gm.orderGroup_id = og.orderGroup_id
-- JOIN "AppUser" creator ON og.creator_user_id = creator.user_id
-- WHERE gm.orderGroup_id = 60;

-- Para comprobar pagos de un pedido 
-- SELECT * FROM "OrderTotal" WHERE orderTotal_id = 430;