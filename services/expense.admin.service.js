const pool = require('../config/db');



// ADMIN LIST ( Pending)

const getAllExpenses = async (filters) => {

    let conditions = [];
    let values = [];
    let index = 1;

    // Status filter 
    if (filters.status) {
        conditions.push(`LOWER(es.name) = $${index}`);
        values.push(filters.status.toLowerCase());
        index++;
    }

    // Month filter
    if (filters.month) {
        conditions.push(`TO_CHAR(e.date, 'YYYY-MM') = $${index}`);
        values.push(filters.month);
        index++;
    }

    const whereClause = conditions.length
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

    const query = `
        SELECT 
            e.id,
            TO_CHAR(e.date, 'YYYY-MM-DD') AS date,
            CONCAT('INR ', e.amount) AS amount,
            e.description,
            e.bill_path,
            e.receipt_id,
            u.name AS employee_name,
            TO_CHAR(v.start_date, 'YYYY-MM-DD') AS visit_start_date,
            TO_CHAR(v.end_date, 'YYYY-MM-DD') AS visit_end_date,
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




// ADMIN ACTION (Approve / Reject)

const updateExpenseStatus = async (expenseId, action, adminId, rejection_reason_id = null) => {

  
    action = action.toLowerCase();

    let statusName;

    if (action === 'approve') statusName = 'Approved';
    else if (action === 'reject') statusName = 'Rejected';
    else throw new Error('Invalid action');

    // Get status id
    const statusQuery = `
        SELECT id 
        FROM expense_status
        WHERE LOWER(name) = LOWER($1)
        AND deleted_on IS NULL
    `;

    const statusResult = await pool.query(statusQuery, [statusName]);

    if (!statusResult.rows.length) {
        throw new Error('Status not found');
    }

    const status_id = statusResult.rows[0].id;

    // Update expense
    const updateQuery = `
        UPDATE expenses
        SET 
            status_id = $1,
            approved_by = $2,
            approved_at = NOW()
        WHERE id = $3
        RETURNING 
            id,
            status_id,
            TO_CHAR(approved_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS approved_at
    `;

    const result = await pool.query(updateQuery, [
        status_id,
        adminId,
        expenseId
    ]);

    if (!result.rows.length) {
        throw new Error('Expense not found');
    }

    return result.rows[0];
};

module.exports = {
    getAllExpenses,
    updateExpenseStatus
};