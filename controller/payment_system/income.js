const Income = require("../../model/payment_system/income");
const Group = require("../../model/group");
const Discount = require("../../model/discount");
const NeedPayment = require("../../model/payment_system/needPayment");
const MyClass = require('../../config/class')
const asyncHandler = require('../../middleware/async')

exports.createData = asyncHandler(async (req, res, next) => {
    const { school, group, user, month, year, payment_type, payment_system, amount, category, speciality } = req.body;

    // Malumotlar aniq mavjudligini bilish ...
    if (!school || !group || !user || !month || !year || !payment_type || !payment_system || !amount) {
        res.json({
            message: "Please fill up forms"
        })
    }
    else {
        // Aniq sanalar berilgan yoki yo'qligini tekshirish paytida ...
        const need_payment = await NeedPayment.find({ $and: [{ groupID: { $eq: group } }, { userID: { $eq: user } }] }).lean()
        if (need_payment == "" || !need_payment || need_payment.length == 0) {
            res.json({
                success: false,
                message: "Current 2 dates aren't defined"
            })
        }
        else {
            // Qaytadan to'lov qilib qolish yoki qilmaslikni holatida ...
            const check = await Income.find({ $and: [{ school: { $eq: school } }, { group: { $eq: group } }, { user: { $eq: user } }, { month: { $eq: month } }, { year: { $eq: year } },] })
            if (check.length >= 1) { res.json({ success: false, message: "Before payed", month: month, year: year }) }
            else {

                // Chegirmani tekshirish ...
                const discount = await Discount.find({ $and: [{ user: { $eq: user } }, { speciality: { $eq: speciality } },] }).lean()
                const groups = await Group.findById(group)
                const groupPayment = groups.payment; // [{""}, {""}, {""}]

                // To'lovni saqlash uchun
                const saveIncomes = async (amount, reminderSumm, status, discountSumm, need_payment_PAYED, need_payment_DEBTOR) => {
                    const income = new Income({
                        school: school,
                        category: category,
                        speciality: speciality,
                        group: group,
                        user: user,
                        month: month,
                        year: year,
                        payment_type: payment_type,
                        payment_system: payment_system,
                        amount: amount, // to'lagan pul
                        reminderSumm: reminderSumm, // qarzdor bo'lgan pul
                        status: status, // qarzdormi yo'qmi
                        discountSumm: discountSumm, // qarzdormi yo'qmi
                    })
                    const payments = await NeedPayment.find({ $and: [{ userID: { $eq: user } }, { groupID: { $eq: group } }] }).lean()
                    const NEED_PAY = payments[0].needPay // Tolanishi kerak bolgan pull
                    const PAYMENT_DATA = payments[0].payment // tolovlar miqdori ro'yhati
                    const PAYMENT_ID = payments[0]._id // tahrirlanadigan Id

                    /*
                        [back] / [front] - DISCOUNT bor => NEED_PAYMENT bor => INCOME to'liq to'langan
                        [back] / [front] - DISCOUNT bor => NEED_PAYMENT bor => INCOME to'liq to'lanmagan
                        [back] / [front] - DISCOUNT yoq => NEED_PAYMENT bor => INCOME to'liq to'langan
                        [back] / [front] - DISCOUNT yoq => NEED_PAYMENT bor => INCOME to'liq to'lanmagan
                    */
                    const checkPayments = PAYMENT_DATA.some((item) => {
                        const StartMonth = String(item.startMonth).split("/")[1] // oyni ajratib olish
                        const StartYear = String(item.startMonth).split("/")[2] // yilni ajratib olish
                        let tillNine = ""
                        let fromTen = ""
                        if (month <= 9) tillNine = `0${month}`
                        if (month >= 10) fromTen = month
                        if ((StartYear == year && StartMonth == tillNine) || (StartYear == year && StartMonth == fromTen)) {
                            return true
                        }
                        else {
                            return false
                        }
                    })
                    if (checkPayments == false) res.json({ message: "Not existed" })
                    else {
                        const arr2 = PAYMENT_DATA.map((item) => {
                            const StartMonth = String(item.startMonth).split("/")[1] // oyni ajratib olish
                            const StartYear = String(item.startMonth).split("/")[2] // yilni ajratib olish
                            let tillNine = ""
                            let fromTen = ""
                            if (month <= 9) tillNine = `0${month}`
                            if (month >= 10) fromTen = month

                            const payed = { startMonth: item.startMonth, endMonth: item.endMonth, types: need_payment_PAYED, }
                            const rested = { startMonth: item.startMonth, endMonth: item.endMonth, types: item.types, }
                            const needConditions = (StartYear == year && StartMonth == tillNine) || (StartYear == year && StartMonth == fromTen)

                            if (discount.length >= 1) {
                                if (needConditions) {
                                    return payed
                                }
                                return rested
                            }
                            if (discount.length == 0) {
                                if (needConditions) {
                                    return payed
                                }
                                return rested
                            }



                        })
                        const need_paymentss = await NeedPayment.findByIdAndUpdate({ _id: PAYMENT_ID })
                        const arr1 = need_paymentss.payment
                        const lastChanged = arr1.map(object_1 => arr2.find(object_2 => object_2.startMonth === object_1.startMonth) || object_1);
                        need_paymentss.payment = lastChanged
                        await need_paymentss.save()
                            .then(async () => {
                                await income.save()
                                    .then(() => { res.json({ success: true, message: "Success", data: need_paymentss }) })
                                    .catch((error) => { res.json(error.message) })
                            })
                            .catch((error) => { res.json(error.message) })
                    }
                }




                // Agar chegirma o'quvchiga berilgan bo'lsa ...
                if (discount.length >= 1) {
                    // Agar to'lanadigan summa chegirma miqdoridan ko'p yoki kamligini tekshirish ... 
                    const discountPercentage = discount[0].percentage // e.g: 35 foiz
                    const studentNeedDiscountPayment = (groupPayment - ((groupPayment / 100) * discountPercentage)) // 1.000.000 kursining 35 foiz chegirma berilsa o'quvchi to'lashi kerak bo'lgan summa chiqadi - yani 650.000
                    // Agar o'quvchi chegirmadan ortiq to'lovni qilib yuboradigan bo'lsa ...
                    if (studentNeedDiscountPayment < amount) { res.json({ message: "Payment is more", needPay: studentNeedDiscountPayment }) }
                    else {
                        // Agar o'quvchiga 1 mln lik kursdan 35% chegirma qilinsa-yu (350.000 to'lamaydi, faqat 650.000 to'laydi) shundayam bo'lib to'lasa
                        if (studentNeedDiscountPayment > amount) {
                            const reminder_summa = studentNeedDiscountPayment - amount // 650.000 chegirmadan 250.000 to'lagan
                            const discountSumm = groupPayment - studentNeedDiscountPayment
                            saveIncomes(amount, reminder_summa, "debtor", discountSumm, "debtor", "payed")
                        }
                        // Agar o'quvchi  1 mln lik kursdan 35% chegirma qilinsa (350.000 to'lamaydi, faqat 650.000 to'laydi) va 650.000 ni bittada to'lasa
                        if (studentNeedDiscountPayment == amount) {
                            const discountSumm = groupPayment - studentNeedDiscountPayment
                            saveIncomes(studentNeedDiscountPayment, "0", "no_debtor", discountSumm, "payed", "debtor",)
                        }
                    }
                }
                // Agar chegirma o'quvchiga berilmagan bo'lsa ...
                if (!discount || discount == "" || discount.length == 0) {
                    if (parseInt(groupPayment) < parseInt(amount)) { res.json({ message: "Payment is more", needPay: groupPayment }) }
                    else {
                        // Agar guruh uchun to'lovni to'liq to'lagan taqdirda ...
                        if (parseInt(groupPayment) === parseInt(amount)) { saveIncomes(amount, "0", "no_debtor", "0", "payed", "debtor") }
                        // Agar guruhga to'lovni malum miqdorini to'lasa, qolgan qismini bo'liq to'lagan holatda ...
                        if (parseInt(groupPayment) > parseInt(amount)) {
                            const remindSumm = groupPayment - amount;
                            saveIncomes(amount, remindSumm, "debtor", "0", "debtor", "payed")
                        }
                    }
                }
            }
        }
    }
});
exports.getAll = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Income, req, res, next)
    result.get_all("school")
});
exports.getOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Income, req, res, next)
    result.get_one("school")
});
exports.updateOne = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { summa } = req.body; // e.g: 500.000
    const income = await Income.findById(id);
    if (summa) {
        if (income.status == "no_debtor") {
            res.json({
                success: false,
                message: "Payed totally"
            })
        }
        else {
            // Agar to'lanadigan summa qarzdorlikdan ko'p bo'lsa
            if (parseInt(income.reminderSumm) < parseInt(summa)) {
                res.json({
                    success: false,
                    message: `Your payment is more than current payment`
                })
            }
            else {

                const user = income.user
                const group = income.group
                const month = income.month
                const year = income.year
                const speciality = income.speciality

                // To'lovni saqlash uchun
                const updateNeedPayment = async (need_payment_PAYED, INCOME) => {

                    // Chegirmani tekshirish ...
                    const discount = await Discount.find({ $and: [{ user: { $eq: user } }, { speciality: { $eq: speciality } },] }).lean()
                    const groups = await Group.findById(group)
                    const groupPayment = groups.payment;


                    const payments = await NeedPayment.find({ $and: [{ userID: { $eq: user } }, { groupID: { $eq: group } }] }).lean()
                    const NEED_PAY = payments[0].needPay // Tolanishi kerak bolgan pull
                    const PAYMENT_DATA = payments[0].payment // tolovlar miqdori ro'yhati
                    const PAYMENT_ID = payments[0]._id // tahrirlanadigan Id

                    /*
                        [] - DISCOUNT bor => NEED_PAYMENT bor => INCOME to'liq to'lanmagan
                        [] - DISCOUNT yoq => NEED_PAYMENT bor => INCOME to'liq to'lanmagan
                    */
                    const checkPayments = PAYMENT_DATA.some((item) => {
                        const StartMonth = String(item.startMonth).split("/")[1] // oyni ajratib olish
                        const StartYear = String(item.startMonth).split("/")[2] // yilni ajratib olish
                        let tillNine = ""
                        let fromTen = ""
                        if (month <= 9) tillNine = `0${month}`
                        if (month >= 10) fromTen = month
                        if ((StartYear == year && StartMonth == tillNine) || (StartYear == year && StartMonth == fromTen)) {
                            return true
                        }
                        else {
                            return false
                        }
                    })
                    if (checkPayments == false) res.json({ message: "Not existed" })
                    else {
                        const arr2 = PAYMENT_DATA.map((item) => {
                            const StartMonth = String(item.startMonth).split("/")[1] // oyni ajratib olish
                            const StartYear = String(item.startMonth).split("/")[2] // yilni ajratib olish
                            let tillNine = ""
                            let fromTen = ""
                            if (month <= 9) tillNine = `0${month}`
                            if (month >= 10) fromTen = month

                            const payed = { startMonth: item.startMonth, endMonth: item.endMonth, types: need_payment_PAYED, }
                            const rested = { startMonth: item.startMonth, endMonth: item.endMonth, types: item.types, }
                            const needConditions = (StartYear == year && StartMonth == tillNine) || (StartYear == year && StartMonth == fromTen)

                            if (discount.length >= 1) {
                                if (needConditions) {
                                    return payed
                                }
                                return rested
                            }
                            if (discount.length == 0) {
                                if (needConditions) {
                                    return payed
                                }
                                return rested
                            }



                        })
                        const need_paymentss = await NeedPayment.findByIdAndUpdate({ _id: PAYMENT_ID })
                        const arr1 = need_paymentss.payment
                        const lastChanged = arr1.map(object_1 => arr2.find(object_2 => object_2.startMonth === object_1.startMonth) || object_1);
                        need_paymentss.payment = lastChanged
                        await need_paymentss.save()
                            .then(async () => {
                                await INCOME.save()
                                    .then(() => { res.json({ success: true, message: "Success", data: INCOME }) })
                                    .catch((error) => { res.json(error.message) })
                            })
                            .catch((error) => { res.json(error.message) })
                    }
                }

                // Agar qarzdorlik to'liq to'lanmasa
                if (parseInt(income.reminderSumm) > parseInt(summa)) {
                    const updateIncomes = await Income.findByIdAndUpdate(id);
                    updateIncomes.reminderSumm = parseInt(updateIncomes.reminderSumm) - parseInt(summa)
                    updateIncomes.amount = parseInt(updateIncomes.amount) + parseInt(summa)
                    updateIncomes.status = "debtor"
                    updateNeedPayment("debtor", updateIncomes)
                }
                // Agar qarzdorlik to'liq to'lanadigan bo'lsa
                if (parseInt(income.reminderSumm) == parseInt(summa)) {
                    const updateIncomes = await Income.findByIdAndUpdate(id);
                    updateIncomes.reminderSumm = parseInt(updateIncomes.reminderSumm) - parseInt(summa)
                    updateIncomes.amount = parseInt(updateIncomes.amount) + parseInt(summa)
                    updateIncomes.status = "no_debtor"
                    updateNeedPayment("payed", updateIncomes)
                }
            }
        }
    }
    else {
        res.json({
            message: "Please fill forms"
        })
    }
});
exports.incomes = asyncHandler(async (req, res, next) => {
    const { school, group, month, year, check, category, speciality, user } = req.query;

    const containArray = (element) => {
        const arrayDemo = []
        for (const item of element) {
            const values = item
            arrayDemo.push(values)
        }
        return arrayDemo
    }
    const response = (item) => {
        return res.json({
            success: true,
            message: "Hamma malumotlar olindi",
            count: item.length,
            data: item
        })
    }
    if (check == "student") {
        const result = await Income.find({ user: { $eq: user } }).lean()
        response(result)
    }
    if (check == "school") {
        const result = await Income.find({
            $and: [
                { school: { $eq: school } },
                { month: { $in: containArray(month) } },
                { year: { $eq: year } },
            ]
        })
            .populate({ path: "school", select: "name" })
            .populate({ path: "category", select: "name" })
            .populate({ path: "speciality", select: "name" })
            .populate({ path: "group", select: "name" })
            .populate({ path: "user", select: "name" })
            .lean()
        response(result)
    }
    if (check == "group") {
        const result = await Income.find({
            $and: [
                { school: { $eq: school } },
                { group: { $in: containArray(group) } },
                { month: { $in: containArray(month) } },
                { year: { $eq: year } },
            ]
        })
            .populate({ path: "school", select: "name" })
            .populate({ path: "category", select: "name" })
            .populate({ path: "speciality", select: "name" })
            .populate({ path: "group", select: "name" })
            .populate({ path: "user", select: "name" })
            .lean()
        response(result)
    }
    if (check == "category_speciality") {
        const result = await Income.find({
            $and: [
                { school: { $eq: school } },
                { category: { $eq: category } },
                { speciality: { $eq: speciality } },
                { month: { $in: containArray(month) } },
                { year: { $eq: year } },
            ]
        })
            .populate({ path: "school", select: "name" })
            .populate({ path: "category", select: "name" })
            .populate({ path: "speciality", select: "name" })
            .populate({ path: "group", select: "name" })
            .populate({ path: "user", select: "name" })
            .lean()
        response(result)
    }
});
exports.debts = asyncHandler(async (req, res, next) => {
    const { school, group, month, year, check, } = req.query;
    const containArray = (element) => {
        const arrayDemo = []
        for (const item of element) {
            const values = item
            arrayDemo.push(values)
        }
        return arrayDemo
    }
    const response = (item) => {
        return res.json({
            success: true,
            message: "Hamma malumotlar olindi",
            count: item.length,
            data: item
        })
    }
    if (check == "school") {
        const result = await Income
            .find({
                $and: [
                    { school: { $eq: school } },
                    { month: { $in: containArray(month) } },
                    { year: { $eq: year } },
                    { status: { $eq: "debtor" } },
                ]
            })
            .populate({ path: "school", select: "name" })
            .populate({ path: "category", select: "name" })
            .populate({ path: "speciality", select: "name" })
            .populate({ path: "group", select: "name" })
            .populate({ path: "user", select: "name" })
            .lean()
        response(result)
    }
    if (check == "group") {
        const result = await Income.find({
            $and: [
                { school: { $eq: school } },
                { group: { $in: containArray(group) } },
                { month: { $in: containArray(month) } },
                { year: { $eq: year } },
                { status: { $eq: "debtor" } },
            ]
        })
            .populate({ path: "school", select: "name" })
            .populate({ path: "category", select: "name" })
            .populate({ path: "speciality", select: "name" })
            .populate({ path: "group", select: "name" })
            .populate({ path: "user", select: "name" })
            .lean()
        response(result)
    }
})
exports.deleteOne = asyncHandler(async (req, res, next) => {
    const { user, month, year, status } = req.query
    const need_payment = await NeedPayment.find({ userID: user }).lean()

    if (need_payment == "" || need_payment == undefined || need_payment == null || !need_payment) {
        res.json({
            success: false,
        })
    } 
    else {

        let defaultMONTH = ""
        if (month == "1") defaultMONTH = "01"
        if (month == "2") defaultMONTH = "02"
        if (month == "3") defaultMONTH = "03"
        if (month == "4") defaultMONTH = "04"
        if (month == "5") defaultMONTH = "05"
        if (month == "6") defaultMONTH = "06"
        if (month == "7") defaultMONTH = "07"
        if (month == "8") defaultMONTH = "08"
        if (month == "9") defaultMONTH = "09"
        if (month == "10") defaultMONTH = "10"
        if (month == "11") defaultMONTH = "11"
        if (month == "12") defaultMONTH = "12"

        const PAYMENT = need_payment[0].payment
        const NEED_PAYMENT = PAYMENT.map((item, index) => {
            const month = String(item.startMonth).split("/")[1] // oyni ajratib olish
            const years = String(item.startMonth).split("/")[2] // yilni ajratib olish
            if (month == defaultMONTH) {
                if (years == year) {
                    if (status == "debtor") {
                        return {
                            _id: item._id,
                            startMonth: item.startMonth,
                            endMonth: item.endMonth,
                            types: 'debtor'
                        }
                    }
                    if (status == "no_debtor") {
                        return {
                            _id: item._id,
                            startMonth: item.startMonth,
                            endMonth: item.endMonth,
                            types: 'debtor'
                        }
                    }
                }
            }
            return {
                _id: item._id,
                startMonth: item.startMonth,
                endMonth: item.endMonth,
                types: item.types
            }
        })

        

        const update_need_payment = await NeedPayment.findOneAndUpdate({ userID: user })
        update_need_payment.payment = NEED_PAYMENT
        update_need_payment.save()
            .then(async () => {
                await Income.findOneAndDelete({ user: user })
                res.json({
                    success: true,
                })
            })
            .catch((error) => {
                res.json({ data: error.message })
            })
    }
});