const visitService = require('../services/visits.service');

// GET ALL VISITS (generic)
const getVisits = async (req, res) => {
    try {
        const visits = await visitService.getVisits(req.user);

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

        const visit = await visitService.getVisitById(id, req.user);

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

const getSelfActiveVisits = async (req, res) => {
    try {
        const data = await visitService.getSelfActiveVisits(req.user);

        res.json({
            success: true,
            data
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};


// GET ACTIVE VISITS FOR DROPDOWN (ADMIN : ALL)
const getActiveVisits = async (req, res) => {
    try {

        const data = await visitService.getActiveVisitsByUser(req.user);

        res.json({
            success: true,
            data
        });

    } catch (error) {

        console.error('Get active visits error:', error);

        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });

    }
}; 

module.exports = {
    getVisits,
    getVisitById,
    getSelfActiveVisits,
    getActiveVisits
};