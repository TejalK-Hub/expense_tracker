const express = require('express');
const router = express.Router();

const controller = require('../controllers/master.controller');

// No auth 

router.get('/:table', controller.getAll);
router.get('/:table/:id', controller.getOne);
router.post('/:table', controller.create);
router.put('/:table/:id', controller.update);
router.delete('/:table/:id', controller.remove);

module.exports = router;
