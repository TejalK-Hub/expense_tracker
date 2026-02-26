const service = require('../services/expense.summary.service');

const getSummary = async (req, res) => {
    try {
        let { month } = req.query;

        // Normalize input
        if (month) {
            month = month.trim();
        }

        const data = await service.getMonthlySummary(month);

        res.json({
            success: true,
            data
        });

        //console.log('Month received:', month);

    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getSummary
};