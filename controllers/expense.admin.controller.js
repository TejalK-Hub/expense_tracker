const service = require('../services/expense.admin.service');

const getAllExpenses = async (req, res) => {
    try {

        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access only'
            });
        }

        // HANDLE MULTI USER (array or single)
        let userIds = req.query.user_id;

        if (userIds) {
            userIds = Array.isArray(userIds) ? userIds : [userIds];
        }

        const filters = {
            status: req.query.status || 'submitted',
            month: req.query.month,
            user_id: userIds
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

        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access only'
            });
        }
        
        const { id } = req.params;
        const { action, rejection_reason_id, rejection_description } = req.body;

        // PASS ADMIN ID 
        const data = await service.updateExpenseStatus(
            id,
            action,
            req.user.id,
            rejection_reason_id,
            rejection_description
        );

        res.json({ success: true, data });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

//review 
const getAllExpensesReview = async (req, res) => {
    try {

        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access only'
            });
        }

        let userIds = req.query.user_id;

        if (userIds) {
            userIds = Array.isArray(userIds) ? userIds : [userIds];
        }

        const filters = {
            month: req.query.month,
            user_id: userIds,
            include_all: true 
        };

        const data = await service.getAllExpenses(filters);

        res.json({ success: true, data });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'server error' });
    }
};

module.exports = {
    getAllExpenses,
    updateStatus,
    getAllExpensesReview
};