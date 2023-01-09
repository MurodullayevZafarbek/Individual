const express = require('express');
const router = express.Router()
const { checkRole, checkToken } = require('../middleware/auth')
const controller = require('../controller/search');

router.get('/user', controller.searchUser);
router.get('/by_billing', controller.searchUser_in_billings);

module.exports = router