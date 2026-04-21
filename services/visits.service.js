const pool = require('../config/db');

const baseQuery = `
    SELECT 
        v.id,
        v.visit_name,
        v.client_id,
        c.name AS client,
        vr.name AS reason,
        TO_CHAR(v.created_at, 'YYYY-MM-DD HH24:MI') AS created_at,
        TO_CHAR(v.start_date, 'YYYY-MM-DD') AS start_date,
        TO_CHAR(v.end_date, 'YYYY-MM-DD') AS end_date, 
        v.agenda, 
        v.amount,
        v.client_site,
        CASE 
            WHEN v.end_date >= CURRENT_DATE THEN 'Active'
            ELSE 'Completed'
        END AS visit_status
    FROM visits v
    LEFT JOIN clients c ON c.id = v.client_id
    LEFT JOIN visit_reason vr ON vr.id = v.visit_reason_id
    WHERE v.deleted_on IS NULL
`;

const getVisits = async (user) => {

    let query = baseQuery;
    let params = [];

    //  ROLE CHECK
    if (!user?.id) {
    throw new Error('Unauthorized');
    }

    query += ` AND v.user_id = $1`;
    params.push(user.id);

    query += ` ORDER BY v.created_at DESC`; 

    const result = await pool.query(query, params);

    return result.rows;
};

const getVisitById = async (id, user) => {
    let query = baseQuery + ` AND v.id = $1`;
    let params = [id];

    if (!user?.id) {
    throw new Error('Unauthorized');
    }

    query += ` AND v.user_id = $2`;
    params.push(user.id);

    const result = await pool.query(query, params);

    return result.rows[0];
};

//  SELF ACTIVE VISITS (for dropdown)
const getSelfActiveVisits = async (user) => {

    if (!user?.id) {
        throw new Error('Unauthorized');
    }

    const query = `
        SELECT 
            id,
            visit_name,
            client_site,
            TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
            TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date
        FROM visits
        WHERE deleted_on IS NULL
        AND end_date >= CURRENT_DATE
        AND user_id = $1
        ORDER BY start_date DESC
    `;

    const result = await pool.query(query, [user.id]);
    return result.rows;
};

const getActiveVisitsByUser = async (user) => {

    const role = String(user?.role || '').toLowerCase();

    let query = `
    SELECT 
        id,
        visit_name,
        client_site,
        TO_CHAR(start_date,'YYYY-MM-DD') AS start_date,
        TO_CHAR(end_date,'YYYY-MM-DD') AS end_date
    FROM visits
    WHERE deleted_on IS NULL
    AND end_date >= CURRENT_DATE
    `;

    let params = [];

    //  USER ISOLATION 
        if (role === 'admin') {
    // no filter
    } else if (user?.id) {
    query += ` AND user_id = $1`;
    params.push(user.id);
    } else {
    throw new Error('Unauthorized access');
    }

    query += ` ORDER BY start_date DESC`; 

    const result = await pool.query(query, params);
    return result.rows;
};

module.exports = {
    getVisits,
    getVisitById,
    getSelfActiveVisits,
    getActiveVisitsByUser
};