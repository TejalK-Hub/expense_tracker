const pool = require('../config/db');

const getAllExpenses = async () => {
    const query = `
        SELECT 
            e.id,
            e.date,
            e.amount,
            e.description,
            e.bill_path,
            e.receipt_id,

            u.name AS employee_name,

            v.start_date,
            v.end_date,

            vr.name AS visit_reason,
            ec.name AS category,
            es.name AS status

        FROM expenses e
        JOIN users u ON u.id = e.user_id
        JOIN visits v ON v.id = e.visit_id
        LEFT JOIN visit_reason vr ON vr.id = v.visit_reason_id
        LEFT JOIN expense_category ec ON ec.id = e.category_id
        LEFT JOIN expense_status es ON es.id = e.status_id

        ORDER BY e.created_at DESC
    `;

    const result = await pool.query(query);
    return result.rows;
};

module.exports = {
    getAllExpenses
};