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