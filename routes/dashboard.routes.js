const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboard.controller');
const auth = require('../middleware/auth');
const allowAdmin = require('../middleware/role');

// All dashboard APIs require token
router.use(auth);

// USER DASHBOARD
router.get('/user', controller.getUserDashboard);

// ADMIN DASHBOARD (restricted)
router.get('/admin', allowAdmin, controller.getAdminDashboard);

module.exports = router;