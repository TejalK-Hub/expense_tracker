const service = require('../services/master.service');

// GET ALL /internal/:table (GENERIC READ - ADMIN ONLY FOR VISITS, SELF FOR USERS)
const getAll = async (req, res) => {
    try {
        const { table } = req.params;

        // USERS READ CONTROL
        if (table === 'users') {
            const role = req.user?.role?.toLowerCase();

            if (role !== 'admin') {
                const data = await service.getById('users', req.user.id);
                return res.json({ success: true, data: [data] });
            }
        }

        // VISITS ACCESS CONTROL 
        // VISITS READ BLOCKED HERE , USE /visits APIs 
        if (table === 'visits') {
            const role = req.user?.role?.toLowerCase();

            if (role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Use /visits API for user-specific data'
                });
            }
        }

        const data = await service.getAll(table);
        res.json({ success: true, data });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// GET ONE (by id) /internal/:table/:id (GENERIC READ WITH ACCESS CONTROL)
const getOne = async (req, res) => {
    try {
        const { table, id } = req.params;

        // USERS READ CONTROL
        if (table === 'users') {
            const role = req.user?.role?.toLowerCase();

            if (role !== 'admin' && Number(id) !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }
        }

        // VISITS ACCESS CONTROL 
        if (table === 'visits') {
            const role = req.user?.role?.toLowerCase();

            if (role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Use /visits API for user-specific data'
                });
            }
        }

        const data = await service.getById(table, id);
        res.json({ success: true, data });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// POST /internal/:table (GENERIC CREATE - USED FOR VISITS & MASTER TABLES)
const create = async (req, res) => {
    try {
        const { table } = req.params;

        // MASTER TABLE ACCESS CONTROL 
        // MASTER TABLES ; WRITE ACCESS RESTRICTED TO ADMIN ONLY
        const MASTER_TABLES = [
            'clients',
            'visit_reason',
            'expense_category',
            'expense_status',
            'rejection_reason'
        ];

        const role = req.user?.role?.toLowerCase();

        if (MASTER_TABLES.includes(table) && role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin only resource'
            });
        }

        // created_by FROM TOKEN (ONLY WHERE COLUMN EXISTS)
        const CREATED_BY_TABLES = [
            'clients',
            'visit_reason',
            'expense_category'
        ];

        if (CREATED_BY_TABLES.includes(table)) {
            delete req.body.created_by; 
            req.body.created_by = req.user.id;
        }

        if (table === 'visits') {
            req.body.user_id = req.user.id;
        }

        const data = await service.create(table, req.body);
        res.json({ success: true, data });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// PUT /internal/:table/:id (GENERIC UPDATE - ADMIN CONTROLLED FOR MASTER TABLES)
const update = async (req, res) => {
    try {
        const { table, id } = req.params;

        // MASTER TABLE ACCESS CONTROL
        const MASTER_TABLES = [
            'clients',
            'visit_reason',
            'expense_category',
            'expense_status',
            'rejection_reason'
        ];

        const role = req.user?.role?.toLowerCase();

        if (MASTER_TABLES.includes(table) && role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin only resource'
            });
        }

        const data = await service.update(table, id, req.body);
        res.json({ success: true, data });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// DELETE /internal/:table/:id (SOFT DELETE - ADMIN CONTROLLED)
const remove = async (req, res) => {
    try {
        const { table, id } = req.params;

        // MASTER TABLE ACCESS CONTROL
        const MASTER_TABLES = [
            'clients',
            'visit_reason',
            'expense_category',
            'expense_status',
            'rejection_reason'
        ];

        const role = req.user?.role?.toLowerCase();

        // USERS DELETE RESTRICTION
        if (table === 'users' && role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin only resource'
            });
        }

        if (MASTER_TABLES.includes(table) && role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin only resource'
            });
        }

        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        const deletedBy = req.user.id;

        const data = await service.softDelete(table, id, deletedBy);

        res.json({ success: true, data });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAll,
    getOne,
    create,
    update,
    remove
};