const router = require('express').Router()
const { isAuth, roles } = require('../../middleware/front.mdl')

// ========================================== Statistika bo'limi ==========================================
router.get('/dashboard/general', isAuth, roles("mentor"), async (req, res, next) => {
    res.render(
        "./components/mentor/statistic/general.ejs",
        { layout: "./layouts/mentor.ejs", title: "O'qituvchi" }
    )
})

// ========================================== Boshqaruv ==========================================
router.get('/management/task', isAuth, roles("mentor"), async (req, res, next) => {
    res.render(
        "./components/mentor/management/task.ejs",
        { layout: "./layouts/mentor.ejs", title: "O'qituvchi" }
    )
})
router.get('/management/pupil_attendance', isAuth, roles("mentor"), async (req, res, next) => {
    res.render(
        "./components/mentor/management/attendancePupil.ejs",
        { layout: "./layouts/mentor.ejs", title: "O'qituvchi" }
    )
})

// ========================================== Yuklamalar ==========================================
router.get('/uploads/filial', isAuth, roles("mentor"), async (req, res, next) => {
    res.render(
        "./components/mentor/uploads/filial.ejs",
        { layout: "./layouts/mentor.ejs", title: "O'qituvchi" }
    )
})
router.get('/uploads/schudule', isAuth, roles("mentor"), async (req, res, next) => {
    res.render(
        "./components/mentor/uploads/lesson_table.ejs",
        { layout: "./layouts/mentor.ejs", title: "O'qituvchi" }
    )
})

module.exports = router;