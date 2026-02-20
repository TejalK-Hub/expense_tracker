const service = require('../services/master.service');

// GET ALL /data/:table
const getAll = async (req, res) => {
    try {
        const { table } = req.params;
        const data = await service.getAll(table);
        res.json({ success: true, data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// GET ONE (by id) /data/:table/:id
const getOne = async (req, res) => {
    try {
        const { table, id } = req.params;
        const data = await service.getById(table, id);
        res.json({ success: true, data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// POST /data/:table
const create = async (req, res) => {
    try {
        const { table } = req.params;
        const data = await service.create(table, req.body);
        res.json({ success: true, data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// PUT /data/:table/:id
const update = async (req, res) => {
    try {
        const { table, id } = req.params;
        const data = await service.update(table, id, req.body);
        res.json({ success: true, data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// DELETE /data/:table/:id  (soft delete)
const remove = async (req, res) => {
    try {
        const { table, id } = req.params;

        
        const deletedBy = 0;

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