const router = require('express').Router()
const { isAuth, roles } = require('../../middleware/front.mdl')



// ========================================== Statistika bo'limi ==========================================
router.get('/dashboard/general', isAuth, roles("manager"), async (req, res, next) => {
    res.render(
        "./components/manager/statistic/general.ejs",
        { layout: "./layouts/manager.ejs", title: "Statistika | Manager" }
    )
})
// ========================================== Yuklamalar ==========================================
router.get('/uploads/filial', isAuth, roles("manager"), async (req, res, next) => {
    res.render(
        "./components/manager/uploads/filial.ejs",
        { layout: "./layouts/manager.ejs", title: "O'quv markazlarlar bo'limi  | Manager" }
    )
})
router.get('/uploads/category', isAuth, roles("manager"), async (req, res, next) => {
    res.render(
        "./components/manager/uploads/category.ejs",
        { layout: "./layouts/manager.ejs", title: "Yo'nalish bo'limi | Manager" }
    )
})
router.get('/uploads/group', isAuth, roles("manager"), async (req, res, next) => {
    res.render(
        "./components/manager/uploads/group.ejs",
        { layout: "./layouts/manager.ejs", title: "Guruhlar bo'limi | Manager" }
    )
})
router.get('/uploads/schudule', isAuth, roles("manager"), async (req, res, next) => {
    res.render(
        "./components/manager/uploads/lesson_table.ejs",
        { layout: "./layouts/manager.ejs", title: "Dars jadvallari | Manager" }
    )
})
// ========================================== Moliya tizimi bilan ishlash ==========================================
router.get('/finance/debts', isAuth, roles("manager"), async (req, res, next) => {
    res.render(
        "./components/manager/finance/debts.ejs",
        { layout: "./layouts/manager.ejs", title: "Qarzdorlar bo'limi | Manager" }
    )
})
router.get('/finance/general_debts', isAuth, roles("manager"), async (req, res, next) => {
    res.render(
        "./components/manager/finance/general_debts.ejs",
        { layout: "./layouts/manager.ejs", title: "Qarzdor o'quvchilar | Manager" }
    )
})
router.get('/finance/salary', isAuth, roles("manager"), async (req, res, next) => {
    res.render(
        "./components/manager/finance/salary.ejs",
        { layout: "./layouts/manager.ejs", title: "Oylik maoshlar | Manager" }
    )
})
router.get('/finance/income', isAuth, roles("manager"), async (req, res, next) => {
    res.render(
        "./components/manager/finance/income.ejs",
        { layout: "./layouts/manager.ejs", title: "Tushumlar bo'limi | Manager" }
    )
})
// ========================================== Foydalanuvchilar ==========================================
router.get('/users/admin', isAuth, roles("manager"), async (req, res, next) => {
    res.render(
        "./components/manager/user/admin.ejs",
        { layout: "./layouts/manager.ejs", title: "Adminstratorlar bo'limi | Manager" }
    )
})
router.get('/users/mentor', isAuth, roles("manager"), async (req, res, next) => {
    res.render(
        "./components/manager/user/mentor.ejs",
        { layout: "./layouts/manager.ejs", title: "O'qituvchilar bo'limi | Manager" }
    )
})
router.get('/users/seller', isAuth, roles("manager"), async (req, res, next) => {
    res.render(
        "./components/manager/user/seller.ejs",
        { layout: "./layouts/manager.ejs", title: "Sotuvchilar bo'limi | Manager" }
    )
})
router.get('/users/student', isAuth, roles("manager"), async (req, res, next) => {
    res.render(
        "./components/manager/user/student.ejs",
        { layout: "./layouts/manager.ejs", title: "O'quvchilar bo'limi | Manager" }
    )
})
// ========================================== Marketing ==========================================

router.get('/marketing/lid', isAuth, roles("manager"), async (req, res, next) => {
    res.render(
        "./components/manager/marketing/lid.ejs",
        { layout: "./layouts/manager.ejs", title: "Lidlar bo'limi | Manager" }
    )
})
router.get('/marketing/lidVideo', isAuth, roles("manager"), async (req, res, next) => {
    res.render(
        "./components/manager/marketing/lidVideo.ejs",
        { layout: "./layouts/manager.ejs", title: "Ochiq darslar bo'limi | Manager" }
    )
})
// ==========================================  Boshqaruv bolimi  ==========================================

// 1. Vazifalar boyicha
router.get('/task/index', isAuth, roles("manager"), async (req, res, next) => {
    res.render(
        "./components/manager/management/task.ejs",
        { layout: "./layouts/manager.ejs", title: "Topshiriqlar bo'limi | Manager" }
    )
})
// 2. Xodimlar yo'qlamasi;
router.get('/attendance/staff', isAuth, roles("manager"), async (req, res, next) => {
    res.render(
        "./components/manager/management/attendanceStaff.ejs",
        { layout: "./layouts/manager.ejs", title: "Xodimlar yo'qlamasi bo'limi | Manager" }
    )
})
// 3. O'quvchilar yo'qlamasi
router.get('/attendance/pupil', isAuth, roles("manager"), async (req, res, next) => {
    res.render(
        "./components/manager/management/attendancePupil.ejs",
        { layout: "./layouts/manager.ejs", title: "O'quvchilar yo'qlamasi bo'limi | Manager" }
    )
})
// 4. Xonalar
router.get('/room', isAuth, roles("manager"), async (req, res, next) => {
    res.render(
        "./components/manager/management/room.ejs",
        { layout: "./layouts/manager.ejs", title: "O''quv markaz xonalari bo'limi | Manager" }
    )
})
// ========================================== Sozlamalar ==========================================
router.get('/profile', isAuth, roles("manager"), async (req, res, next) => {
    res.render(
        "./components/manager/setting/user_profile.ejs",
        { layout: "./layouts/manager.ejs", title: "Mening bo'limi | Manager" }
    )
})
router.get('/archives', isAuth, roles("manager"), async (req, res, next) => {
    res.render(
        "./components/manager/setting/archives.ejs",
        { layout: "./layouts/manager.ejs", title: "Arxivlar bo'limi | Manager" }
    )
})
router.get('/sms', isAuth, roles("manager"), async (req, res, next) => {
    res.render(
        "./components/manager/setting/sms.ejs",
        { layout: "./layouts/manager.ejs", title: "SMS bo'limi | Manager" }
    )
})

// ========================================== Anketa to'ldirish ==========================================
router.get('/form', isAuth, roles("manager"), async (req, res, next) => {
    res.render(
        "./components/manager/form/form.ejs",
        { layout: "./layouts/manager.ejs", title: "Anketa manzillari bo'limi | Manager" }
    )
})
router.get('/forms', isAuth, roles("manager"), async (req, res, next) => {
    res.render(
        "./components/manager/form/form_element.ejs",
        { layout: "./layouts/manager.ejs", title: "Anketalar bo'limi | Manager" }
    )
})


module.exports = router;