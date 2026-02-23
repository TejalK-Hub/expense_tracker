const pool = require('../config/db');

const getAllExpenses = async (filters) => {

    let conditions = [];
    let values = [];
    let index = 1;

    // Filter by status name 
    if (filters.status) {
        conditions.push(`LOWER(es.name) = $${index}`);
        values.push(filters.status.toLowerCase());
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
            to_char(e.date, 'YYYY-MM-DD') as date,
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

const updateExpenseStatus = async (expenseId, action, rejection_reason_id = null) => {

    let statusName;

    if (action === 'approve') statusName = 'Approved';
    else if (action === 'reject') statusName = 'Rejected';
    else throw new Error('Invalid action');

    const statusQuery = `
        SELECT id FROM expense_status
        WHERE name = $1
        AND deleted_on IS NULL
    `;

    const statusResult = await pool.query(statusQuery, [statusName]);

    if (statusResult.rows.length === 0) {
        throw new Error('Status not found');
    }

    const status_id = statusResult.rows[0].id;

    const updateQuery = `
        UPDATE expenses
        SET 
            status_id = $1,
            approved_by = 1,
            approved_at = NOW()
        WHERE id = $2
        RETURNING *;
    `;

    const result = await pool.query(updateQuery, [status_id, expenseId]);

    return result.rows[0];
};

module.exports = {
    getAllExpenses,
    updateExpenseStatus
};