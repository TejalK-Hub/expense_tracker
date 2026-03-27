const pool = require('../config/db'); 

// CREATE EXPENSE
const createExpense = async (data) => {

    if (!data.visit_id || !data.date || !data.category_id || !data.amount) {
        throw new Error('Missing required expense fields');
    }

    if (data.amount <= 0) {
        throw new Error('Amount must be greater than 0');
    }

    const visitCheck = await pool.query(
        `
        SELECT id, start_date, end_date, visit_name, client_id
        FROM visits
        WHERE id = $1
        AND user_id = $2
        AND deleted_on IS NULL
        `,
    [data.visit_id, data.user_id]
    );

    if (!visitCheck.rows.length) {
        console.log('VISIT CHECK:', data.visit_id, data.user_id, visitCheck.rows);
        throw new Error('Invalid visit for this user');
    }

    const visit = visitCheck.rows[0];

    // CATEGORY VALIDATION 
    const categoryCheck = await pool.query(
        `SELECT id FROM expense_category 
        WHERE id = $1 AND deleted_on IS NULL`,
        [data.category_id]
    );

    if (!categoryCheck.rows.length) {
    throw new Error('Invalid category selected');
    }

    const expenseDate = data.date;
    const visitStart = visit.start_date.toISOString().slice(0,10);
    const visitEnd = visit.end_date.toISOString().slice(0,10);

       

    if (expenseDate < visitStart || expenseDate > visitEnd) {
        throw new Error('Expense date must lie within visit duration');
    }

    const clientResult = await pool.query(
        `SELECT id, name FROM clients WHERE id = $1`,
        [visit.client_id]
    );

    const client = clientResult.rows[0] || {};

    const query = `
        INSERT INTO expenses
        (user_id, visit_id, date, category_id, amount, description, bill_path, status_id, receipt_id)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING 
            id,
            description AS expense,
            TO_CHAR(date,'YYYY-MM-DD') AS expense_date,
            receipt_id AS receipt,
            CONCAT('INR ', amount) AS amount,
            visit_id AS visit,
            category_id,
            status_id,
            bill_path,
            created_at
        `;

    const values = [
        data.user_id,
        data.visit_id,
        data.date,
        data.category_id,
        data.amount,
        data.description,
        data.bill_path,
        2,
        data.receipt_id
    ];

    const result = await pool.query(query, values);

    result.rows[0].visit_name = visit.visit_name;
    result.rows[0].visit_start_date = visit.start_date.toISOString().slice(0,10);
    result.rows[0].visit_end_date = visit.end_date.toISOString().slice(0,10);
    result.rows[0].client_name = client.name || null;
    result.rows[0].client_id = client.id || null;

    return result.rows[0];
};

// VISIT EXPENSES 
const getExpensesByVisit = async (visitId, userId) => {
    const query = `
        SELECT 
            e.id,
            e.description AS expense,
            TO_CHAR(e.date,'YYYY-MM-DD') AS expense_date,
            e.receipt_id AS receipt,
            CONCAT('INR ', e.amount) AS amount,
            e.visit_id AS visit,
            v.visit_name,
            v.start_date AS visit_start_date,
            v.end_date AS visit_end_date,
            c.name AS client_name,
            c.id AS client_id,
            TO_CHAR(e.created_at,'YYYY-MM-DD HH24:MI') AS created_at,
            e.bill_path,
            ec.name AS category,
            es.name AS status,
            approver.name AS approved_by,
            TO_CHAR(e.approved_at,'YYYY-MM-DD HH24:MI') AS approved_at
        FROM expenses e
        JOIN visits v ON v.id = e.visit_id
        LEFT JOIN clients c ON c.id = v.client_id
        LEFT JOIN expense_category ec ON ec.id = e.category_id
        LEFT JOIN expense_status es ON es.id = e.status_id
        LEFT JOIN users approver ON approver.id = e.approved_by
        WHERE e.visit_id = $1
        AND e.user_id = $2
        ORDER BY e.created_at DESC
    `;

    const result = await pool.query(query, [visitId, userId]);
    return result.rows;
};

