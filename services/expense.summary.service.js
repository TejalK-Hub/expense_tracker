const pool = require('../config/db');

const getMonthlySummary = async (month) => {

   
    const startDate = `${month}-01`;
    const endDateQuery = `DATE_TRUNC('month', $1::date) + INTERVAL '1 month'`;

    const query = `
        SELECT 
            u.id,
            u.name,
            CONCAT('INR ', COALESCE(SUM(e.amount),0)) AS total_amount
        FROM users u
        LEFT JOIN expenses e 
            ON e.user_id = u.id
            AND e.date >= $1::date
            AND e.date < (${endDateQuery})
        WHERE u.deleted_on IS NULL
        GROUP BY u.id, u.name
        ORDER BY SUM(e.amount) DESC NULLS LAST
    `;

    const result = await pool.query(query, [startDate]);
    return result.rows;
};

module.exports = { getMonthlySummary };