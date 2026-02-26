const allowAdmin = (req, res, next) => {
    // Token must exist
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }

    // Role check (case already normalized in auth)
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access only'
        });
    }

    next();
};

module.exports = allowAdmin;