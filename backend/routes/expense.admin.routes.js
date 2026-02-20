const express = require('express');
const router = express.Router();
const controller = require('../controllers/expense.admin.controller');

// Admin expense history
router.get('/all', controller.getAllExpenses);

module.exports = router;