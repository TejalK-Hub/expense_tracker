const express = require('express');
const router = express.Router();

const controller = require('../controllers/dashboard.controller');

// USER DASHBOARD
router.get('/user', controller.getUserDashboard);

// ADMIN DASHBOARD
router.get('/admin', controller.getAdminDashboard);

module.exports = router;