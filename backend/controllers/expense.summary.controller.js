const service = require('../services/expense.summary.service');

const getSummary = async (req, res) => {
    try {

        if (req.user.role !== 'admin') {
            return res.status(403).json({
            success: false,
            message: 'Admin access only'
            });
        }
        const { month } = req.query;

        if (!month) {
            return res.status(400).json({
                success: false,
                message: 'month required (YYYY-MM)'
            });
        }

        const data = await service.getMonthlySummary(month);
        res.json({ success: true, data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
};

module.exports = { getSummary };