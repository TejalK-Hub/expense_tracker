const express = require('express');
const router = express.Router();

const masterController = require('../controllers/master.controller');

const authMiddleware = require('../middleware/auth');

const { allowAdmin } = require('../middleware/role');


// All master routes require login + Admin access
// only admin allowed
router.use(authMiddleware);
router.use(allowAdmin);


// GET all
router.get('/:table', masterController.getAll);

// GET one
router.get('/:table/:id', masterController.getOne);

// CREATE
router.post('/:table', masterController.create);

// UPDATE
router.put('/:table/:id', masterController.update);

// DELETE (soft)
router.delete('/:table/:id', masterController.remove);


module.exports = router;
