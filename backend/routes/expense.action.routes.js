const express = require('express');
const router = express.Router();
const controller = require('../controllers/expense.action.controller');

router.put('/:id/status', controller.updateStatus);

module.exports = router;