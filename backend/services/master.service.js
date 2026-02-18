const pool = require('../config/db');
const { buildUpdateQuery } = require('../utils/updateHelper');

// allowed master tables 
const allowedTables = [
    'expense_category',
    'visit_reason',
    'expense_status',
    'rejection_reason', 
    'clients '
];

const validateTable = (table) => {
    if (!allowedTables.includes(table)) {
        throw new Error('Invalid master table');
    }
};


// GET ALL (published + not deleted)
const getAll = async (table) => {
    validateTable(table);

    const query = `
        SELECT id, name, description, is_published
        FROM ${table}
        WHERE deleted_on IS NULL
        ORDER BY name;
    `;

    const result = await pool.query(query);
    return result.rows;
};


// GET ONE by id 
const getOne = async (table, id) => {
    validateTable(table);

    const query = `
        SELECT id, name, description, is_published
        FROM ${table}
        WHERE id = $1
        AND deleted_on IS NULL;
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
};


// CREATE
const create = async (table, data, userId) => {
    validateTable(table);

    const query = `
        INSERT INTO ${table} (name, description, created_by)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;

    const values = [
        data.name,
        data.description || null,
        userId
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};


// UPDATE (only allowed & provided, rest : same)
const update = async (table, id, data) => {
    validateTable(table);

    const allowedFields = ['name', 'description', 'is_published'];

    const { query, values } = buildUpdateQuery(table, id, data, allowedFields);

    const result = await pool.query(query, values);
    return result.rows[0];
};

// SOFT DELETE
const remove = async (table, id, userId) => {
    validateTable(table);

    const query = `
        UPDATE ${table}
        SET deleted_on = CURRENT_TIMESTAMP,
            deleted_by = $1
        WHERE id = $2
        RETURNING *;
    `;

    const result = await pool.query(query, [userId, id]);
    return result.rows[0];
};


module.exports = {
    getAll,
    getOne,
    create,
    update,
    remove
};
