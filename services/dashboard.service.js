const pool = require('../config/db');

const getAdminDashboard = async () => {

    // SUMMARY 
    const summaryQuery = `
        SELECT
            (SELECT COUNT(*) FROM users WHERE deleted_on IS NULL) AS total_users,
            (SELECT COUNT(*) FROM visits WHERE deleted_on IS NULL) AS total_visits,
            (SELECT COUNT(*) FROM expenses) AS total_expenses,
            CONCAT('INR ', COALESCE((SELECT SUM(amount) FROM expenses),0)) AS total_amount
    `;

    // STATUS SUMMARY 
    const statusQuery = `
        SELECT 
            es.name AS status,
            COUNT(e.id) AS count,
            CONCAT('INR ', COALESCE(SUM(e.amount),0)) AS amount
        FROM expense_status es
        LEFT JOIN expenses e 
            ON e.status_id = es.id
        WHERE es.deleted_on IS NULL
        GROUP BY es.name
        ORDER BY es.name
    `;

    // CATEGORY DISTRIBUTION 
    const categoryQuery = `
        SELECT 
            ec.name AS category,
            COUNT(e.id) AS count,
            CONCAT('INR ', COALESCE(SUM(e.amount),0)) AS amount
        FROM expense_category ec
        LEFT JOIN expenses e
            ON e.category_id = ec.id
        WHERE ec.deleted_on IS NULL
        GROUP BY ec.name
        ORDER BY SUM(e.amount) DESC NULLS LAST
    `;

    // MONTHLY TREND 
    const monthlyQuery = `
        SELECT 
            TO_CHAR(date, 'YYYY-MM') AS month,
            COUNT(*) AS count,
            CONCAT('INR ', COALESCE(SUM(amount),0)) AS amount
        FROM expenses
        GROUP BY month
        ORDER BY month
    `;

    const summaryResult = await pool.query(summaryQuery);
    const statusResult = await pool.query(statusQuery);
    const categoryResult = await pool.query(categoryQuery);
    const monthlyResult = await pool.query(monthlyQuery);

    return {
        summary: summaryResult.rows[0],
        status_summary: statusResult.rows,
        category_summary: categoryResult.rows,
        monthly_trend: monthlyResult.rows
    };
};


// USER DASHBOARD
const getUserDashboard = async (userId) => {

    const query = `
        SELECT
            COALESCE(SUM(CASE WHEN es.name = 'Approved' THEN e.amount ELSE 0 END),0) AS total_approved_amount,

            COUNT(CASE WHEN es.name = 'Submitted' THEN 1 END) AS pending_count,

            COALESCE(SUM(CASE WHEN es.name = 'Submitted' THEN e.amount ELSE 0 END),0) AS pending_amount

        FROM expenses e
        JOIN expense_status es ON es.id = e.status_id
        WHERE e.user_id = $1
    `;

    const monthlyQuery = `
        SELECT
            TO_CHAR(e.date,'YYYY-MM') AS month,
            COALESCE(SUM(CASE WHEN es.name = 'Approved' THEN e.amount ELSE 0 END),0) AS amount
        FROM expenses e
        JOIN expense_status es ON es.id = e.status_id
        WHERE e.user_id = $1
        GROUP BY month
        ORDER BY month
    `;

    const summary = await pool.query(query, [userId]);
    const monthly = await pool.query(monthlyQuery, [userId]);

    return {
        totals: summary.rows[0],
        monthly_summary: monthly.rows
    };
};

module.exports = {
    getAdminDashboard,
    getUserDashboard
};