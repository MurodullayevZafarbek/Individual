const router = require('express').Router()
const { isAuth, roles } = require('../../middleware/front.mdl')

// Statistika bo'limi
router.get('/dashboard/general', isAuth, roles("super_admin"), async (req, res, next) => {
    res.render(
        "./components/super_admin/statistic/general.ejs",
        { layout: "./layouts/superAdmin.ejs", title: "Super admin" }
    )
})

// Sozlamalar
router.get('/profile',  isAuth, roles("super_admin"), async  (req, res, next) => {
    res.render(
        "./components/super_admin/setting/user_profile.ejs",
       { layout: "./layouts/superAdmin.ejs" , title: "Super Admin"}
    )
})

// Hududlar
router.get('/region',  isAuth, roles("super_admin"), async  (req, res, next) => {
    res.render(
        "./components/super_admin/address/region.ejs",
       { layout: "./layouts/superAdmin.ejs" , title: "Super Admin"}
    )
})
router.get('/district',  isAuth, roles("super_admin"), async  (req, res, next) => {
    res.render(
        "./components/super_admin/address/district.ejs",
       { layout: "./layouts/superAdmin.ejs" , title: "Super Admin"}
    )
})

// Yuklamalar
router.get('/category',  isAuth, roles("super_admin"), async  (req, res, next) => {
    res.render(
        "./components/super_admin/uploads/category.ejs",
       { layout: "./layouts/superAdmin.ejs" , title: "Super Admin"}
    )
})
router.get('/speciality',  isAuth, roles("super_admin"), async  (req, res, next) => {
    res.render(
        "./components/super_admin/uploads/speciality.ejs",
       { layout: "./layouts/superAdmin.ejs" , title: "Super Admin"}
    )
})
router.get('/level',  isAuth, roles("super_admin"), async  (req, res, next) => {
    res.render(
        "./components/super_admin/uploads/level.ejs",
       { layout: "./layouts/superAdmin.ejs" , title: "Super Admin"}
    )
})


// Foydalanuvchilar

router.get('/users/manager',  isAuth, roles("super_admin"), async  (req, res, next) => {
    res.render(
        "./components/super_admin/user/manager.ejs",
       { layout: "./layouts/superAdmin.ejs" , title: "Super Admin"}
    )
})


// Sozlamalar
router.get('/archives',  isAuth, roles("super_admin"), async  (req, res, next) => {
    res.render(
        "./components/super_admin/setting/archives.ejs",
       { layout: "./layouts/superAdmin.ejs" , title: "Super Admin"}
    )
})






module.exports = router;