const { JsonWebTokenError } = require('jsonwebtoken');
const service = require('../services/expense.service');


const createExpense = async (req, res) => {
    try {
        const data = {
            ...req.body,
            bill_path: req.file ? req.file.path : null
        };

        const result = await service.createExpense(data);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'server error' });
    }
};

const getExpensesByVisit = async (req, res) => {
    try {
        const { visitId } = req.params;
        const data = await service.getExpensesByVisit(visitId);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};

const getUserExpenses = async (req, res) => {
    try {
        console.log("URL MIDDLEWARE ", req.user
        )
        const { id } = req.user;
        const data = await service.getUserExpenses(id);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};

const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await service.updateExpense(id, req.body);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false });
    }

    console.log('BODY:', req.body);
    console.log('FILE:', req.file);
};

module.exports = {
    createExpense,
    getExpensesByVisit,
    getUserExpenses,
    updateExpense
};