const service = require('../services/expense.service');


// CREATE EXPENSE (user_id from token)
const createExpense = async (req, res) => {
    try {
        const data = {
            ...req.body,
            user_id: req.user.id,  
            bill_path: req.file ? req.file.path : null
        };

        const result = await service.createExpense(data);
        res.json({ success: true, data: result });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'server error' });
    }
};


// VISIT-WISE EXPENSES 
const getExpensesByVisit = async (req, res) => {
    try {
        const { visitId } = req.params;
        const userId = req.user.id;

        const data = await service.getExpensesByVisit(visitId, userId);
        res.json({ success: true, data });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
};


// USER EXPENSE LIST
const getUserExpenses = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await service.getUserExpenses(userId);

        res.json({ success: true, data });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
};


// UPDATE EXPENSE 
const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const data = await service.updateExpense(id, userId, req.body);

        res.json({ success: true, data });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = {
    createExpense,
    getExpensesByVisit,
    getUserExpenses,
    updateExpense
};