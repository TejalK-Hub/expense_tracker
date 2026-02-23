const pool = require('../config/db');

const getAllExpenses = async (filters) => {

    let conditions = [];
    let values = [];
    let index = 1;

    // Filter by status name 
    if (filters.status) {
        conditions.push(`es.name = $${index}`);
        values.push(filters.status);
        index++;
    }

    // Filter by month (year and month))
    if (filters.month) {
        conditions.push(`TO_CHAR(e.date, 'YYYY-MM') = $${index}`);
        values.push(filters.month);
        index++;
    }

    let whereClause = '';
    if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
    }

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
        ${whereClause}
        ORDER BY e.date DESC
    `;

    const result = await pool.query(query, values);
    return result.rows;
};

module.exports = {
    getAllExpenses
};