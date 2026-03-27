const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {

    const authHeader = req.headers.authorization;

    // Check header exists
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'No token provided'
        });
    }

    // header Must start with Bearer
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Invalid authorization format'
        });
    }

    const token = authHeader.split(' ')[1];

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Normalize role
        let role = null;

        if (decoded.role) {
            role = String(decoded.role).toLowerCase();
        }

        req.user = {
            id: decoded.id,
            role: role
        };

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });

    }

};

module.exports = authMiddleware;