const express = require('express');
const router = express.Router();

const controller = require('../controllers/master.controller');

//  auth 


const authMiddleware = require('../middleware/auth');

router.get('/:table', authMiddleware, controller.getAll);
router.get('/:table/:id', authMiddleware, controller.getOne);
router.post('/:table', authMiddleware, controller.create);
router.put('/:table/:id', authMiddleware, controller.update);
router.delete('/:table/:id', authMiddleware, controller.remove);

module.exports = router;
