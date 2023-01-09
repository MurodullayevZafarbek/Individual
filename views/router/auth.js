const express = require('express');
const School = require('../../model/school')
const Forms = require('../../model/form/form')
const router = express()


router.get('/', async (req, res, next) => {
    res.render(
        "./components/auth/login.ejs",
        { layout: "./layouts/auth.ejs", title: "Kirish" }
    )
})


// Anketa to'ldirish uchun
router.get('/schools/forms/:school/:form', async (req, res, next) => {
    const { school, form } = req.params;
    if (!school || !form) res.render('./components/auth/404.ejs', { layout: "./layouts/auth.ejs", title: "404" })
    else {
        try {
            const roliks = await Forms.find({ _id: form }).lean()
            const schools = await School.find({ _id: school }).lean()
            if (roliks == "" || schools == "") res.render('./components/auth/404.ejs', { layout: "./layouts/auth.ejs", title: "404" })
            else {
                res.render(
                    "./components/auth/form.ejs",
                    { layout: "./layouts/auth.ejs", title: "Anketa to'ldirish" }
                )
            }
        }
        catch (error) {
            res.render('./components/auth/404.ejs', { layout: "./layouts/auth.ejs", title: "404" })
        }

    }
})
// Ochiq kursga yozilish uchun
router.get('/getme/:code/:open_course', async (req, res, next) => {
    const { code, open_course } = req.params;
    if (!code || !open_course) {
        res.render('./components/auth/404.ejs', { layout: "./layouts/auth.ejs", title: "404" })
    }
    else {
        const rolik = await Rolik.find({ _id: open_course }).lean()
        const school = await School.find({ subDomain: code }).lean()
        if (rolik == "" || school == "") {
            res.render('./components/auth/404.ejs', { layout: "./layouts/auth.ejs", title: "404" })
        }
        else {
            res.render(
                "./components/auth/lead/open_course_detail.ejs",
                { layout: "./layouts/auth.ejs", title: "Kursga yozilish" }
            )
        }
    }
})
router.get('/:code', async (req, res, next) => {
    const { code } = req.params;
    if (!code) {
        res.render('./components/auth/404.ejs', { layout: "./layouts/auth.ejs", title: "404" })
    } else {
        await School.find({ subDomain: code }).lean().exec((error, data) => {
            if (error) {
                res.render('./components/auth/404.ejs', { layout: "./layouts/auth.ejs", title: "404" })
            } else {
                res.render(
                    "./components/auth/lead/open_couses.ejs",
                    { layout: "./layouts/auth.ejs", title: "Ochiq darslar" }
                )
            }
        })
    }
})

module.exports = router;