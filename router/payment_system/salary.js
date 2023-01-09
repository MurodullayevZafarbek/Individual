const express = require('express');
const router = express.Router()
const { checkRole, checkToken } = require('../../middleware/auth')
const controller = require('../../controller/payment_system/salary');

router.post('/1', controller.pay_salary_1);
router.post('/2', controller.pay_salary_2);
router.get('/all', controller.getAll);
router.get('/filter_by_year', controller.filterByYear);
router.get('/school/:id', controller.filterSchool);
router.get('/member/:id', controller.filterMember);
router.get('/:id', controller.getOne);
router.put('/:id', controller.updateOne);
router.delete('/:id', controller.deleteOne);

module.exports = router