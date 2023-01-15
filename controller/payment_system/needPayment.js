const Income = require("../../model/payment_system/income");
const Discount = require("../../model/discount");
const Group = require("../../model/group");
const NeedPayment = require("../../model/payment_system/needPayment");
const MyClass = require('../../config/class')
const asyncHandler = require('../../middleware/async')
const _ = require('lodash');
exports.createData = asyncHandler(async (req, res, next) => {
    const { userID, groupID, startDay, all_month, payment, } = req.body;

    if (!userID || !groupID || !startDay || !all_month || !payment) {
        res.json({ message: "Ma'lumotlarni to'liq kiriting" })
    }
    else {
        const result = await NeedPayment.find({ $and: [{ userID: { $eq: userID } }, { groupID: { $eq: groupID } }] }).lean()
        const groups = await Group.findById(groupID).lean()
        const groupPayment = groups.payment;
        const groupSpeciality = groups.speciality;

        const discount = await Discount.find({ $and: [{ user: { $eq: userID } }, { speciality: { $eq: groupSpeciality } },] }).lean()

        if (result == "" || result.length == 0) {
            async function saveNeedPayments(needPaying, payment) {
                const needPayments = new NeedPayment({
                    userID: userID,
                    groupID: groupID,
                    startDay: startDay,
                    all_month: all_month,
                    needPay: needPaying,
                    payment: payment.reverse(),
                })
                needPayments.save()
                    .then(() => { res.json({ message: "Success", data: needPayments }) })
                    .catch((error) => { res.json({ message: "Error", data: error.message }) })
            }


            /* 
                Agar NEED_PAYMENT ni behosdan o'chirin yuborilsa, shu boyicha INCOME ga tushga tolovlar bilan NEED_PAYMENT da
                yaratilmoqchi bolgan paymentlar shunga qarab yaratilinadi

                Agarda INCOME da tolov qilinmagan bolsa, NEED_PAYMENT dagi payment qismiga types qismidagi hammasi "debtor" qib yoziladi, 
                aks holsa INCOME da tolangan summa bolsa NEED_PAYMENT da tolangan sanasiga types qismidagi hammasi "payed" qib yoziladi
            */


            const payments = []
            for (const item of payment) payments.push(item)
            const incomes = await Income.find({ user: userID }).lean()
            if (incomes == "" || incomes.length == 0 || incomes == undefined || !incomes) {
                // Chegirma bolgan holatda saqlash
                if (discount.length >= 1) {
                    const discountPercentage = discount[0].percentage // e.g: 35 foiz
                    const studentNeedDiscountPayment = (groupPayment - ((groupPayment / 100) * discountPercentage))
                    saveNeedPayments(studentNeedDiscountPayment, payments)
                }
                // Chegirma bolmagan holatda saqlash
                if (!discount || discount == "" || discount.length == 0) saveNeedPayments(groupPayment, payments)
            }
            else {

                const INCOME_PAYMENT = incomes.map((item, index) => {
                    if (parseInt(item.month) < 10) {
                        if (item.status == "debtor") {
                            return {
                                date: `0${item.month}/${item.year}`,
                                types: "debtor"
                            }
                        }
                        if (item.status == "no_debtor") {
                            return {
                                date: `0${item.month}/${item.year}`,
                                types: "payed"
                            }
                        }

                    }
                    return {
                        date: `${item.month}/${item.year}`,
                        types: item.status
                    }
                })
                const NEED_PAYMENTS = payments
                    .map((items) => {
                        const start_month = String(items.startMonth).split("/")[1]
                        const start_year = String(items.startMonth).split("/")[2]
                        if (items.types == "debtor") {
                            return {
                                date: `${start_month}/${start_year}`,
                                types: items.types,
                                startMonth: items.startMonth,
                                endMonth: items.endMonth,
                            }
                        }
                        if (items.types == "payed") {
                            return {
                                date: `${start_month}/${start_year}`,
                                types: items.types,
                                startMonth: items.startMonth,
                                endMonth: items.endMonth,
                            }
                        }
                    })
                    .reverse()
                const set_dates = (types, elements) => {
                    return {
                        types: types,
                        startMonth: elements.startMonth,
                        endMonth: elements.endMonth
                    }
                }
                const DEBTORS = _.differenceBy(NEED_PAYMENTS, INCOME_PAYMENT, 'date')
                const PAYED = []
                NEED_PAYMENTS.forEach((need) => {
                    INCOME_PAYMENT.forEach((income) => {
                        if (need.date == income.date) {
                            return PAYED.push(set_dates(income.types, need))
                        }
                    })
                })
                const RESULT = DEBTORS
                    .concat(PAYED)
                    .map((item) => { return set_dates(item.types, item) })
                    .sort((a, b) => { if (new Date(a.startMonth) > new Date(b.startMonth)) return -1 })
                    .reverse()





                if (discount.length >= 1) {
                    const discountPercentage = discount[0].percentage // e.g: 35 foiz
                    const studentNeedDiscountPayment = (groupPayment - ((groupPayment / 100) * discountPercentage))
                    saveNeedPayments(studentNeedDiscountPayment, RESULT.reverse())
                }
                if (!discount || discount == "" || discount.length == 0) {
                    saveNeedPayments(groupPayment, RESULT.reverse())
                }

            }
        }
        else res.json({ message: "Duplicated" })
    }
});
exports.generalBySchoolOrGroup = asyncHandler(async (req, res, next) => {
    const data = await NeedPayment.aggregate([
        { $unwind: { path: "$payment" } },
        {
            $lookup: {
                from: "users",
                localField: "userID",
                foreignField: "_id",
                as: "userID"
            }
        },
        {
            $lookup: {
                from: "groups",
                localField: "groupID",
                foreignField: "_id",
                as: "groupID"
            }
        },
        {
            $project: {
                "payment": 1,
                "groupID._id": 1,
                "groupID.name": 1,
                "userID._id": 1,
                "userID.name": 1,
                "_id": 0
            }
        },
    ])

    res.json({
        success: true,
        data: data
    })
});
exports.filter_by_school = asyncHandler(async (req, res, next) => {
    const { MONTH, STATUS, YEAR } = req.query;
    if (MONTH == "" || STATUS == "" || YEAR == "") {
        res.json({
            message: "Duplicated",
        })
    }
    else {
        const data = await NeedPayment.aggregate([
            { $unwind: { path: "$payment" } },
            {
                $lookup: {
                    from: "groups",
                    localField: "groupID",
                    foreignField: "_id",
                    as: "group"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userID",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $project: {
                    "userID": { $arrayElemAt: ["$user._id", 0] },
                    "username": { $arrayElemAt: ["$user.name", 0] },
                    "startMonth": "$payment.startMonth",
                    "endMonth": "$payment.endMonth",
                    "status": "$payment.types",
                    "needPay": 1,
                    "group": { $arrayElemAt: ["$group.name", 0] },
                }
            },

        ])

        const result = data.filter((item) => {
            const month = String(item.startMonth).split("/")[1]
            const year = String(item.startMonth).split("/")[2]
            return month == MONTH && year == YEAR && item.status == STATUS
        })
        res.json({
            success: true,
            count: result.length,
            data: result
        })
    }
});
exports.filter_by_group = asyncHandler(async (req, res, next) => {
    const { MONTH, STATUS, YEAR, GROUP } = req.query;
    if (MONTH == "" || STATUS == "" || YEAR == "" || GROUP == "") {
        res.json({
            message: "Duplicated",
        })
    }
    else {
        const data = await NeedPayment.aggregate([
            { $unwind: { path: "$payment" } },
            {
                $lookup: {
                    from: "groups",
                    localField: "groupID",
                    foreignField: "_id",
                    as: "group"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userID",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $project: {
                    "userID": { $arrayElemAt: ["$user._id", 0] },
                    "username": { $arrayElemAt: ["$user.name", 0] },
                    "startMonth": "$payment.startMonth",
                    "endMonth": "$payment.endMonth",
                    "status": "$payment.types",
                    "needPay": 1,
                    "group": { $arrayElemAt: ["$group.name", 0] },
                    "groupID": { $arrayElemAt: ["$group._id", 0] },
                }
            },

        ])

        const result = data.filter((item) => {
            const month = String(item.startMonth).split("/")[1]
            const year = String(item.startMonth).split("/")[2]
            return month == MONTH && year == YEAR && item.status == STATUS && item.groupID == GROUP
        })
        res.json({
            success: true,
            count: result.length,
            data: result
        })
    }
});
exports.filter_by_user = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const data = await NeedPayment.find({ userID: id })
        .populate({ path: "groupID", select: "name" })
        .populate({ path: "userID", select: "name" })
        .lean()

    res.json({
        success: true,
        data: data
    })

});
exports.filter_by_user_and_month = asyncHandler(async (req, res, next) => {
    const { userId, dates } = req.query;
    const data = await NeedPayment.find({
        userID: userId,
        "payment.startMonth": dates
    }).lean()

    res.json({
        success: true,
        data: data
    })

});
exports.getOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(NeedPayment, req, res, next)
    result.get_one()
});
exports.updateOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(NeedPayment, req, res, next)
    result.update_content()
});
exports.deleteOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(NeedPayment, req, res, next)
    result.delete_data_without_file()
});
