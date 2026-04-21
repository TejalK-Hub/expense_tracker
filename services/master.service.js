const pool = require('../config/db');
const allowedTables = require('../config/allowedTables');

const validateTable = (table) => {
    if (!allowedTables.includes(table)) {
        throw new Error('Invalid table name');
    }
};

// GET ALL (active only)
const getAll = async (table) => {
    validateTable(table);

    let query;

    if (table === 'users') {

        query = `
        SELECT id,
               name,
               email,
               role,
               is_active,
               created_at, 
               deleted_by, 
               deleted_on
        FROM ${table}
        WHERE deleted_on IS NULL
        ORDER BY id
        `;

    } else {

    query = `
        SELECT *
        FROM ${table}
        WHERE deleted_on IS NULL
        ORDER BY id
    `;

    }

    const result = await pool.query(query);
    return result.rows;
};

// GET ONE (active only)
const getById = async (table, id) => {
    validateTable(table);

    let query;

    if (table === 'users') {

        query = `
        SELECT id,
               name,
               email,
               role,
               is_active,
               created_at, 
               deleted_by, 
               deleted_on
        FROM ${table}
        WHERE id = $1
        AND deleted_on IS NULL
    `;

    } else {

    query = `
        SELECT *
        FROM ${table}
        WHERE id = $1
        AND deleted_on IS NULL
    `;

    }

    const result = await pool.query(query, [id]);
    return result.rows[0];
};

// CREATE 
const create = async (table, data) => {
    validateTable(table);

    // STRICT VALIDATION (MANDATORY vs OPTIONAL)
    if (table === 'visits') {

        if (!data.client_id || !data.visit_reason_id || !data.start_date || !data.end_date) {
            throw new Error('Missing required visit fields');
        }

        if (new Date(data.end_date) < new Date(data.start_date)) {
            throw new Error('End date cannot be before start date');
        }

        const client = await pool.query(
        `SELECT name FROM clients WHERE id = $1`,
        [data.client_id]
        );

        const reason = await pool.query(
        `SELECT name FROM visit_reason WHERE id = $1`,
        [data.visit_reason_id]
        );

        if (!client.rows.length || !reason.rows.length) {
            throw new Error('Invalid client or visit reason');
        }

        const clientName = client.rows[0].name;
        const reasonName = reason.rows[0].name;

        if (!data.client_site) {
        throw new Error('client_site is required');
        }

        data.visit_name = `${clientName}_${data.start_date}_${reasonName}_${data.client_site || 'NA'}`;
    }

    const columns = Object.keys(data);
    const values = Object.values(data);

    const cols = columns.join(',');
    const params = columns.map((_, i) => `$${i + 1}`).join(',');

    const query = `
        INSERT INTO ${table} (${cols})
        VALUES (${params})
        RETURNING *;
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
};

// UPDATE (only if active)
const update = async (table, id, data) => {
    validateTable(table);

    const columns = Object.keys(data);
    const values = Object.values(data);

    if (columns.length === 0) {
        throw new Error('No fields to update');
    }

    const setClause = columns
        .map((col, i) => `${col} = $${i + 1}`)
        .join(',');

    const query = `
        UPDATE ${table}
        SET ${setClause}
        WHERE id = $${columns.length + 1}
        AND deleted_on IS NULL
        RETURNING *;
    `;

    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0];
};

// SOFT DELETE
const softDelete = async (table, id, userId) => {
    validateTable(table);

    let query;

    if (table === 'users') {

        query = `
        UPDATE ${table}
        SET deleted_on = NOW(),
            deleted_by = $1,
            is_active = false
        WHERE id = $2
        AND deleted_on IS NULL
        RETURNING id,name,email,role,is_active;
    `;

    } else {

    query = `
        UPDATE ${table}
        SET deleted_on = NOW(),
            deleted_by = $1
        WHERE id = $2
        AND deleted_on IS NULL
        RETURNING *;
    `;

    }

    const result = await pool.query(query, [userId || null, id]);
    return result.rows[0];
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    softDelete
};