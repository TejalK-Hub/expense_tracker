const clientService = require('../services/client.service');

// -------------------------------- GET ALL --------------------------------

const getClients = async (req, res) => {

    try {

        const data = await clientService.getClients();

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

// -------------------------------- GET BY ID --------------------------------

const getClientById = async (req, res) => {

    try {

        const { id } = req.params;

        const data = await clientService.getClientById(id);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

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

// -------------------------------- CREATE --------------------------------

const createClient = async (req, res) => {

    try {

        const data = await clientService.createClient(
            req.body,
            req.user
        );

        res.status(201).json({
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

// -------------------------------- UPDATE --------------------------------

const updateClient = async (req, res) => {

    try {

        const { id } = req.params;

        const data = await clientService.updateClient(
            id,
            req.body
        );

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

// -------------------------------- DELETE --------------------------------

const deleteClient = async (req, res) => {

    try {

        const { id } = req.params;

        await clientService.deleteClient(
            id,
            req.user
        );

        res.json({
            success: true,
            message: 'Client deleted successfully'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

// -------------------------------- DISTINCT SITES --------------------------------

const getDistinctSites = async (req, res) => {

    try {

        const data = await clientService.getDistinctSites();

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

module.exports = {
    getClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
    getDistinctSites
};