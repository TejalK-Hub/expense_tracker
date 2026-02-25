const pool = require('../config/db');



// CREATE EXPENSE

const createExpense = async (data) => {
    const query = `
        INSERT INTO expenses
        (user_id, visit_id, date, category_id, amount, description, bill_path, status_id, receipt_id)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING 
            id,
            user_id,
            visit_id,
            TO_CHAR(date,'YYYY-MM-DD') AS date,
            CONCAT('INR ', amount) AS amount,
            description,
            bill_path,
            receipt_id,
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
        2, // Submitted
        data.receipt_id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};




// VISIT EXPENSES (USER SAFE)

const getExpensesByVisit = async (visitId, userId) => {
    const query = `
        SELECT 
            e.id,
            TO_CHAR(e.date,'YYYY-MM-DD') AS date,
            CONCAT('INR ', e.amount) AS amount,
            e.description,
            e.bill_path,
            e.receipt_id,
            ec.name AS category,
            es.name AS status
        FROM expenses e
        LEFT JOIN expense_category ec ON ec.id = e.category_id
        LEFT JOIN expense_status es ON es.id = e.status_id
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
            TO_CHAR(e.date,'YYYY-MM-DD') AS date,
            CONCAT('INR ', e.amount) AS amount,
            e.description,
            e.bill_path,
            e.receipt_id,
            TO_CHAR(v.start_date,'YYYY-MM-DD') AS start_date,
            TO_CHAR(v.end_date,'YYYY-MM-DD') AS end_date,
            ec.name AS category,
            es.name AS status
        FROM expenses e
        JOIN visits v ON v.id = e.visit_id
        LEFT JOIN expense_category ec ON ec.id = e.category_id
        LEFT JOIN expense_status es ON es.id = e.status_id
        WHERE e.user_id = $1
        ORDER BY e.date DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
};




// UPDATE EXPENSE 

const updateExpense = async (id, userId, data) => {

   
    const checkQuery = `
        SELECT status_id 
        FROM expenses 
        WHERE id = $1 AND user_id = $2
    `;

    const checkResult = await pool.query(checkQuery, [id, userId]);

    if (!checkResult.rows.length) {
        throw new Error('Expense not found or access denied');
    }

    const currentStatus = checkResult.rows[0].status_id;

    if (currentStatus === 3) {
        throw new Error('Approved expense cannot be edited');
    }

    // If rejected then resubmit
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
            TO_CHAR(date,'YYYY-MM-DD') AS date,
            CONCAT('INR ', amount) AS amount,
            description,
            bill_path,
            receipt_id,
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