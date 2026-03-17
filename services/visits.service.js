const pool = require('../config/db');

const baseQuery = `
    SELECT 
        v.id,
        c.name AS client,
        vr.name AS reason,
        v.start_date,
        v.end_date, 
        v.agenda, 
        v.amount
    FROM visits v
    LEFT JOIN clients c ON c.id = v.client_id
    LEFT JOIN visit_reason vr ON vr.id = v.visit_reason_id
    WHERE v.deleted_on IS NULL
`;

const getVisits = async (user) => {

    let query = baseQuery;
    let params = [];

    const role = (user.role || '').toLowerCase();

    if (role !== 'admin') {
        query += ` AND v.user_id = $1`;
        params.push(user.id);
    }

    query += ` ORDER BY v.id DESC`;

    const result = await pool.query(query, params);

    return result.rows;
};

const getVisitById = async (id, user) => {
   let query = baseQuery + ` AND v.id = $1`;
    let params = [id];

    const role = (user.role || '').toLowerCase();

    if (role !== 'admin') {
        query += ` AND v.user_id = $2`;
        params.push(user.id);
    }

    const result = await pool.query(query, params);

    return result.rows[0];
};

module.exports = {
    getVisits,
    getVisitById
};