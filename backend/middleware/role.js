const allowAdmin = (req, res, next) => {
    // Check if auth middleware run 
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }

    // Check role
    if (req.user.role !== 'Admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access only'
        });
    }

    next();
};

module.exports = {
    allowAdmin
};
