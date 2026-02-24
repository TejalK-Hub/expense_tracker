const express = require('express');
const router = express.Router();
const controller = require('../controllers/expense.admin.controller');
const auth = require('../middleware/auth');

// Admin routes require token
router.use(auth);

// Admin expense history
router.get('/all', controller.getAllExpenses);

// Approve / Reject
router.put('/:id/status', controller.updateStatus);

module.exports = router;