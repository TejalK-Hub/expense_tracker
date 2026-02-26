const pool = require('../config/db');

const getMonthlySummary = async (month) => {

    // Validate format YYYY-MM
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
        throw new Error('Invalid month format. Use YYYY-MM');
    }

    const query = `
        SELECT 
            u.id,
            u.name,
            COALESCE(SUM(e.amount),0) AS total_amount
        FROM users u
        LEFT JOIN expenses e 
            ON e.user_id = u.id
            AND TO_CHAR(e.date,'YYYY-MM') = $1
        WHERE u.deleted_on IS NULL
        GROUP BY u.id, u.name
        ORDER BY total_amount DESC
    `;

    const result = await pool.query(query, [month]);
    return result.rows;
};

module.exports = { getMonthlySummary };