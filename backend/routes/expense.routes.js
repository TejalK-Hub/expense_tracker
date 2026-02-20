const express = require('express');
const router = express.Router();
const controller = require('../controllers/expense.controller');
const multer = require('multer');
const path = require('path');

// Storage config 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// USER APIs
router.post('/', upload.single('bill'), controller.createExpense);
router.get('/visit/:visitId', controller.getExpensesByVisit);
router.get('/user', controller.getUserExpenses);
router.put('/:id', controller.updateExpense);

module.exports = router;