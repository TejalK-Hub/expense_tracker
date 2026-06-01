const pool = require('../config/db'); 

// CREATE EXPENSE
const createExpense = async (data) => {

    data.visit_id = Number(data.visit_id);

    if (isNaN(data.visit_id)) {
        throw new Error('Invalid visit_id');
    }

    if (!data.receipt_id) {
        throw new Error('Receipt ID is required');
    }

    if (!Array.isArray(data.expense_items) || !data.expense_items.length){
        throw new Error('At least one expense item is required');
    }

    for (const item of data.expense_items){
        
        item.category_id = Number(item.category_id);
        item.amount = Number(item.amount);
        
        if (!item.category_id || !item.amount) {
            throw new Error('Each expense item must have category_id and amount');
        }

        if (item.amount <= 0) {
            throw new Error('Expense item amount must be greater than 0');
        }

        const categoryCheck = await pool.query(
            `
            SELECT id, name FROM expense_category
            WHERE id = $1 AND deleted_on IS NULL
            `,
            [item.category_id]
        )

        if (!categoryCheck.rows.length) {   
            throw new Error(`Invalid category_id ${item.category_id} in expense items`);
        }
    }

    const totalAmount = data.expense_items.reduce(
        (sum, item) => sum + Number(item.amount),
        0
    );

    // VISIT VALIDATION
    const visitCheck = await pool.query(
        `
        SELECT 
            id, 
            start_date, 
            end_date, 
            visit_name, 
            client_id
        FROM visits
        WHERE id = $1
        AND user_id = $2
        AND deleted_on IS NULL
        `,
        [data.visit_id, data.user_id]
    );

    if (!visitCheck.rows.length){
        throw new Error('Invalid visit_id for this user');
    }
    const visit = visitCheck.rows[0];

    // DATE VALIDATION 
    const expenseDate = new Date(data.date);
    const visitStart = new Date(visit.start_date);
    const visitEnd = new Date(visit.end_date);

    expenseDate.setHours(0,0,0,0);
    visitStart.setHours(0,0,0,0);
    visitEnd.setHours(0,0,0,0);

    if (expenseDate < visitStart || expenseDate> visitEnd) {
        throw new Error('Expense date must be within visit duration');
    }

    // CLIENT INFO (FOR RESPONSE ONLY)
    const clientResult = await pool.query(
        `SELECT id, name FROM clients WHERE id = $1`,
        [visit.client_id]
    )

    const client = clientResult.rows[0] || {};

    const expenseQuery = `
        INSERT INTO expenses
        (
            user_id, 
            visit_id, 
            date,
            amount, 
            description, 
            bill_paths, 
            status_id, 
            receipt_id
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7, $8)
        RETURNING *
    `;

    const expenseValues = [
        data.user_id,
        data.visit_id,
        data.date,
        totalAmount,
        data.description,
        data.bill_paths || [],
        2,
        data.receipt_id
    ]; 
    
    const expenseResult = await pool.query(expenseQuery, expenseValues);
    const expense = expenseResult.rows[0];

    for (const item of data.expense_items) {
        await pool.query(
            `
                INSERT INTO expense_items
                (
                    expense_id,
                    category_id,
                    amount
                )
                VALUES ($1,$2,$3)  
            `,
            [expense.id, item.category_id, item.amount]
        )
    }

    const itemsResult = await pool.query(
        `
        SELECT 
            ei.expense_id,
            ei.category_id,
            ec.name as category,
            ei.amount
        FROM expense_items ei
        JOIN expense_category ec 
            ON ec.id = ei.category_id
        WHERE ei.expense_id = $1
        `,
        [expense.id]
    );


    return {
        id: expense.id,
        expense: expense.description,
        expense_date: expense.date,
        amount: expense.amount,
        receipt: expense.receipt_id,
        visit: expense.visit_id,
        status_id: expense.status_id,
        bill_paths: expense.bill_paths || [],
        created_at: expense.created_at,

        visit_name: visit.visit_name,
        visit_start_date: visit.start_date.toISOString().slice(0,10),
        visit_end_date: visit.end_date.toISOString().slice(0,10),

        client_name: client.name || null,
        client_id: client.id || null,

        expense_items: itemsResult.rows
    };
};


