const express = require('express');

const router = express.Router();

const masterController = require('../controllers/master.controller');

router.get('/:type', masterController.getMasterData);

module.exports= router;

/*  NOTE : 
get/master/:type

eg : 
get/master/visit_reason
get/master/expense_category
get/master/expense_status
get/master/rejection_reason 

*/ 