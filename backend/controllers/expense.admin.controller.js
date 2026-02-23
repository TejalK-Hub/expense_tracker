const service = require('../services/expense.admin.service');

const getAllExpenses = async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            month: req.query.month
        };

        const data = await service.getAllExpenses(filters);
        res.json({ success: true, data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'server error' });
    }
};

module.exports = {
    getAllExpenses
};