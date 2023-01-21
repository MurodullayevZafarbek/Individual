const router = require('express').Router()
const { isAuth, roles } = require('../../middleware/front.mdl')



// ========================================== Statistika bo'limi ==========================================
router.get('/dashboard/general', isAuth, roles("seller"), async (req, res, next) => {
    res.render(
        "./components/seller/statistic/general.ejs",
        { layout: "./layouts/seller.ejs", title: "Sotuvchi" }
    )
})

// ========================================== Marketing ==========================================
router.get('/marketing/lid', isAuth, roles("seller"), async (req, res, next) => {
    res.render(
        "./components/seller/marketing/lid.ejs",
        { layout: "./layouts/seller.ejs", title: "Sotuvchi" }
    )
})
// ========================================== Boshqaruv ==========================================
router.get('/management/task', isAuth, roles("seller"), async (req, res, next) => {
    res.render(
        "./components/seller/managemant/task.ejs",
        { layout: "./layouts/seller.ejs", title: "Sotuvchi" }
    )
})
// ========================================== O`qituvchi yo'qlama ==========================================
router.get('/management/teacher', isAuth, roles("seller"), async (req, res, next) => {
    res.render(
        "./components/seller/managemant/attendanceStaff.ejs",
        { layout: "./layouts/seller.ejs", title: "Sotuvchi" }
    )
})
// ========================================== Sozlama ==========================================
router.get('/profile', isAuth, roles("seller"), async (req, res, next) => {
    res.render(
        "./components/seller/setting/user_profile.ejs",
        { layout: "./layouts/seller.ejs", title: "Sotuvchi" }
    )
})


module.exports = router;