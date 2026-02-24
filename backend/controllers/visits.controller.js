const visitService = require('../services/visits.service');

// GET ALL VISITS (generic)
const getVisits = async (req, res) => {
    try {
        const visits = await visitService.getVisits();

        res.json({
            success: true,
            data: visits
        });
    } catch (error) {
        console.error('Get visits error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};


// GET VISIT BY ID (generic)
const getVisitById = async (req, res) => {
    try {
        const { id } = req.params;

        const visit = await visitService.getVisitById(id);

        if (!visit) {
            return res.status(404).json({
                success: false,
                message: 'Visit not found'
            });
        }

        res.json({
            success: true,
            data: visit
        });
    } catch (error) {
        console.error('Get visit error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

module.exports = {
    getVisits,
    getVisitById
};