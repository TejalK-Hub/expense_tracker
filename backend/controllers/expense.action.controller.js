const service = require('../services/expense.action.service');

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
    updateStatus
};