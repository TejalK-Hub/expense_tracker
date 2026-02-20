const pool = require('../config/db');

const updateExpenseStatus = async (expenseId, action, rejection_reason_id = null) => {

    // Map action to status name
    let statusName;

    if (action === 'approve') statusName = 'Approved';
    else if (action === 'reject') statusName = 'Rejected';
    else throw new Error('Invalid action');

    // Get status_id
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

    // Update expense
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
    updateExpenseStatus
};