// VISIT EXPENSES 
const getExpensesByVisit = async (visitId, userId) => {
    const query = `
        SELECT 
            e.id,
            e.description AS expense,
            TO_CHAR(e.date,'YYYY-MM-DD') AS expense_date,
            CONCAT('INR ', e.amount) AS amount,
            e.receipt_id AS receipt,
            e.visit_id AS visit,
            v.visit_name,
            v.start_date AS visit_start_date,
            v.end_date AS visit_end_date,
            c.name AS client_name,
            c.id AS client_id,
            TO_CHAR(e.created_at,'YYYY-MM-DD HH24:MI') AS created_at,
            e.bill_paths,
            es.name AS status,
            approver.name AS approved_by,
            TO_CHAR(e.approved_at,'YYYY-MM-DD HH24:MI') AS approved_at
        FROM expenses e
        JOIN visits v 
            ON v.id = e.visit_id
        LEFT JOIN clients c 
            ON c.id = v.client_id
        LEFT JOIN expense_status es 
            ON es.id = e.status_id
        LEFT JOIN users approver 
            ON approver.id = e.approved_by
        WHERE e.visit_id = $1
        AND e.user_id = $2
        AND e.deleted_on IS NULL
        ORDER BY e.created_at DESC
    `;

    const expenses = await pool.query(query, [visitId, userId]);
    expenses.rows = expenses.rows.map(r => ({
        ...r,
        bill_paths: r.bill_paths || []
    }));

    for (const expense of expenses.rows) {
        const item_result = `
            SELECT 
                ei.expense_id,
                ei.category_id,
                ec.name as category,
                ei.amount
            FROM expense_items ei
            JOIN expense_category ec 
                ON ec.id = ei.category_id
            WHERE ei.expense_id = $1
        `
        const itemsResult = await pool.query(item_result, [expense.id]);
        expense.expense_items = itemsResult.rows; 

    }
return expenses.rows;
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
            e.bill_paths,
            es.name AS status,
            approver.name AS approved_by,
            TO_CHAR(e.approved_at,'YYYY-MM-DD HH24:MI') AS approved_at
        FROM expenses e
        JOIN visits v 
            ON v.id = e.visit_id
        LEFT JOIN clients c 
            ON c.id = v.client_id
        LEFT JOIN expense_status es \
            ON es.id = e.status_id
        LEFT JOIN users approver 
            ON approver.id = e.approved_by
        WHERE e.user_id = $1
        AND LOWER(es.name) = 'submitted'
        AND e.deleted_on IS NULL
        ORDER BY e.created_at DESC
        `;
        // AND TO_CHAR(e.date,'YYYY-MM') = TO_CHAR(CURRENT_DATE,'YYYY-MM')

    const expenses = await pool.query(query, [userId]);
    expenses.rows = expenses.rows.map(r => ({
        ...r,
        bill_paths: r.bill_paths || []
    }));

    for (const expense of expenses.rows){
        const items_result = `
            SELECT 
                ei.expense_id,
                ec.name as category,
                ec.name as category,
                ei.amount   
            FROM expense_items ei
            JOIN expense_category ec 
                ON ec.id = ei.category_id
            WHERE ei.expense_id = $1
        `;

        const itemsResult = await pool.query(items_result, [expense.id]);
        expense.expense_items = itemsResult.rows;

    }

    return expenses.rows;
};

// UPDATE EXPENSE 
// const updateExpense = async (id, userId, data) => {

//     const checkQuery = `
//         SELECT 
//             e.status_id, 
//             e.visit_id, 
//             v.start_date, 
//             v.end_date, 
//             v.visit_name, 
//             v.client_id
//         FROM expenses e
//         JOIN visits v 
//             ON v.id = e.visit_id
//         WHERE e.id = $1
//         AND e.user_id = $2
//         AND e.deleted_on IS NULL
//     `;

//     const checkResult = await pool.query(checkQuery, [id, userId]);

//     if (!checkResult.rows.length) {
//         throw new Error('Expense not found or access denied');
//     }

//     const currentStatus = checkResult.rows[0].status_id;
//     const visit = checkResult.rows[0];

//     if (data.date !== undefined) {

//         const expenseDate = new Date(data.date);
//         const visitStart = new Date(visit.start_date);
//         const visitEnd = new Date(visit.end_date);

//         expenseDate.setHours(0,0,0,0);
//         visitStart.setHours(0,0,0,0);
//         visitEnd.setHours(0,0,0,0);

//         if (expenseDate < visitStart || expenseDate > visitEnd) {
//             throw new Error('Expense date must be within visit period');
//             }
//     }

//     if (currentStatus === 3) {
//         throw new Error('Approved expense cannot be edited');
//     }

//     if (currentStatus === 4) {
//         data.status_id = 2;
//     }

//     const fields = [];
//     const values = [];
//     let index = 1;

//     if (data.date !== undefined) {
//         fields.push(`date = $${index++}`);
//         values.push(data.date);
//     }

//     if (data.amount !== undefined) {
//         fields.push(`amount = $${index++}`);
//         values.push(data.amount);
//     }

//     if (data.description !== undefined) {
//         fields.push(`description = $${index++}`);
//         values.push(data.description);
//     }

//     if (data.status_id !== undefined) {
//         fields.push(`status_id = $${index++}`);
//         values.push(data.status_id);
//     }

//     if (data.bill_paths !== undefined) {
//         fields.push(`bill_paths = $${index++}`);
//         values.push(data.bill_paths);
//     }

//     if (!fields.length) {
//         throw new Error('No fields to update');
//     }

//     values.push(id);
//     values.push(userId);

//     const query = `
//         UPDATE expenses
//         SET ${fields.join(', ')}
//         WHERE id = $${index++}
//         AND user_id = $${index}
//         RETURNING 
//             id,
//             description AS expense,
//             TO_CHAR(date,'YYYY-MM-DD') AS expense_date,
//             receipt_id AS receipt,
//             CONCAT('INR ', amount) AS amount,
//             visit_id AS visit,
//             bill_paths,
//             status_id,
//             created_at
//     `;

//     const result = await pool.query(query, values);
//     result.rows[0].bill_paths = result.rows[0].bill_paths || [];

//     const clientResult = await pool.query(
//         `SELECT id, name FROM clients WHERE id = $1`,
//         [visit.client_id]
//     );

//     const client = clientResult.rows[0] || {};

//     result.rows[0].visit_name = visit.visit_name;
//     result.rows[0].visit_start_date = visit.start_date.toISOString().slice(0,10);
//     result.rows[0].visit_end_date = visit.end_date.toISOString().slice(0,10);
//     result.rows[0].client_name = client.name || null;
//     result.rows[0].client_id = client.id || null;

//     return result.rows[0];
// };


// UPDATE EXPENSE
const updateExpense = async (id, userId, data) => {

    const checkQuery = `
        SELECT
            e.status_id,
            e.visit_id,
            v.start_date,
            v.end_date,
            v.visit_name,
            v.client_id
        FROM expenses e
        JOIN visits v ON v.id = e.visit_id
        WHERE e.id = $1
        AND e.user_id = $2
        AND e.deleted_on IS NULL
    `;

    const checkResult = await pool.query(checkQuery, [id, userId]);

    if (!checkResult.rows.length) {
        throw new Error('Expense not found or access denied');
    }

    const currentStatus = checkResult.rows[0].status_id;
    const visit = checkResult.rows[0];

    if (currentStatus === 3) {
        throw new Error('Approved expense cannot be edited');
    }

    if (!Array.isArray(data.expense_items) || !data.expense_items.length) {
        throw new Error('At least one expense item is required');
    }

    for (const item of data.expense_items) {

        item.category_id = Number(item.category_id);
        item.amount = Number(item.amount);

        if (!item.category_id || !item.amount) {
            throw new Error(
                'Each expense item must have category_id and amount'
            );
        }

        if (item.amount <= 0) {
            throw new Error(
                'Expense item amount must be greater than 0'
            );
        }

        const categoryCheck = await pool.query(
            `
            SELECT id
            FROM expense_category
            WHERE id = $1
            AND deleted_on IS NULL
            `,
            [item.category_id]
        );

        if (!categoryCheck.rows.length) {
            throw new Error(
                `Invalid category_id ${item.category_id}`
            );
        }
    }

    const totalAmount = data.expense_items.reduce(
        (sum, item) => sum + Number(item.amount),
        0
    );

    if (data.date !== undefined) {

        const expenseDate = new Date(data.date);
        const visitStart = new Date(visit.start_date);
        const visitEnd = new Date(visit.end_date);

        expenseDate.setHours(0, 0, 0, 0);
        visitStart.setHours(0, 0, 0, 0);
        visitEnd.setHours(0, 0, 0, 0);

        if (expenseDate < visitStart || expenseDate > visitEnd) {
            throw new Error(
                'Expense date must be within visit period'
            );
        }
    }

    await pool.query('BEGIN');

    try {

        const fields = [];
        const values = [];
        let index = 1;

        if (data.date !== undefined) {
            fields.push(`date = $${index++}`);
            values.push(data.date);
        }

        if (data.receipt_id !== undefined) {
            fields.push(`receipt_id = $${index++}`);
            values.push(data.receipt_id);
        }

        if (data.description !== undefined) {
            fields.push(`description = $${index++}`);
            values.push(data.description);
        }

        if (data.bill_paths !== undefined) {
            fields.push(`bill_paths = $${index++}`);
            values.push(data.bill_paths);
        }

        fields.push(`amount = $${index++}`);
        values.push(totalAmount);

        if (currentStatus === 4) {
            fields.push(`status_id = $${index++}`);
            values.push(2);
        }

        values.push(id);
        values.push(userId);

        const updateQuery = `
            UPDATE expenses
            SET ${fields.join(', ')}
            WHERE id = $${index++}
            AND user_id = $${index}
            RETURNING *
        `;

        const expenseResult = await pool.query(
            updateQuery,
            values
        );

        await pool.query(
            `
            DELETE FROM expense_items
            WHERE expense_id = $1
            `,
            [id]
        );

        for (const item of data.expense_items) {
            await pool.query(
                `
                INSERT INTO expense_items
                (
                    expense_id,
                    category_id,
                    amount
                )
                VALUES ($1,$2,$3)
                `,
                [
                    id,
                    item.category_id,
                    item.amount
                ]
            );
        }

        const itemsResult = await pool.query(
            `
            SELECT
                ei.id,
                ei.category_id,
                ec.name AS category,
                ei.amount
            FROM expense_items ei
            JOIN expense_category ec
            ON ec.id = ei.category_id
            WHERE ei.expense_id = $1
            `,
            [id]
        );

        await pool.query('COMMIT');

        const expense = expenseResult.rows[0];

        expense.bill_paths = expense.bill_paths || [];

        const clientResult = await pool.query(
            `
            SELECT id, name
            FROM clients
            WHERE id = $1
            `,
            [visit.client_id]
        );

        const client = clientResult.rows[0] || {};

        return {
            id: expense.id,
            expense: expense.description,
            expense_date: expense.date,
            amount: expense.amount,
            receipt: expense.receipt_id,
            visit: expense.visit_id,
            status_id: expense.status_id,
            bill_paths: expense.bill_paths,
            created_at: expense.created_at,

            visit_name: visit.visit_name,
            visit_start_date: visit.start_date
                .toISOString()
                .slice(0, 10),
            visit_end_date: visit.end_date
                .toISOString()
                .slice(0, 10),

            client_name: client.name || null,
            client_id: client.id || null,

            expense_items: itemsResult.rows
        };

    } catch (error) {

        await pool.query('ROLLBACK');
        throw error;
    }
};

// soft delete self expenses (only pending)
const deleteExpense = async (expenseId, userId) => {

    const checkQuery = `
        SELECT id
        FROM expenses
        WHERE id = $1
        AND user_id = $2
        AND deleted_on IS NULL
        AND approved_by IS NULL
        AND approved_at IS NULL
    `;

    const check = await pool.query(checkQuery, [expenseId, userId]);

    if (!check.rows.length) {
        throw new Error('Expense cannot be deleted');
    }

    const deleteQuery = `
        UPDATE expenses
        SET deleted_on = NOW(),
            deleted_by = $2
        WHERE id = $1
        RETURNING id
    `;

    const result = await pool.query(deleteQuery, [expenseId, userId]);

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
            e.bill_paths,
            CONCAT('INR ', e.amount) AS amount,

            e.visit_id AS visit,
            v.visit_name,
            TO_CHAR(v.start_date,'YYYY-MM-DD') AS visit_start_date,
            TO_CHAR(v.end_date,'YYYY-MM-DD') AS visit_end_date,

            c.name AS client_name,
            c.id AS client_id,

            es.name AS status,

            approver.name AS approved_by,
            TO_CHAR(e.approved_at,'YYYY-MM-DD HH24:MI') AS approved_at,

            rr_data.rejection_reason_id,
            rr_data.rejection_reason

        FROM expenses e
        JOIN visits v 
            ON v.id = e.visit_id
        LEFT JOIN clients c 
            ON c.id = v.client_id
        LEFT JOIN expense_status es 
            ON es.id = e.status_id
        LEFT JOIN users approver 
            ON approver.id = e.approved_by

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

        WHERE e.user_id = $1
        AND e.deleted_on IS NULL
        ORDER BY e.created_at DESC
    `;

    const expenses = await pool.query(query, [userId]);
    expenses.rows = expenses.rows.map(r => ({
    ...r,
    bill_paths: r.bill_paths || []
}));

for (const expense of expenses.rows){
    const items_result = `
        SELECT 
            ei.expense_id,
            ei.category_id,
            ec.name as category,
            ei.amount
        FROM expense_items ei
        JOIN expense_category ec 
            ON ei.category_id = ec.id
        WHERE ei.expense_id = $1
    `;

    const itemsResult = await pool.query(items_result, [expense.id]);
    expense.expense_items = itemsResult.rows;
}

    return expenses.rows;
};

const getUserMonthlySummary = async (userId) => {

    const query = `
        SELECT 
            COUNT(*) AS total_expenses,
            COALESCE(SUM(amount),0) AS total_amount
        FROM expenses
        WHERE user_id = $1
        AND deleted_on IS NULL
        AND TO_CHAR(date, 'YYYY-MM') = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
    `;

    const result = await pool.query(query, [userId]);

    return {
        total_expenses: Number(result.rows[0].total_expenses),
        total_amount: Number(result.rows[0].total_amount)
    };
};

module.exports = {
    createExpense,
    getExpensesByVisit,
    getUserExpenses,
    updateExpense,
    deleteExpense,
    getUserAllExpenses,
    getUserMonthlySummary
};