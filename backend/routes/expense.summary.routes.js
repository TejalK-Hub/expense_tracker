const express = require('express');
const router = express.Router();
const controller = require('../controllers/expense.summary.controller');

router.get('/', controller.getSummary);

module.exports = router;