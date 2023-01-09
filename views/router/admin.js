const router = require('express').Router()
const { isAuth, roles } = require('../../middleware/front.mdl')



// ========================================== Statistika bo'limi ==========================================
router.get('/dashboard/general', isAuth, roles("admin"), async (req, res, next) => {
    res.render(
        "./components/admin/statistic/general.ejs",
        { layout: "./layouts/admin.ejs", title: "Adminstrator" }
    )
})

// ========================================== Boshqaruv ==========================================
router.get('/management/task', isAuth, roles("admin"), async (req, res, next) => {
    res.render(
        "./components/admin/management/task.ejs",
        { layout: "./layouts/admin.ejs", title: "Adminstrator" }
    )
})
router.get('/management/staff_attendance', isAuth, roles("admin"), async (req, res, next) => {
    res.render(
        "./components/admin/management/attendanceStaff.ejs",
        { layout: "./layouts/admin.ejs", title: "Adminstrator" }
    )
})
router.get('/management/pupil_attendance', isAuth, roles("admin"), async (req, res, next) => {
    res.render(
        "./components/admin/management/attendancePupil.ejs",
        { layout: "./layouts/admin.ejs", title: "Adminstrator" }
    )
})



// ========================================== Sozlamalar ==========================================
router.get('/archives', isAuth, roles("admin"), async (req, res, next) => {
    res.render(
        "./components/admin/setting/archives.ejs",
        { layout: "./layouts/admin.ejs", title: "Adminstrator" }
    )
})
router.get('/sms', isAuth, roles("admin"), async (req, res, next) => {
    res.render(
        "./components/admin/setting/sms.ejs",
        { layout: "./layouts/admin.ejs", title: "Adminstrator" }
    )
})
// ========================================== Moliya tizimi bilan ishlash ==========================================
router.get('/finance/debts', isAuth, roles("admin"), async (req, res, next) => {
    res.render(
        "./components/admin/finance/debts.ejs",
        { layout: "./layouts/admin.ejs", title: "Adminstrator" }
    )
})
router.get('/finance/salary', isAuth, roles("admin"), async (req, res, next) => {
    res.render(
        "./components/admin/finance/salary.ejs",
        { layout: "./layouts/admin.ejs", title: "Adminstrator" }
    )
})
router.get('/finance/income', isAuth, roles("admin"), async (req, res, next) => {
    res.render(
        "./components/admin/finance/income.ejs",
        { layout: "./layouts/admin.ejs", title: "Adminstrator" }
    )
})
router.get('/finance/general_debts', isAuth, roles("admin"), async (req, res, next) => {
    res.render(
        "./components/admin/finance/general_debts.ejs",
        { layout: "./layouts/admin.ejs", title: "Adminstrator" }
    )
})
// ========================================== Yuklamalar ==========================================
router.get('/uploads/filial', isAuth, roles("admin"), async (req, res, next) => {
    res.render(
        "./components/admin/uploads/filial.ejs",
        { layout: "./layouts/admin.ejs", title: "Adminstrator" }
    )
})
router.get('/uploads/group', isAuth, roles("admin"), async (req, res, next) => {
    res.render(
        "./components/admin/uploads/group.ejs",
        { layout: "./layouts/admin.ejs", title: "Adminstrator" }
    )
})
router.get('/uploads/schudule', isAuth, roles("admin"), async (req, res, next) => {
    res.render(
        "./components/admin/uploads/lesson_table.ejs",
        { layout: "./layouts/admin.ejs", title: "Adminstrator" }
    )
})
router.get('/uploads/room', isAuth, roles("admin"), async (req, res, next) => {
    res.render(
        "./components/admin/uploads/room.ejs",
        { layout: "./layouts/admin.ejs", title: "Adminstrator" }
    )
})

// ========================================== Marketing ==========================================
router.get('/marketing/lid', isAuth, roles("admin"), async (req, res, next) => {
    res.render(
        "./components/admin/marketing/lid.ejs",
        { layout: "./layouts/admin.ejs", title: "Adminstrator" }
    )
})
router.get('/marketing/lidVideo', isAuth, roles("admin"), async (req, res, next) => {
    res.render(
        "./components/admin/marketing/lidVideo.ejs",
        { layout: "./layouts/admin.ejs", title: "Adminstrator" }
    )
})

// ========================================== Foydalanuvchilar ==========================================
router.get('/user/student', isAuth, roles("admin"), async (req, res, next) => {
    res.render(
        "./components/admin/user/student.ejs",
        { layout: "./layouts/admin.ejs", title: "Adminstrator" }
    )
})


module.exports = router;