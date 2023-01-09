const express = require('express');
const router = express.Router()
const { checkRole, checkToken } = require('../middleware/auth')
const controller = require('../controller/analitic');

router.get('/users', controller.getAllUsers);
router.get('/groups', controller.getGroups);
router.get('/schools', controller.getSchools);
router.get('/leads', controller.getLeads);
router.get('/by_category', controller.getStudentByCategory);
router.get('/by_categories', controller.getStudentByCategories);
router.get('/mentor_student', controller.mentorOwnStudent);

module.exports = router