const express = require('express');
const router = express.Router();

const masterController = require('../controllers/master.controller');
const authMiddleware = require('../middleware/auth');
const { allowAdmin } = require('../middleware/role');


// READ (Employee + Admin)

router.get('/:table', authMiddleware, masterController.getAll);
router.get('/:table/:id', authMiddleware, masterController.getOne);



// MODIFY (Admin only)

//create
router.post('/:table', authMiddleware, allowAdmin, masterController.create);

//update
router.put('/:table/:id', authMiddleware, allowAdmin, masterController.update);

//delete(soft)
router.delete('/:table/:id', authMiddleware, allowAdmin, masterController.remove);


module.exports = router;
