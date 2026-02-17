const masterService = require('../services/master.service');
// based on table name

// GET ALL
const getAll = async (req, res) => {
    try {
        const { table } = req.params;

        const data = await masterService.getAll(table);

        res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        console.error('Get Master Error:', error.message);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// GET ONE by id
const getOne = async (req, res) => {
    try {
        const { table, id } = req.params;

        const data = await masterService.getOne(table, id);

        res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        console.error('Get One Master Error:', error.message);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// CREATE
const create = async (req, res) => {
    try {
        const { table } = req.params;

        const data = await masterService.create(
            table,
            req.body,
            req.user.id
        );

        res.status(201).json({
            success: true,
            data
        });

    } catch (error) {
        console.error('Create Master Error:', error.message);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// UPDATE y id
const update = async (req, res) => {
    try {
        const { table, id } = req.params;

        const data = await masterService.update(
            table,
            id,
            req.body
        );

        res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        console.error('Update Master Error:', error.message);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// DELETE (Soft)
const remove = async (req, res) => {
    try {
        const { table, id } = req.params;

        const data = await masterService.remove(
            table,
            id,
            req.user.id
        );

        res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        console.error('Delete Master Error:', error.message);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    getAll,
    getOne,
    create,
    update,
    remove
};