// USER EXPENSE LIST
const getUserExpenses = async (userId) => {
    const query = `
        SELECT 
            e.id,
            e.description AS expense,
            TO_CHAR(e.date,'YYYY-MM-DD') AS expense_date,
            e.receipt_id AS receipt,
            CONCAT('INR ', e.amount) AS amount,
            e.visit_id AS visit,
            v.visit_name,
            v.start_date AS visit_start_date,
            v.end_date AS visit_end_date,
            c.name AS client_name,
            c.id AS client_id,
            TO_CHAR(e.created_at,'YYYY-MM-DD HH24:MI') AS created_at,
            e.bill_path,
            ec.name AS category,
            es.name AS status,
            approver.name AS approved_by,
            TO_CHAR(e.approved_at,'YYYY-MM-DD HH24:MI') AS approved_at
        FROM expenses e
        JOIN visits v ON v.id = e.visit_id
        LEFT JOIN clients c ON c.id = v.client_id
        LEFT JOIN expense_category ec ON ec.id = e.category_id
        LEFT JOIN expense_status es ON es.id = e.status_id
        LEFT JOIN users approver ON approver.id = e.approved_by
        WHERE e.user_id = $1
        AND LOWER(es.name) = 'submitted'
        AND TO_CHAR(e.date,'YYYY-MM') = TO_CHAR(CURRENT_DATE,'YYYY-MM')
        ORDER BY e.created_at DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
};

// UPDATE EXPENSE 
const updateExpense = async (id, userId, data) => {

    const checkQuery = `
        SELECT e.status_id, e.visit_id, v.start_date, v.end_date, v.visit_name, v.client_id
        FROM expenses e
        JOIN visits v ON v.id = e.visit_id
        WHERE e.id = $1
        AND e.user_id = $2
    `;

    const checkResult = await pool.query(checkQuery, [id, userId]);

    if (!checkResult.rows.length) {
        throw new Error('Expense not found or access denied');
    }

    const currentStatus = checkResult.rows[0].status_id;
    const visit = checkResult.rows[0];

    if (data.amount !== undefined && data.amount <= 0) {
        throw new Error('Amount must be greater than 0');
    }

    if (data.date !== undefined) {

    const expenseDate = data.date;
    const visitStart = visit.start_date.toISOString().slice(0,10);
    const visitEnd = visit.end_date.toISOString().slice(0,10);

    if (expenseDate < visitStart || expenseDate > visitEnd) {
        throw new Error('Expense date must be within visit period');
        }
    }

    if (currentStatus === 3) {
        throw new Error('Approved expense cannot be edited');
    }

    if (currentStatus === 4) {
        data.status_id = 2;
    }

    const fields = [];
    const values = [];
    let index = 1;

    if (data.date !== undefined) {
        fields.push(`date = $${index++}`);
        values.push(data.date);
    }

    if (data.category_id !== undefined) {
        fields.push(`category_id = $${index++}`);
        values.push(data.category_id);
    }

    if (data.amount !== undefined) {
        fields.push(`amount = $${index++}`);
        values.push(data.amount);
    }

    if (data.description !== undefined) {
        fields.push(`description = $${index++}`);
        values.push(data.description);
    }

    if (data.status_id !== undefined) {
        fields.push(`status_id = $${index++}`);
        values.push(data.status_id);
    }

    if (!fields.length) {
        throw new Error('No fields to update');
    }

    values.push(id);
    values.push(userId);

    const query = `
        UPDATE expenses
        SET ${fields.join(', ')}
        WHERE id = $${index++}
        AND user_id = $${index}
        RETURNING 
            id,
            description AS expense,
            TO_CHAR(date,'YYYY-MM-DD') AS expense_date,
            receipt_id AS receipt,
            CONCAT('INR ', amount) AS amount,
            visit_id AS visit,
            bill_path,
            status_id,
            created_at
    `;

    const result = await pool.query(query, values);

    const clientResult = await pool.query(
        `SELECT id, name FROM clients WHERE id = $1`,
        [visit.client_id]
    );

    const client = clientResult.rows[0] || {};

    result.rows[0].visit_name = visit.visit_name;
    result.rows[0].visit_start_date = visit.start_date.toISOString().slice(0,10);
    result.rows[0].visit_end_date = visit.end_date.toISOString().slice(0,10);
    result.rows[0].client_name = client.name || null;
    result.rows[0].client_id = client.id || null;

    return result.rows[0];
};

const getUserAllExpenses = async (userId) => {
    const query = `
        SELECT 
            e.id,
            e.description AS expense,
            TO_CHAR(e.date,'YYYY-MM-DD') AS expense_date,
            TO_CHAR(e.created_at,'YYYY-MM-DD HH24:MI') AS created_at,
            e.receipt_id AS receipt,
            CONCAT('INR ', e.amount) AS amount,

            e.visit_id AS visit,
            v.visit_name,
            TO_CHAR(v.start_date,'YYYY-MM-DD') AS visit_start_date,
            TO_CHAR(v.end_date,'YYYY-MM-DD') AS visit_end_date,

            c.name AS client_name,
            c.id AS client_id,

            ec.name AS category,
            es.name AS status,

            approver.name AS approved_by,
            TO_CHAR(e.approved_at,'YYYY-MM-DD HH24:MI') AS approved_at

        FROM expenses e
        JOIN visits v ON v.id = e.visit_id
        LEFT JOIN clients c ON c.id = v.client_id
        LEFT JOIN expense_category ec ON ec.id = e.category_id
        LEFT JOIN expense_status es ON es.id = e.status_id
        LEFT JOIN users approver ON approver.id = e.approved_by

        WHERE e.user_id = $1
        ORDER BY e.created_at DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
};

module.exports = {
    createExpense,
    getExpensesByVisit,
    getUserExpenses,
    updateExpense,
    getUserAllExpenses
};