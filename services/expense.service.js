const pool = require('../config/db'); 



// CREATE EXPENSE

const createExpense = async (data) => {

    // validate visit belongs to same user
    const visitCheck = await pool.query(
        `
        SELECT id, start_date, end_date
        FROM visits
        WHERE id = $1
        AND user_id = $2
        `,
    [data.visit_id, data.user_id]
    );

    if (!visitCheck.rows.length) {
    throw new Error('Invalid visit for this user');
    }

    const visit = visitCheck.rows[0];

    const expenseDate = new Date(data.date);
    const visitStart = new Date(visit.start_date);
    const visitEnd = new Date(visit.end_date);

    if (expenseDate < visitStart || expenseDate > visitEnd) {
    throw new Error('Expense date must lie within visit duration');
    }

    
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
            bill_path,
            status_id
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
            e.bill_path,
            ec.name AS category,
            es.name AS status,
            approver.name AS approved_by,
            TO_CHAR(e.approved_at,'YYYY-MM-DD HH24:MI') AS approved_at
        FROM expenses e
        LEFT JOIN expense_category ec ON ec.id = e.category_id
        LEFT JOIN expense_status es ON es.id = e.status_id
        LEFT JOIN users approver ON approver.id = e.approved_by
        WHERE e.visit_id = $1
        AND e.user_id = $2
        ORDER BY e.date DESC
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
            e.bill_path,
            ec.name AS category,
            es.name AS status,
            approver.name AS approved_by,
            TO_CHAR(e.approved_at,'YYYY-MM-DD HH24:MI') AS approved_at
        FROM expenses e
        JOIN visits v ON v.id = e.visit_id
        LEFT JOIN expense_category ec ON ec.id = e.category_id
        LEFT JOIN expense_status es ON es.id = e.status_id
        LEFT JOIN users approver ON approver.id = e.approved_by
        WHERE e.user_id = $1
        ORDER BY e.date DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
};




// UPDATE EXPENSE 

const updateExpense = async (id, userId, data) => {

   
    const checkQuery = `
        SELECT e.status_id, e.visit_id, v.start_date, v.end_date
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

    if (data.date !== undefined) {

    const expenseDate = new Date(data.date);
    const startDate = new Date(visit.start_date);
    const endDate = new Date(visit.end_date);

    if (expenseDate < startDate || expenseDate > endDate) {
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
            status_id
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
};



module.exports = {
    createExpense,
    getExpensesByVisit,
    getUserExpenses,
    updateExpense
};