const pool = require('../config/db');

const baseQuery = `
    SELECT 
        v.id,
        c.name AS client,
        vr.name AS reason,
        v.start_date,
        v.end_date
    FROM visits v
    LEFT JOIN clients c ON c.id = v.client_id
    LEFT JOIN visit_reason vr ON vr.id = v.visit_reason_id
    WHERE v.deleted_on IS NULL
`;

const getVisits = async () => {
    const result = await pool.query(baseQuery + ` ORDER BY v.id DESC`);
    return result.rows;
};

const getVisitById = async (id) => {
    const result = await pool.query(
        baseQuery + ` AND v.id = $1`,
        [id]
    );
    return result.rows[0];
};

module.exports = {
    getVisits,
    getVisitById
};