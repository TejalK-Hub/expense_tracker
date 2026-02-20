const pool = require('../config/db');

const createExpense = async (data) => {
    const query = `
        INSERT INTO expenses
        (user_id, visit_id, date, category_id, amount, description, bill_path, status_id, receipt_id)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *;
    `;

    const values = [
        data.user_id,
        data.visit_id,
        data.date,
        data.category_id,
        data.amount,
        data.description,
        data.bill_path,
        2, // default status = Submitted
        data.receipt_id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};



const getExpensesByVisit = async (visitId) => {
    const query = `
        SELECT 
            e.id,
            e.date,
            e.amount,
            e.description,
            e.bill_path,
            e.receipt_id,
            ec.name AS category,
            es.name AS status
        FROM expenses e
        LEFT JOIN expense_category ec ON ec.id = e.category_id
        LEFT JOIN expense_status es ON es.id = e.status_id
        WHERE e.visit_id = $1
        ORDER BY e.date DESC
    `;

    const result = await pool.query(query, [visitId]);
    return result.rows;
};


const getUserExpenses = async (userId) => {
    const query = `
        SELECT 
            e.id,
            e.date,
            e.amount,
            e.description,
            e.bill_path,
            e.receipt_id,
            v.start_date,
            v.end_date,
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


const updateExpense = async (id, data) => {
    const query = `
        UPDATE expenses
        SET date = $1,
            category_id = $2,
            amount = $3,
            description = $4
        WHERE id = $5
        RETURNING *;
    `;

    const values = [
        data.date,
        data.category_id,
        data.amount,
        data.description,
        id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

module.exports = {
    createExpense,
    getExpensesByVisit,
    getUserExpenses,
    updateExpense
};