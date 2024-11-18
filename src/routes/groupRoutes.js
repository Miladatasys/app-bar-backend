const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Ruta para crear un nuevo grupo
router.post('/creategroup', async (req, res) => {
    const { name, creator_user_id, table_id } = req.body;

    try {
        console.log('Recibiendo solicitud para crear un grupo:', { name, creator_user_id, table_id });

        // Crear un nuevo grupo en la base de datos
        const query = `
        INSERT INTO "OrderGroup" (name, creator_user_id, table_id, status)
        VALUES ($1, $2, $3, 'active') RETURNING ordergroup_id
      `;
        const result = await db.query(query, [name, parseInt(creator_user_id), parseInt(table_id)]);

        //console.log('Resultado de la consulta:', result);

        // Verificar si se obtuvo una fila
        if (!result.rows || result.rows.length === 0) {
            console.error('Error: No se devolvió ningún ID de grupo.');
            return res.status(500).json({ error: 'No se pudo crear el grupo. No se devolvió ningún ID.' });
        }

        const group_id = result.rows[0].ordergroup_id;  // Ajuste aquí
        console.log('Grupo creado con éxito. ID del grupo:', group_id);

        //Agregar al creador como miembro del grupo
        const addCreatorQuery = `
            INSERT INTO "GroupMember" (orderGroup_id, user_id, status, is_payer)
            VALUES ($1, $2, 'active', true)`;
        await db.query(addCreatorQuery, [group_id, creator_user_id]);
        console.log('Creador del grupo agregado como miembro del grupo.');

        // Devuelves el ID del grupo creado
        res.status(201).json({ message: 'Grupo creado exitosamente', group_id });
    } catch (error) {
        console.error('Error al crear el grupo:', error);
        res.status(500).json({ error: 'Error al crear el grupo' });
    }
});



// Unirse a un grupo
router.post('/:group_id/join', async (req, res) => {
    const { group_id } = req.params;
    const { user_id } = req.body;

    try {
        console.log('Solicitud de unirse al grupo:', { group_id, user_id });

        // Verificar si el grupo está activo
        const groupCheckQuery = `SELECT status FROM "OrderGroup" WHERE orderGroup_id = $1`;
        const groupCheckResult = await db.query(groupCheckQuery, [group_id]);

        if (groupCheckResult.rows.length === 0 || groupCheckResult.rows[0].status !== 'active') {
            return res.status(400).json({ message: 'No se puede unir al grupo. El grupo no está activo o no existe.' });
        }

        // Unir al usuario al grupo
        const joinQuery = `
        INSERT INTO "GroupMember"(orderGroup_id, user_id, status)
        VALUES ($1, $2, 'active')`;
        await db.query(joinQuery, [group_id, user_id]);
        console.log('Usuario', { user_id }, ' añadido al grupo', { group_id }, 'exitosamente');


        res.status(201).json({ message: 'Usuario añadido al grupo exitosamente', group_id });
    } catch (error) {
        console.error('Error al unirse al grupo:', error);
        res.status(500).json({ error: 'Error al unirse al grupo' });
    }
});


// Obtener detalles del grupo
router.get('/:group_id', async (req, res) => {
    const { group_id } = req.params;

    try {
        console.log('Detalles del grupo:', group_id);

        const groupQuery = `
            SELECT og.name, og.status, gm.user_id, gm.status as member_status, u.username
            FROM "OrderGroup" og
            JOIN "GroupMember" gm ON og.orderGroup_id = gm.orderGroup_id
            JOIN "AppUser" u ON gm.user_id = u.user_id
            WHERE og.orderGroup_id = $1
        `;
        const result = await db.query(groupQuery, [group_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Grupo no encontrado' });
        }
        console.log('Detalles del grupo obtenidos con éxito:', result.rows);

        res.status(200).json({ group: result.rows });
    } catch (error) {
        console.error('Error al obtener detalles del grupo:', error);
        res.status(500).json({ error: 'Error al obtener detalles del grupo' });
    }
});


// Realizar pago en grupo
router.post('/:group_id/pay', async (req, res) => {
    const { group_id } = req.params;
    const { user_id, amount, payment_method } = req.body;

    try {
        console.log('Solicitud de pago en grupo:', { group_id, user_id, amount, payment_method });
        const query = `
            INSERT INTO "Payment"(orderGroup_id, user_id, amount, payment_method, status)
            VALUES ($1, $2, $3, $4, 'pending') RETURNING payment_id
        `;
        const result = await db.query(query, [group_id, user_id, amount, payment_method]);
        const payment_id = result.rows[0].payment_id;
        console.log('Pago', { payment_id }, ' registrado exitosamente');

        res.status(201).json({ message: 'Pago realizado exitosamente', payment_id });
    } catch (error) {
        console.error('Error al realizar el pago:', error);
        res.status(500).json({ error: 'Error al realizar el pago' });
    }
});


module.exports = router;
