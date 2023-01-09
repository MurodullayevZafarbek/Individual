const mongoose = require('mongoose')
const XLSX = require('xlsx')
const router = require('express').Router()
const DEMO = mongoose.model('test_demo', mongoose.Schema({
    name: { type: String, required: true }, // Foydalanuvchining ismi
    password: { type: String, required: true, },
    phone: { type: String, required: true, },
    role: { type: String, enum: ["manager", "admin", "mentor",], required: true, index: true },
    actions: { type: String, enum: ["active", "archive",], default: "active" }, // aktiv yoki arxiv(o'chirish) bolimiga qo'shish
    gender: { type: String, enum: ["man", "woman",] },
}, {
    timestamps: true
}))


router.post("/create", async (req, res) => {
    try {
        const workbook = XLSX.readFile("./public/demo.xlsx")
        const workSheet = workbook.Sheets[workbook.SheetNames[0]]

        const defaultCOunt = 7

        const all_data = defaultCOunt + 1
        const data = []
        for (let index = 2; index <= all_data; index++) {
            if (index) {
                const name = workSheet[`A${index}`]
                const password = workSheet[`B${index}`]
                const phone = workSheet[`C${index}`]
                const role = workSheet[`D${index}`]
                const actions = workSheet[`E${index}`]
                const gender = workSheet[`F${index}`]

                const users = new Object({
                    name: name.v,
                    password: password.v,
                    phone: phone.v,
                    role: role.v,
                    actions: actions.v,
                    gender: gender.v,
                })
                data.push(result)
            }
        }
        res.json(data)
    }
    catch (error) {
        if (error.message == "Cannot read properties of undefined (reading 'v')") {
            res.json({
                message: "Data count is not defined"
            })
        }

    }


})




module.exports = router











