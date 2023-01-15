const express = require('express');
const router = express.Router()
const { checkRole, checkToken } = require('../../middleware/auth')
const controller = require('../../controller/payment_system/needPayment');

router.post('/create', controller.createData);
router.get('/general', controller.generalBySchoolOrGroup); 
router.get('/school', controller.filter_by_school); // o'quv markaz boyicha qarzdorlarni olish
router.get('/group', controller.filter_by_group); // guruh boyicha qarzdorlarni olish
router.get('/by_user_and_date', controller.filter_by_user_and_month); // guser va oy boyicha 
router.get('/user/:id', controller.filter_by_user); // user o'ziga tegishli malumotni olish
router.get('/:id', controller.getOne);
router.put('/:id', controller.updateOne);
router.delete('/:id', controller.deleteOne);

module.exports = router