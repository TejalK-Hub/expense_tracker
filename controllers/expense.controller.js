const service = require('../services/expense.service');


// CREATE EXPENSE (user_id from token)
const createExpense = async (req, res) => {
    try {
        const data = {
            ...req.body,
            user_id: req.user.id,  
            bill_paths: req.files ? req.files.map(f => f.path) : []
        };

        const result = await service.createExpense(data);
        console.log('REQ BODY:', req.body);
        res.json({ success: true, data: result });

    } catch (error) {
        console.error(error);
        res.status(400).json({
        success: false,
        message: error.message
        });
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
        res.status(400).json({
        success: false,
        message: error.message
        });
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
        res.status(400).json({
        success: false,
        message: error.message
        });
    }
};


// UPDATE EXPENSE 
const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const payload = {
            ...req.body,
            bill_paths: req.files ? req.files.map(f => f.path) : undefined
        };

const data = await service.updateExpense(id, userId, payload);

        res.json({ success: true, data });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getUserAllExpenses = async (req, res) => {
    try {
        const userId = req.user.id;

        const data = await service.getUserAllExpenses(userId);

        res.json({ success: true, data });

    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getUserMonthlySummary = async (req, res) => {
    try {
        const userId = req.user.id;

        const data = await service.getUserMonthlySummary(userId);

        res.json({
            success: true,
            data
        });

    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createExpense,
    getExpensesByVisit,
    getUserExpenses,
    updateExpense,
    getUserAllExpenses,
    getUserMonthlySummary
};