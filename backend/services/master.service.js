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

    const query = `
        SELECT *
        FROM ${table}
        WHERE deleted_on IS NULL
        ORDER BY id
    `;

    const result = await pool.query(query);
    return result.rows;
};

// GET ONE (active only)
const getById = async (table, id) => {
    validateTable(table);

    const query = `
        SELECT *
        FROM ${table}
        WHERE id = $1
        AND deleted_on IS NULL
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
};

// CREATE (dynamic)
const create = async (table, data) => {
    validateTable(table);

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

    const query = `
        UPDATE ${table}
        SET deleted_on = NOW(),
            deleted_by = $1
        WHERE id = $2
        AND deleted_on IS NULL
        RETURNING *;
    `;

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