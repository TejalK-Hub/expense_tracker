const pool = require('../config/db');


// ADMIN LIST ( Pending)

const getAllExpenses = async (filters) => {

    let conditions = [];
    let values = [];
    let index = 1;

    // APPLY STATUS FILTER ONLY IF NOT REVIEW MODE
    if (!filters.include_all && filters.status) {
    conditions.push(`LOWER(es.name) = $${index}`);
    values.push(filters.status.toLowerCase());
    index++;
    }

    // DEFAULT CURRENT MONTH (if not provided)
    const month = filters.month || new Date().toISOString().slice(0, 7);

    conditions.push(`TO_CHAR(e.date, 'YYYY-MM') = $${index}`);
    values.push(month);
    index++;

    if (filters.user_id) {

        if (Array.isArray(filters.user_id)) {
            conditions.push(`e.user_id = ANY($${index}::int[])`);
            values.push(filters.user_id);
        } else {
            conditions.push(`e.user_id = $${index}`);
            values.push(filters.user_id);
        }

        index++;
    }

    const whereClause = conditions.length
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

    const query = `
        SELECT 
            e.id,
            e.description AS expense,
            TO_CHAR(e.date,'YYYY-MM-DD') AS expense_date,
            e.receipt_id AS receipt,
            CONCAT('INR ', e.amount) AS amount,

            e.visit_id AS visit,
            v.visit_name,
            TO_CHAR(v.start_date,'YYYY-MM-DD') AS visit_start_date,
            TO_CHAR(v.end_date,'YYYY-MM-DD') AS visit_end_date,

            c.name AS client_name,
            c.id AS client_id,

            e.user_id,
            u.name AS user_name,

            TO_CHAR(e.created_at,'YYYY-MM-DD HH24:MI') AS created_at,


            e.bill_path,
            ec.name AS category,
            es.name AS status,

            approver.name AS approved_by,
            TO_CHAR(e.approved_at,'YYYY-MM-DD HH24:MI') AS approved_at,

            rr_data.rejection_reason_id,
            rr_data.rejection_reason

        FROM expenses e
        JOIN users u ON u.id = e.user_id
        JOIN visits v ON v.id = e.visit_id
        LEFT JOIN clients c ON c.id = v.client_id
        LEFT JOIN expense_category ec ON ec.id = e.category_id
        LEFT JOIN expense_status es ON es.id = e.status_id
        LEFT JOIN users approver ON approver.id = e.approved_by

        LEFT JOIN LATERAL (
            SELECT 
                esh.rejection_reason_id,
                rr.name AS rejection_reason
            FROM expense_status_history esh
            LEFT JOIN rejection_reason rr 
                ON rr.id = esh.rejection_reason_id
            WHERE esh.expense_id = e.id
            ORDER BY esh.changed_at DESC
            LIMIT 1
        ) rr_data ON TRUE

        ${whereClause}
        ORDER BY e.created_at DESC
    `;

    const result = await pool.query(query, values);
    return result.rows;
};




// ADMIN ACTION (Approve / Reject)

const updateExpenseStatus = async (expenseId, action, adminId, rejection_reason_id = null, rejection_description = null) => {

    //action = action.toLowerCase();

    let statusName;

    if (action === 'approve') statusName = 'Approved';
    else if (action === 'reject') statusName = 'Rejected';
    else throw new Error('Invalid action');

    if (action === 'reject' && !rejection_reason_id) {
        throw new Error('Rejection reason required');
    }

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

    // SELF APPROVAL RESTRICTION
    const expenseCheck = await pool.query(
        `SELECT user_id FROM expenses WHERE id = $1`,
        [expenseId]
    );

    if (!expenseCheck.rows.length) {
        throw new Error('Expense not found');
    }

    if (expenseCheck.rows[0].user_id === adminId) {
        throw new Error('Self approval not allowed');
    }

    const updateQuery = `
    UPDATE expenses
    SET 
        status_id = $1,
        approved_by = $2,
        approved_at = NOW(),
        rejection_description = $4
    WHERE id = $3
    RETURNING 
        id,
        status_id,
        approved_by,
        TO_CHAR(approved_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS approved_at,
        rejection_description
    `;

    const result = await pool.query(updateQuery, [
    status_id,           // $1
    adminId,             // $2
    expenseId,           // $3
    rejection_description || null // $4
    ]);

    if (!result.rows.length) {
        throw new Error('Expense not found');
    }

    const admin = await pool.query(
        `SELECT name FROM users WHERE id=$1`,
        [adminId]
    );

    result.rows[0].approved_by = admin.rows[0]?.name || null;

    if (action === 'reject') {

        await pool.query(`
            INSERT INTO expense_status_history
            (expense_id, status_id, rejection_reason_id, rejection_description, changed_by)
            VALUES ($1,$2,$3,$4,$5)
        `, [expenseId, status_id, rejection_reason_id, rejection_description || null, adminId]);

    }

    return result.rows[0];
};

module.exports = {
    getAllExpenses,
    updateExpenseStatus
};