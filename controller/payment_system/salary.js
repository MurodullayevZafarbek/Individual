const Salary = require("../../model/payment_system/salary");
const Income = require("../../model/payment_system/income");
const School = require("../../model/school");
const User = require("../../model/user");
const Group = require("../../model/group");
const NeedPayment = require("../../model/payment_system/needPayment");
const MyClass = require('../../config/class')
const asyncHandler = require('../../middleware/async');
const ObjectId = require('mongodb').ObjectId;
const { smsSend } = require("../../config/sms")
const axios = require('axios')
const config = require('../../config/default')

// @description: O'qituvchining umumiy guruhlar to'liq to'lov qiganidan keyin oylik chiqarish
exports.pay_salary_0 = asyncHandler(async (req, res, next) => {
    const { school, member, month, year, payment_system } = req.body;
    // Malumotlar qayta kiritilgan yoki yo'qligini hisoblash
    if (school == "" || member == "" || month == "" || year == "" || payment_system == "") {
        res.json({
            success: false,
            message: "Ma'lumotlarni to'liq kiriting"
        })
    }
    else {
        // Bir xil to'lovni qayta qilib qo'ymasligi uchun tekshirish
        const check = await Salary.find({
            $and: [
                { school: { $eq: school } },
                { member: { $eq: member } },
                { month: { $eq: month } },
                { year: { $eq: year } },
            ]
        })
        if (check.length >= 1) {
            res.json({
                success: false,
                message: "Maosh to'langan. Qaytadan tekshiring"
            })
        }
        else {
            // Xodimga maosh belgilangan yoki yoqligini tasdiqlash
            const user = await User.findById({ _id: member })
            if (user.salary.status == "0") {
                res.json({
                    success: false,
                    message: "Xodim uchun hali maosh belgilanmagan"
                })
            }
            if (user.salary.status == "1") {
                const memberGroup = user.group // [ "groupID", "groupID", "groupID" ]
                const staff_side = user.salary.percenteage.staff_side
                const school_side = user.salary.percenteage.school_side
                const per_person = user.salary.per_person
                const default_salary = user.salary.default_salary

                // Foizda hodimlarga maosh chiqarish
                if (per_person === "0" && default_salary === "0") {
                    const salary = await Income.aggregate([
                        { $match: { $and: [{ month: { $eq: month } }, { group: { $in: memberGroup } }] } },
                        { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "members" } },
                        { $lookup: { from: "groups", localField: "group", foreignField: "_id", as: "groups" } },
                        { $project: { "members.name": 1, "groups.name": 1, "groups._id": 1, month: 1, year: 1, amount: 1, reminderSumm: 1, } },
                        {
                            $facet: {
                                // O'quvchilar to'lagan summalar
                                "default": [
                                    {
                                        $group: {
                                            _id: null,
                                            PAID_MONEY: { $sum: { $toInt: "$amount" } },
                                            REMINDER_MONEY: { $sum: { $toInt: "$reminderSumm" } },

                                        },
                                    },
                                    {
                                        $addFields: {
                                            TOTAL_GROUP_MONEY: { $add: [{ $sum: "$PAID_MONEY" }, { $sum: "$REMINDER_MONEY" }] },
                                            SCHOOL_SIDE: {
                                                $cond: [
                                                    {
                                                        $eq: [{ $add: [{ $sum: "$PAID_MONEY" }, { $sum: "$REMINDER_MONEY" }] }, 0]
                                                    },
                                                    0,
                                                    {
                                                        $multiply: [{ $add: [{ $sum: "$PAID_MONEY" }, { $sum: "$REMINDER_MONEY" }] }, { $divide: [parseInt(school_side), 100] }]
                                                    },
                                                ],
                                            },
                                            STAFF_SIDE: {
                                                $cond: [
                                                    {
                                                        $eq: [{ $add: [{ $sum: "$PAID_MONEY" }, { $sum: "$REMINDER_MONEY" }] }, 0]
                                                    },
                                                    0,
                                                    {
                                                        $multiply: [{ $add: [{ $sum: "$PAID_MONEY" }, { $sum: "$REMINDER_MONEY" }] }, { $divide: [parseInt(staff_side), 100] }]
                                                    },
                                                ],
                                            }
                                        }
                                    },
                                    {
                                        $project: {
                                            _id: 0
                                        }
                                    }
                                ],
                                // Natijalar
                                "result": [
                                    {
                                        $group: {
                                            _id: { $arrayElemAt: ["$groups.name", 0] },
                                            total: {
                                                $push: {
                                                    "student": { $arrayElemAt: ["$members.name", 0] },
                                                    // "thisGroupId": { $arrayElemAt: ["$groups._id", 0] },
                                                    "paid": { $sum: { $toInt: "$amount" } },
                                                    "reminder": { $sum: { $toInt: "$reminderSumm" } },
                                                }
                                            }
                                        }
                                    }
                                ],

                            },
                        }
                    ])

                    let PAID_MONEY = salary[0].default[0].PAID_MONEY
                    let TOTAL_GROUP_MONEY = salary[0].default[0].TOTAL_GROUP_MONEY;



                    if (PAID_MONEY === TOTAL_GROUP_MONEY) {
                        const newSalary = new Salary({
                            school: school,
                            member: member,
                            month: month,
                            year: year,
                            payment_system: payment_system,
                            salary: {
                                default: salary[0].default,
                                result: salary[0].result,
                            }
                        })
                        newSalary.save()
                            .then(() => {
                                res.json({
                                    status: "percentage",
                                    data: newSalary
                                })
                            })
                            .catch((error) => {
                                res.json({
                                    status: false,
                                    data: error
                                })
                            })

                    } else {
                        res.json({
                            message: "Guruhlar to'liq to'lov hali amalga oshirmagan",
                            debts: salary[0].default[0].REMINDER_MONEY
                        })
                    }



                }

                // Kishi boshiga maosh chiqarish
                if (staff_side === "0" && school_side === "0" && default_salary == "0") {

                    const salary = await Income.aggregate([
                        { $match: { $and: [{ month: { $eq: month } }, { group: { $in: memberGroup } }] } },
                        { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "members" } },
                        { $lookup: { from: "groups", localField: "group", foreignField: "_id", as: "groups" } },
                        { $project: { "members.name": 1, "groups.name": 1, "groups._id": 1, month: 1, year: 1, amount: 1, reminderSumm: 1, } },
                        {
                            $facet: {

                                "default": [
                                    // TOTAL_GROUP_MONEY: { $add: [{ $sum: "$PAID_MONEY" }, { $sum: "$REMINDER_MONEY" }] },
                                    {
                                        $group: {
                                            _id: null,
                                            PAID_MONEY: { $sum: { $toInt: "$amount" } },
                                            REMINDER_MONEY: { $sum: { $toInt: "$reminderSumm" } },
                                            TOTAL_GROUP_MONEY: { $sum: { $add: [{ $sum: { $toInt: "$amount" } }, { $sum: { $toInt: "$reminderSumm" } }] } },
                                            STAFF_SIDE: { $sum: { $sum: { $multiply: [{ $size: '$members' }, parseInt(per_person)] } } },
                                            SCHOOL_SIDE: {
                                                $sum: {
                                                    $subtract: [
                                                        { $sum: { $add: [{ $sum: { $toInt: "$amount" } }, { $sum: { $toInt: "$reminderSumm" } }] } },
                                                        { $sum: { $sum: { $multiply: [{ $size: '$members' }, parseInt(per_person)] } } }
                                                    ]
                                                }
                                            },
                                        }
                                    },
                                    { $project: { _id: 0 } }
                                ],
                                "result": [
                                    {
                                        $group: {
                                            _id: { $arrayElemAt: ["$groups.name", 0] },
                                            total: {
                                                $push: {
                                                    "student": { $arrayElemAt: ["$members.name", 0] },
                                                    "paid": { $sum: { $toInt: "$amount" } },
                                                    "reminder": { $sum: { $toInt: "$reminderSumm" } },
                                                }
                                            }
                                        }
                                    }
                                ],
                            },
                        }
                    ])

                    let PAID_MONEY = salary[0].default[0].PAID_MONEY
                    let TOTAL_GROUP_MONEY = salary[0].default[0].TOTAL_GROUP_MONEY;

                    if (PAID_MONEY === TOTAL_GROUP_MONEY) {
                        const newSalary = new Salary({
                            school: school,
                            member: member,
                            month: month,
                            year: year,
                            payment_system: payment_system,
                            salary: {
                                default: salary[0].default,
                                result: salary[0].result,
                            }
                        })
                        newSalary.save()
                            .then(() => {
                                res.json({
                                    status: "per_person",
                                    data: newSalary
                                })
                            })
                            .catch((error) => {
                                res.json({
                                    status: false,
                                    data: error
                                })
                            })
                    } else {
                        res.json({
                            message: "Guruhlar to'liq to'lov hali amalga oshirmagan",
                            debts: salary[0].default[0].REMINDER_MONEY
                        })

                    }
                }

                // Umumiy 1 oylik maoshni chiqarish
                if (staff_side === "0" && school_side === "0" && per_person == "0") {

                    const newSalary = new Salary({
                        school: school,
                        member: member,
                        month: month,
                        year: year,
                        payment_system: payment_system,
                        salary: {
                            default: [
                                {
                                    PAID_MONEY: 0,
                                    REMINDER_MONEY: 0,
                                    TOTAL_GROUP_MONEY: 0,
                                    SCHOOL_SIDE: 0,
                                    STAFF_SIDE: default_salary,
                                }
                            ],
                            result: []
                        },
                    })
                    newSalary.save()
                        .then(() => {
                            res.json({
                                status: "1_month",
                                data: newSalary
                            })
                        })
                        .catch((error) => {
                            res.json({
                                status: false,
                                data: error
                            })
                        })
                }
            }
        }
    }
});
// @description: Admin va sotuvchi uchun oylik maosh belgilash
exports.pay_salary_1 = asyncHandler(async (req, res, next) => {
    const { member, month, year, payment_system } = req.body;

    if (member == "" || month == "" || year == "" || payment_system == "") {
        res.json({ success: false, message: "Ma'lumotlarni to'liq kiriting" })
    }
    else {
        const user = await User.findById({ _id: member })
        // Qayta to'langan yoki yo'qligini tekshirish
        const check = await Salary.find({
            $and: [
                { member: { $eq: member } },
                { month: { $eq: month } },
                { year: { $eq: year } },
            ]
        })

        if (check.length >= 1) {
            res.json({
                success: false,
                message: "Ushbu oy uchun oylik-maosh belgilangan"
            })
        }
        else {
            if (user.role == "admin" || user.role == "seller") {
                if (user.salary.status == "0" && user.default_salary == "0") {
                    res.json({
                        success: false,
                        message: "Oylik-maosh belgilanmagan"
                    })
                } else {
                    const result = new Salary({
                        member: member,
                        month: month,
                        year: year,
                        payment_system: payment_system,
                        salary: {
                            default: [
                                {
                                    PAID_MONEY: 0,
                                    REMINDER_MONEY: 0,
                                    TOTAL_GROUP_MONEY: 0,
                                    SCHOOL_SIDE: 0,
                                    STAFF_SIDE: user.salary.default_salary,
                                }
                            ]
                        }
                    })
                    result.save()
                        .then(() => {
                            res.json({
                                message: "Success",
                                data: result
                            })
                        })
                        .catch((error) => {
                            res.json({
                                message: "Failed",
                                data: error
                            })
                        })
                }
            }
            else {
                res.json({
                    success: false,
                    message: "Xodim topilmadi"
                })
            }

        }
    }
})
// @description: O'qituvchi uchun har bir guruhdan bo'lib bo'lib oylik berish
exports.pay_salary_2 = asyncHandler(async (req, res, next) => {
    const { member, month, year, payment_system, group, school } = req.body;
    if (member == "" || month == "" || year == "" || payment_system == "" || group == "") { res.json({ success: false, message: "Ma'lumotlarni to'liq kiriting" }) }
    else {
        // 1. Userni topish
        const user = await User.findById({ _id: member }).populate(['group'])
        // 2. Topilgan userni rolini tekshirish
        if (user.role == "mentor") {
            // 3. Maosh belgilangan yoki yo'qligini tekshirish
            if (user.salary.status == "0") {
                res.json({ message: "Oylik-maosh belgilanmagan" })
            }
            if (user.salary.status == "1") {
                // 4. Userga tegishli guruhlarni olish
                const students = await User.find({ $and: [{ group: { $in: group } }, { role: { $eq: "student" } }] }).select("name").lean()
                // 5. Guruh uchun to'plangan summalar
                const total_group_incomes = await Income.aggregate([
                    { $match: { $and: [{ year: { $eq: year } }, { month: { $eq: month } }, { group: { $eq: ObjectId(group) } }] } },
                    { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "student_info" } },
                    { $project: { amount: 1, reminderSumm: 1, status: 1, "student_info.name": 1 } }
                ])
                // 6.Guruhga to'lovni amalga oshirgan yoki yo'qligini tekshirish
                if (total_group_incomes == "" || !total_group_incomes || total_group_incomes.length == 0) {
                    res.json({ message: "Hech kim to'lovni amalga oshirmagan" })
                }
                else {
                    // 7. Guruh uchun qanchadan to'lov qilinishini yozib qo'yish
                    const group_info = await Group.findById(group)
                    // 8.Guruh uchun umumiy yigilishi kerak bolgan summa;
                    const group_default_summ = group_info.payment * students.length; // 1.000.000 * 4 student
                    const group_collected_summ = total_group_incomes.map((item) => { return item.amount }).reduce((a, b) => parseInt(a) + parseInt(b))
                    const group_retured_summ = total_group_incomes.map((item) => { return item.reminderSumm }).reduce((a, b) => parseInt(a) + parseInt(b))
                    // 9. Ushbu guruh bo'yicha oldin maosh chiqarilgan yoki yo'qligini tekshirish
                    const CHECK = await Salary.find({
                        $and: [
                            { group: { $eq: group } },
                            { member: { $eq: member } },
                            { month: { $eq: month } },
                            { year: { $eq: year } }
                        ]
                    })
                    if (CHECK.length >= 1) {
                        res.json({ success: false, message: "Tanlagan guruh bo'yicha oldin oylik-maosh chiqarilgan" })
                    } else {
                        // 10. Guruhda qarzdorlar bormi yo'qmi tekshirish
                        const checkGroups = await NeedPayment.find({ groupID: group }).lean()
                        const alreadyPayed = [] // allaqachon tolanganlar
                        const stillPayed = [] // hali tolanmaganlar
                        checkGroups.forEach((item) => {
                            const payment = item.payment
                            payment.forEach((pay) => {
                                if (month <= 9) {
                                    const startMonth = String(pay.startMonth).split(".")[1]
                                    if (startMonth == `0${month}`) {
                                        if (pay.types == "debtor") {
                                            stillPayed.push({
                                                user: item.userID,
                                                date: pay.startMonth
                                            })
                                        }
                                        if (pay.types == "payed") {
                                            alreadyPayed.push({
                                                user: item.userID,
                                                date: pay.startMonth
                                            })
                                        }
                                    }
                                }
                                if (month >= 10) {
                                    if (startMonth == month) {
                                        if (pay.types == "debtor") {
                                            stillPayed.push({
                                                user: item.userID,
                                                date: pay.startMonth
                                            })
                                        }
                                        if (pay.types == "payed") {
                                            alreadyPayed.push({
                                                user: item.userID,
                                                date: pay.startMonth
                                            })
                                        }
                                    }
                                }
                            })
                        })
                        if (stillPayed == "" || stillPayed.length == 0) {
                            // 11.Oylik maosh chiqarish, Agar o'qituvchiga tegishli guruh bo'yicha hammasida qarzdorlik bolmasa
                            if (group_default_summ == group_collected_summ || group_retured_summ == 0) {
                                // -------------------------  Foizda maosh berish   -------------------------
                                if (user.salary.per_person === "0" && user.salary.default_salary === "0" && user.salary.percenteage.staff_side !== "0" && user.salary.percenteage.school_side !== "0") {
                                    const staffSide = (group_default_summ / 100) * user.salary.percenteage.staff_side
                                    const schoolSide = (group_default_summ / 100) * user.salary.percenteage.school_side

                                    const mySchool = await School.findById(school)
                                    async function Sms() {

                                        const telephone = parseInt(user.phone.split("-").join(""))
                                        const email = mySchool.sms.sms_email;
                                        const password = mySchool.sms.sms_token;

                                        if (month == "1") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Sizga tegishli bo'lgan "${group_info.name}" nomli guruh uchun ${students.length} ta o'quvchi "${year} yil yanvar oyi" uchun to'lovni to'liq amalga oshirdi. Shartnoma shartariga ko'ra, ushbu guruhdan siz uchun  ${staffSide} so'm ajratib berildi. Xizmatlaringizdan mamnunmiz. `
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "2") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Sizga tegishli bo'lgan "${group_info.name}" nomli guruh uchun ${students.length} ta o'quvchi "${year} yil fevral oyi" uchun to'lovni to'liq amalga oshirdi. Shartnoma shartariga ko'ra, ushbu guruhdan siz uchun  ${staffSide} so'm ajratib berildi. Xizmatlaringizdan mamnunmiz. `
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "3") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Sizga tegishli bo'lgan "${group_info.name}" nomli guruh uchun ${students.length} ta o'quvchi "${year} yil mart oyi" uchun to'lovni to'liq amalga oshirdi. Shartnoma shartariga ko'ra, ushbu guruhdan siz uchun  ${staffSide} so'm ajratib berildi. Xizmatlaringizdan mamnunmiz. `
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "4") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Sizga tegishli bo'lgan "${group_info.name}" nomli guruh uchun ${students.length} ta o'quvchi "${year} yil aprel oyi" uchun to'lovni to'liq amalga oshirdi. Shartnoma shartariga ko'ra, ushbu guruhdan siz uchun  ${staffSide} so'm ajratib berildi. Xizmatlaringizdan mamnunmiz. `
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "5") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Sizga tegishli bo'lgan "${group_info.name}" nomli guruh uchun ${students.length} ta o'quvchi "${year} yil may oyi" uchun to'lovni to'liq amalga oshirdi. Shartnoma shartariga ko'ra, ushbu guruhdan siz uchun  ${staffSide} so'm ajratib berildi. Xizmatlaringizdan mamnunmiz. `
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "6") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Sizga tegishli bo'lgan "${group_info.name}" nomli guruh uchun ${students.length} ta o'quvchi "${year} yil iyun oyi" uchun to'lovni to'liq amalga oshirdi. Shartnoma shartariga ko'ra, ushbu guruhdan siz uchun  ${staffSide} so'm ajratib berildi. Xizmatlaringizdan mamnunmiz. `
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "7") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Sizga tegishli bo'lgan "${group_info.name}" nomli guruh uchun ${students.length} ta o'quvchi "${year} yil iyul oyi" uchun to'lovni to'liq amalga oshirdi. Shartnoma shartariga ko'ra, ushbu guruhdan siz uchun  ${staffSide} so'm ajratib berildi. Xizmatlaringizdan mamnunmiz. `
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "8") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Sizga tegishli bo'lgan "${group_info.name}" nomli guruh uchun ${students.length} ta o'quvchi "${year} yil avgust oyi" uchun to'lovni to'liq amalga oshirdi. Shartnoma shartariga ko'ra, ushbu guruhdan siz uchun  ${staffSide} so'm ajratib berildi. Xizmatlaringizdan mamnunmiz. `
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "9") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Sizga tegishli bo'lgan "${group_info.name}" nomli guruh uchun ${students.length} ta o'quvchi "${year} yil sentabr oyi" uchun to'lovni to'liq amalga oshirdi. Shartnoma shartariga ko'ra, ushbu guruhdan siz uchun  ${staffSide} so'm ajratib berildi. Xizmatlaringizdan mamnunmiz. `
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "10") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Sizga tegishli bo'lgan "${group_info.name}" nomli guruh uchun ${students.length} ta o'quvchi "${year} yil oktabr oyi" uchun to'lovni to'liq amalga oshirdi. Shartnoma shartariga ko'ra, ushbu guruhdan siz uchun  ${staffSide} so'm ajratib berildi. Xizmatlaringizdan mamnunmiz. `
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "11") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Sizga tegishli bo'lgan "${group_info.name}" nomli guruh uchun ${students.length} ta o'quvchi "${year} yil noyabr oyi" uchun to'lovni to'liq amalga oshirdi. Shartnoma shartariga ko'ra, ushbu guruhdan siz uchun  ${staffSide} so'm ajratib berildi. Xizmatlaringizdan mamnunmiz. `
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "12") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Sizga tegishli bo'lgan "${group_info.name}" nomli guruh uchun ${students.length} ta o'quvchi "${year} yil dekabr oyi" uchun to'lovni to'liq amalga oshirdi. Shartnoma shartariga ko'ra, ushbu guruhdan siz uchun  ${staffSide} so'm ajratib berildi. Xizmatlaringizdan mamnunmiz. `
                                            smsSend(telephone, message, email, password)
                                        }

                                    }
                                    if (mySchool.sms.status == "0") console.log("SMS is not connected to inform ")
                                    else Sms()
                                    const result = new Salary({
                                        school: school,
                                        member: member,
                                        group: group,
                                        month: month,
                                        year: year,
                                        salary_type: "percentage",
                                        payment_system: payment_system,
                                        salary: {
                                            default: [
                                                {
                                                    PAID_MONEY: 0,
                                                    REMINDER_MONEY: 0,
                                                    TOTAL_GROUP_MONEY: group_default_summ,
                                                    SCHOOL_SIDE: schoolSide,
                                                    STAFF_SIDE: staffSide,
                                                }
                                            ]
                                        }
                                    })
                                    result.save()
                                        .then(async () => {
                                            res.json({ message: "Success", data: result })

                                        })
                                        .catch((error) => {
                                            res.json({ message: "Failed", data: error.message })
                                        })
                                }
                                // -------------------------  Kishi boshiga maosh berish  -------------------------
                                if (user.salary.per_person !== "0" && user.salary.default_salary === "0" && user.salary.percenteage.staff_side === "0" && user.salary.percenteage.school_side === "0") {
                                    const total = group_info.payment * students.length // 1.000.000  * 2
                                    const staffSide = user.salary.per_person * students.length // 700,000 * 2
                                    const schoolSide = (group_info.payment - user.salary.per_person) * students.length // ( 1.000.000 - 700.000 ) * 2
                                    const mySchool = await School.findById(school)
                                    async function Sms() {

                                        const telephone = parseInt(user.phone.split("-").join(""))

                                        const email = mySchool.sms.sms_email;
                                        const password = mySchool.sms.sms_token;

                                        if (month == "1") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Sizga tegishli bo'lgan "${group_info.name}" nomli guruh uchun ${students.length} ta o'quvchi "${year} yil yanvar oyi" uchun to'lovni to'liq amalga oshirdi. Shartnoma shartariga ko'ra, ushbu guruhdan siz uchun  ${staffSide} so'm ajratib berildi. Xizmatlaringizdan mamnunmiz.`
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "2") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Sizga tegishli bo'lgan "${group_info.name}" nomli guruh uchun ${students.length} ta o'quvchi "${year} yil fevral oyi" uchun to'lovni to'liq amalga oshirdi. Shartnoma shartariga ko'ra, ushbu guruhdan siz uchun  ${staffSide} so'm ajratib berildi. Xizmatlaringizdan mamnunmiz.`
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "3") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Sizga tegishli bo'lgan "${group_info.name}" nomli guruh uchun ${students.length} ta o'quvchi "${year} yil mart oyi" uchun to'lovni to'liq amalga oshirdi. Shartnoma shartariga ko'ra, ushbu guruhdan siz uchun  ${staffSide} so'm ajratib berildi. Xizmatlaringizdan mamnunmiz.`
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "4") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Sizga tegishli bo'lgan "${group_info.name}" nomli guruh uchun ${students.length} ta o'quvchi "${year} yil aprel oyi" uchun to'lovni to'liq amalga oshirdi. Shartnoma shartariga ko'ra, ushbu guruhdan siz uchun  ${staffSide} so'm ajratib berildi. Xizmatlaringizdan mamnunmiz.`
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "5") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Sizga tegishli bo'lgan "${group_info.name}" nomli guruh uchun ${students.length} ta o'quvchi "${year} yil may oyi" uchun to'lovni to'liq amalga oshirdi. Shartnoma shartariga ko'ra, ushbu guruhdan siz uchun  ${staffSide} so'm ajratib berildi. Xizmatlaringizdan mamnunmiz.`
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "6") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Sizga tegishli bo'lgan "${group_info.name}" nomli guruh uchun ${students.length} ta o'quvchi "${year} yil iyun oyi" uchun to'lovni to'liq amalga oshirdi. Shartnoma shartariga ko'ra, ushbu guruhdan siz uchun  ${staffSide} so'm ajratib berildi. Xizmatlaringizdan mamnunmiz.`
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "7") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Sizga tegishli bo'lgan "${group_info.name}" nomli guruh uchun ${students.length} ta o'quvchi "${year} yil iyul oyi" uchun to'lovni to'liq amalga oshirdi. Shartnoma shartariga ko'ra, ushbu guruhdan siz uchun  ${staffSide} so'm ajratib berildi. Xizmatlaringizdan mamnunmiz.`
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "8") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Sizga tegishli bo'lgan "${group_info.name}" nomli guruh uchun ${students.length} ta o'quvchi "${year} yil avgust oyi" uchun to'lovni to'liq amalga oshirdi. Shartnoma shartariga ko'ra, ushbu guruhdan siz uchun  ${staffSide} so'm ajratib berildi. Xizmatlaringizdan mamnunmiz.`
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "9") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Sizga tegishli bo'lgan "${group_info.name}" nomli guruh uchun ${students.length} ta o'quvchi "${year} yil sentabr oyi" uchun to'lovni to'liq amalga oshirdi. Shartnoma shartariga ko'ra, ushbu guruhdan siz uchun  ${staffSide} so'm ajratib berildi. Xizmatlaringizdan mamnunmiz.`
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "10") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Sizga tegishli bo'lgan "${group_info.name}" nomli guruh uchun ${students.length} ta o'quvchi "${year} yil oktabr oyi" uchun to'lovni to'liq amalga oshirdi. Shartnoma shartariga ko'ra, ushbu guruhdan siz uchun  ${staffSide} so'm ajratib berildi. Xizmatlaringizdan mamnunmiz.`
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "11") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Sizga tegishli bo'lgan "${group_info.name}" nomli guruh uchun ${students.length} ta o'quvchi "${year} yil noyabr oyi" uchun to'lovni to'liq amalga oshirdi. Shartnoma shartariga ko'ra, ushbu guruhdan siz uchun  ${staffSide} so'm ajratib berildi. Xizmatlaringizdan mamnunmiz.`
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "12") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Sizga tegishli bo'lgan "${group_info.name}" nomli guruh uchun ${students.length} ta o'quvchi "${year} yil dekabr oyi" uchun to'lovni to'liq amalga oshirdi. Shartnoma shartariga ko'ra, ushbu guruhdan siz uchun  ${staffSide} so'm ajratib berildi. Xizmatlaringizdan mamnunmiz.`
                                            smsSend(telephone, message, email, password)
                                        }

                                    }
                                    if (mySchool.sms.status == "0") console.log("SMS is not connected to inform ")
                                    else Sms()
                                    const result = new Salary({
                                        school: school,
                                        member: member,
                                        group: group,
                                        month: month,
                                        year: year,
                                        salary_type: "per_person",
                                        payment_system: payment_system,
                                        salary: {
                                            default: [
                                                {
                                                    PAID_MONEY: 0,
                                                    REMINDER_MONEY: 0,
                                                    TOTAL_GROUP_MONEY: total,
                                                    SCHOOL_SIDE: schoolSide,
                                                    STAFF_SIDE: staffSide,
                                                }
                                            ]
                                        }
                                    })
                                    result.save()
                                        .then(async () => {
                                            res.json({ message: "Success", data: result })
                                        })
                                        .catch((error) => {
                                            res.json({ message: "Failed", data: error.message })
                                        })
                                }
                                // -------------------------  Umumiy bir oylik stabil oylik  -------------------------
                                if (user.salary.per_person === "0" && user.salary.default_salary !== "0" && user.salary.percenteage.staff_side === "0" && user.salary.percenteage.school_side === "0") {
                                    const mySchool = await School.findById(school)
                                    async function Sms() {
                                        const telephone = parseInt(user.phone.split("-").join(""))
                                        const email = mySchool.sms.sms_email;
                                        const password = mySchool.sms.sms_token;
                                        if (month == "1") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Siz uchun "${year} yil yanvar oyi" uchun ${user.salary.default_salary} oylik-maoshi ajratildi.  Xizmatlaringizdan mamnunmiz 😊😊😊 !!! `
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "2") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Siz uchun "${year} yil fevral oyi" uchun ${user.salary.default_salary} oylik-maoshi ajratildi.  Xizmatlaringizdan mamnunmiz 😊😊😊 !!! `
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "3") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Siz uchun "${year} yil mart oyi" uchun ${user.salary.default_salary} oylik-maoshi ajratildi.  Xizmatlaringizdan mamnunmiz 😊😊😊 !!! `
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "4") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Siz uchun "${year} yil aprel oyi" uchun ${user.salary.default_salary} oylik-maoshi ajratildi.  Xizmatlaringizdan mamnunmiz 😊😊😊 !!! `
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "5") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Siz uchun "${year} yil may oyi" uchun ${user.salary.default_salary} oylik-maoshi ajratildi.  Xizmatlaringizdan mamnunmiz 😊😊😊 !!! `
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "6") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Siz uchun "${year} yil iyun oyi" uchun ${user.salary.default_salary} oylik-maoshi ajratildi.  Xizmatlaringizdan mamnunmiz 😊😊😊 !!! `
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "7") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Siz uchun "${year} yil iyul oyi" uchun ${user.salary.default_salary} oylik-maoshi ajratildi.  Xizmatlaringizdan mamnunmiz 😊😊😊 !!! `
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "8") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Siz uchun "${year} yil avgust oyi" uchun ${user.salary.default_salary} oylik-maoshi ajratildi.  Xizmatlaringizdan mamnunmiz 😊😊😊 !!! `
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "9") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Siz uchun "${year} yil sentabr oyi" uchun ${user.salary.default_salary} oylik-maoshi ajratildi.  Xizmatlaringizdan mamnunmiz 😊😊😊 !!! `
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "10") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Siz uchun "${year} yil oktabr oyi" uchun ${user.salary.default_salary} oylik-maoshi ajratildi.  Xizmatlaringizdan mamnunmiz 😊😊😊 !!! `
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "11") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Siz uchun "${year} yil noyabr oyi" uchun ${user.salary.default_salary} oylik-maoshi ajratildi.  Xizmatlaringizdan mamnunmiz 😊😊😊 !!! `
                                            smsSend(telephone, message, email, password)
                                        }
                                        if (month == "12") {
                                            const message = `Assalomu alaykum. Hurmatli ${user.name}! Siz uchun "${year} yil dekabr oyi" uchun ${user.salary.default_salary} oylik-maoshi ajratildi.  Xizmatlaringizdan mamnunmiz 😊😊😊 !!! `
                                            smsSend(telephone, message, email, password)
                                        }

                                    }
                                    if (mySchool.sms.status == "0") console.log("SMS is not connected to inform ")
                                    else Sms()
                                    const result = new Salary({
                                        school: school,
                                        member: member,
                                        group: group,
                                        month: month,
                                        year: year,
                                        salary_type: "default_salary",
                                        payment_system: payment_system,
                                        salary: {
                                            default: [
                                                {
                                                    PAID_MONEY: 0,
                                                    REMINDER_MONEY: 0,
                                                    TOTAL_GROUP_MONEY: 0,
                                                    SCHOOL_SIDE: 0,
                                                    STAFF_SIDE: user.salary.default_salary,
                                                }
                                            ]
                                        }
                                    })
                                    result.save()
                                        .then(async () => {
                                            res.json({ message: "Success", data: result })
                                        })
                                        .catch((error) => {
                                            res.json({ message: "Failed", data: error.message })
                                        })
                                }
                            }
                            else {
                                res.json({ message: "Guruh uchun qarzdorlik mavjud", data: group_default_summ - group_retured_summ })
                            }
                        }
                        else {
                            res.json({ message: "Guruh uchun qarzdorlik mavjud", data: group_default_summ - group_retured_summ })
                        }
                    }
                }
            }
        }
        else {
            res.json({
                success: false,
                message: "Xodim topilmadi"
            })
        }

    }
})
exports.getAll = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Salary, req, res, next)
    result.get_all("school", "mentor")
});
exports.getOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Salary, req, res, next)
    result.get_one("school", "mentor")
});
exports.updateOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Salary, req, res, next)
    result.update_content()
});
exports.deleteOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Salary, req, res, next)
    result.delete_data_without_file()
});
exports.filterSchool = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Salary, req, res, next)
    result.filterById("school")
});
exports.filterMember = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Salary, req, res, next)
    result.filterById("member")
});
exports.filterByYear = asyncHandler(async (req, res, next) => {
    const { year, member, month } = req.query
    const result = await Salary.find({
        $and: [
            { month: { $eq: month } },
            { year: { $eq: year } },
            { member: { $eq: ObjectId(member) } },
        ]
    })
        .populate({ path: "member", select: "name" })
        .populate({ path: "school", select: "name" })
        .populate({ path: "group", select: "name" })
        .lean()
    res.json({
        message: "Success",
        data: result
    })
});