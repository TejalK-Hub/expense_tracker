const service = require('../services/expense.admin.service');

const getAllExpenses = async (req, res) => {
    try {
        const filters = {
            status: req.query.status || 'submitted',
            month: req.query.month
        };

        const data = await service.getAllExpenses(filters);
        res.json({ success: true, data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'server error' });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, rejection_reason_id } = req.body;

        const data = await service.updateExpenseStatus(id, action, rejection_reason_id);

        res.json({ success: true, data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllExpenses, updateStatus
};