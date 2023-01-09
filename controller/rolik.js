const Rolik = require('../model/rolik');
const School = require('../model/school');
const Notification = require('../model/notification');
const Speciality = require('../model/speciality');
const User = require('../model/user');
const MyClass = require('../config/class')
const asyncHandler = require('../middleware/async');
const ObjectId = require("mongodb").ObjectId
const axios = require("axios");

exports.createData = asyncHandler(async (req, res, next) => {
    const { school, category, speciality, mentor, title, about, requirement, forWhom, startDate, endDate, lessonType, link, address, rolik } = req.body;
    const result = new Rolik({
        school: school,
        category: category,
        speciality: speciality,
        mentor: mentor,
        rolik: rolik,
        title: title,
        about: about,
        requirement: requirement,
        forWhom: forWhom,
        startDate: startDate,
        endDate: endDate,
        lessonType: lessonType,
        link: link,
        address: address,
    })
    result.save()
        .then(async () => {
            const users = await User.find({
                $and: [
                    { school: { $in: school } },
                    { role: { $in: ["admin", "mentor", "seller"] } }
                ]
            }).lean()
            const specialities = await Speciality.findById(speciality)
            users.forEach((item) => {
                const notification = new Notification({
                    message: `Hurmatli xodim. ${new Date().toLocaleDateString()} da ${specialities.name} kursidan ochiq dars bo'ladi`,
                    userID: item._id
                })
                notification.save()

            })
            res.json({
                success: true,
                data: result
            })
        })
        .catch((error) => {
            res.json({
                success: false,
                data: error.message
            })
        })
});
exports.getAll = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Rolik, req, res, next)
    result.get_all("school", "category", "speciality", "open_couse")
});
// Aktive Ochiq darslar boshlanishidan roppa rosa 1 kun oldin hamma lid qoldirgan userlarni olish
exports.filterAll = asyncHandler(async (req, res, next) => {
    const today = new Date()
    const currentDate = new Date(today.getTime() + 1000 * 60 * 60 * 24 * 1)
    const phones = await School.aggregate([
        {
            $match: {
                $and: [
                    { actions: { $eq: "active" } },
                    { "sms.status": { $eq: "1" } },
                ]
            }
        },
        {
            $project: {
                _id: 1, name: 1
            }
        },
        {
            $lookup: {
                from: "roliks",
                let: { school: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $and: [
                                { $expr: { $eq: ["$school", "$$school"] } },
                                { actions: { $eq: "active" } },
                                // { startDate: { $lt: currentDate.toISOString() } },
                                // { endDate: { $gte: currentDate.toISOString() } }
                            ]

                        }
                    },
                    {
                        $project: {
                            _id: 1, title: 1, startDate: 1, endDate: 1
                        }
                    },
                    {
                        $lookup: {
                            from: "lids",
                            let: { open_couse: "$_id" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: { $eq: ["$open_couse", "$$open_couse"] }
                                    }
                                },
                                {
                                    $lookup: {
                                        from: "schools",
                                        localField: "school",
                                        foreignField: "_id",
                                        as: "school",
                                    }
                                },
                                {
                                    $lookup: {
                                        from: "specialities",
                                        localField: "speciality",
                                        foreignField: "_id",
                                        as: "speciality",
                                    }
                                },
                                {
                                    $lookup: {
                                        from: "roliks",
                                        localField: "open_couse",
                                        foreignField: "_id",
                                        as: "open_couse",
                                    }
                                },
                                {
                                    $project: {
                                        _id: 1,
                                        phone: 1,
                                        username: 1,
                                        school: { $arrayElemAt: ["$school.name", 0] },
                                        sms_email: { $arrayElemAt: ["$school.sms.sms_email", 0] },
                                        sms_password: { $arrayElemAt: ["$school.sms.sms_token", 0] },
                                        speciality: { $arrayElemAt: ["$speciality.name", 0] },
                                        open_couse: { $arrayElemAt: ["$open_couse.startDate", 0] },
                                    }
                                },
                                {
                                    $group: {
                                        _id: "$school",
                                        USER: {
                                            $push: {
                                                phone: "$phone",
                                                username: "$username",
                                                school: "$school",
                                                speciality: "$speciality",
                                                date: "$open_couse",
                                                smsEmail: "$sms_email",
                                                smsPassword: "$sms_password",
                                            }
                                        }
                                    }
                                }
                            ],
                            as: "LID",
                        },
                    },
                ],
                as: "ROLIK",
            },
        },
        {
            $project: {
                ROLIK: "$ROLIK.LID.USER"
            }
        }
    ])
    const datas = phones[0].ROLIK
    const users = datas.map((item) => { return item[0] })
    const result = []
    for (let i = 0; i < 100; i++) {
        if (users[i]) {
            result.push(...users[i])
        }
    }

    const defaultData = result.map((item) => {
        return {
            phone: item.phone.split("-").join(""),
            username: item.username,
            school: item.school,
            speciality: item.speciality,
            date: item.date,
            smsEmail: item.smsEmail,
            smsPassword: item.smsPassword,
        }
    })

    res.json(defaultData)
});
exports.getOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Rolik, req, res, next)
    result.get_one("school", "category", "speciality", "open_couse")
});
exports.updateOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Rolik, req, res, next)
    result.update_content()
});
exports.deleteOne = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    if (!id) {
        res.json({
            success: false,
            message: "Params ID is not defined"
        })
    } else {
        const result = new MyClass(Rolik, req, res, next)
        result.delete_data_without_file()
    }
});
exports.filterData = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { actions } = req.query;
    const result = await Rolik
        .find({
            $and: [
                { school: { $eq: id } },
                { actions: { $eq: actions } },
            ]
        })
        .populate(["school"])
        .populate(["category"])
        .populate(["speciality"])
    res.json({
        message: "Malumot muvaffaqiyatli olindi",
        count: result.length,
        data: result
    })
});
// Ochiq dars boshlanishidan oldin mojozlarga ogohlantirish uchum sms jo'natish
exports.sendSms = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const today = new Date()
    const school = await Rolik.findById(id).select(["title", "school", "sms_count", "startDate"]).populate({ path: "school", select: "sms" })

    // Ochiq dars muddaati o'tib ketmagan
    if (new Date(school.startDate).toISOString() > today.toISOString()) {
        const status = school.school.sms.status
        if (status == "0") {
            res.json({
                message: "Sms system is not connected"
            })
        }
        else {
            // Ochiq dars boyicha hamma mijozlarni olish
            const result = await Rolik.aggregate([
                { $match: { _id: { $eq: ObjectId(id) } } },
                { $lookup: { from: "schools", localField: "school", foreignField: "_id", as: "school", } },
                { $lookup: { from: "specialities", localField: "speciality", foreignField: "_id", as: "speciality", } },
                { $project: { _id: 1, school: { $arrayElemAt: ["$school.name", 0] }, sms_email: { $arrayElemAt: ["$school.sms.sms_email", 0] }, sms_password: { $arrayElemAt: ["$school.sms.sms_token", 0] }, speciality: { $arrayElemAt: ["$speciality.name", 0] }, startDate: "$startDate", } },
                {
                    $lookup: {
                        from: "lids",
                        let: { open_couse: "$_id" },
                        pipeline: [{ $match: { $expr: { $eq: ["$open_couse", "$$open_couse"] } } }, { $project: { _id: 0, username: 1, phone: 1 } },],
                        as: "lids"
                    }
                }
            ])
            const school = result[0].school
            const email = result[0].sms_email
            const password = result[0].sms_password
            const speciality = result[0].speciality
            const date = new Date(result[0].startDate).toLocaleDateString()
            const hour = new Date(result[0].startDate).toLocaleTimeString()
            const users = result[0].lids

            // Barcha mijozlarga sms jo'natish
            function rekursiyaSms(count) {
                if (count >= 0) {

                    const element = users[count]
                    if (element) {
                        const phone = element.phone.split("-").join("")
                        const user = element.username
                        const message = `Hurmatli ${user}. Sizni ${date} kuni soat ${hour.split(":").slice(0, 2).toString().replace(",", ":")} da "${school}" o'quv markazida  ${speciality} kursi bo'yicha bo'ladigan ochiq darsga chaqirib qolamiz !`
                        axios({
                            method: "POST",
                            url: "http://notify.eskiz.uz/api/auth/login",
                            data: {
                                email: email,
                                password: password,
                            },
                        })
                            .then((response) => {
                                axios({
                                    method: "POST",
                                    url: "http://notify.eskiz.uz/api/message/sms/send",
                                    headers: { Authorization: `Bearer ${response.data.data.token}`, },
                                    data: {
                                        mobile_phone: phone,
                                        message: message,
                                    }
                                })
                                    .then((responses) => {
                                        console.log(responses.data)
                                    })
                            })
                    }
                    rekursiyaSms(count - 1)
                }
            }
            rekursiyaSms(users.length)


            res.json({
                message: "Sms is sent",
                result: result
            })
        }
    }
    // Ochiq dars muddati o'tib ketgan
    if (new Date(school.startDate).toISOString() < today.toISOString()) {
        res.json({
            message: "Deadline fineshed"
        })
    }
})