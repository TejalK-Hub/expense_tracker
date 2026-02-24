const service = require('../services/dashboard.service');

// USER DASHBOARD (no auth)
const getUserDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'user_id is required'
            });
        }

        const data = await service.getUserDashboard(userId);

        res.json({ success: true, data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'server error' });
    }
};

// ADMIN DASHBOARD
const getAdminDashboard = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
            success: false,
            message: 'Admin access only'
            });
        }

        const data = await service.getAdminDashboard();
        res.json({ success: true, data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'server error' });
    }
};

module.exports = {
    getUserDashboard,
    getAdminDashboard
};