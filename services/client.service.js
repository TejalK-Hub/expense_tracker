const pool = require('../config/db');

// -------------------------------- GET ALL CLIENTS --------------------------------

const getClients = async () => {

    const query = `
        SELECT
            id,
            name,
            site,
            contact,
            email,
            description,
            created_on
        FROM clients
        WHERE deleted_on IS NULL
        ORDER BY name ASC
    `;

    const result = await pool.query(query);

    return result.rows;
};

// -------------------------------- GET CLIENT BY ID --------------------------------

const getClientById = async (id) => {

    const query = `
        SELECT
            id,
            name,
            site,
            contact,
            email,
            description,
            created_on
        FROM clients
        WHERE id = $1
        AND deleted_on IS NULL
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
};

// -------------------------------- CREATE CLIENT --------------------------------

const createClient = async (data, user) => {

    const {
        name,
        sites,
        contact,
        email
    } = data;

    const query = `
        INSERT INTO clients
        (
            name,
            site,
            contact,
            email,
            created_by,
            created_on,
            is_published
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5,
            CURRENT_TIMESTAMP,
            true
        )
        RETURNING *
    `;

    const values = [
        name,
        sites,
        contact,
        email,
        user.id
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

// -------------------------------- UPDATE CLIENT --------------------------------

const updateClient = async (id, data) => {

    const {
        name,
        sites,
        contact,
        email
    } = data;

    const query = `
        UPDATE clients
        SET
            name = $1,
            site = $2,
            contact = $3,
            email = $4
        WHERE id = $5
        RETURNING *
    `;

    const values = [
        name,
        sites,
        contact,
        email,
        id
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

// -------------------------------- DELETE CLIENT --------------------------------

const deleteClient = async (id, user) => {

    const query = `
        UPDATE clients
        SET
            deleted_on = CURRENT_TIMESTAMP,
            deleted_by = $2
        WHERE id = $1
    `;

    await pool.query(query, [
        id,
        user.id
    ]);

    return true;
};

// -------------------------------- DISTINCT SITES --------------------------------

const getDistinctSites = async () => {

    const query = `
        SELECT DISTINCT
            UNNEST(site) AS site
        FROM clients
        WHERE deleted_on IS NULL
        ORDER BY site
    `;

    const result = await pool.query(query);

    return result.rows;
};

module.exports = {
    getClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
    getDistinctSites
};