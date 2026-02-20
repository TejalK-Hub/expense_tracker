const service = require('../services/expense.admin.service');

const getAllExpenses = async (req, res) => {
    try {
        const data = await service.getAllExpenses();
        res.json({ success: true, data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'server error' });
    }
};

module.exports = {
    getAllExpenses
};