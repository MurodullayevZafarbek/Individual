const express = require('express');
const router = express.Router()
const { checkRole, checkToken } = require('../middleware/auth')
const controller = require('../controller/speciality');

router.post('/create', controller.createData);
router.get('/all', controller.getAll);
router.get('/filter/:id', controller.filterData);
router.get('/:id', controller.getOne);
router.put('/:id', controller.updateOne);
router.delete('/:id', controller.deleteOne);



module.exports = router