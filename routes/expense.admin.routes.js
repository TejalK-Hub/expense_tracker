const express = require('express');
const router = express.Router();
const controller = require('../controllers/expense.admin.controller');
const auth = require('../middleware/auth');
const allowAdmin = require('../middleware/role');

// Admin routes require token
router.use(auth);
router.use(allowAdmin);

// Admin expense history (default : submitted ie: pending)
router.get('/all', controller.getAllExpenses);

//admin get all exp (no filters)
router.get('/all/full', controller.getAllExpensesFull);

//admin review (all status)
router.get('/review', controller.getAllExpensesReview);

// Approve / Reject
router.put('/:id/status', controller.updateStatus);

module.exports = router;