const express = require('express');
const router = express.Router();
const controller = require('../controllers/expense.summary.controller');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', controller.getSummary);

module.exports = router;