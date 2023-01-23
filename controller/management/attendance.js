const Attendance = require("../../model/management/attendance");
const MyClass = require('../../config/class')
const asyncHandler = require('../../middleware/async');
const { ObjectId } = require("mongodb");

exports.createManyData = asyncHandler(async (req, res, next) => {
    const { school, group, members, name, day, month, year, absent, reason, checkRole } = req.body;
    let usersYesId = req.body.membersYes
    let usersNoId = req.body.membersNo

    const saving1 = async (item) => {
        await item.save()
        return item
    }
    // O'quvchidan boshqa barcha hodimlar uchun yo'lama qilish
    if (checkRole == "student") {
        const CHECK_STAFF = await Attendance.find({
            $and: [
                { school: { $eq: school } },
                { group: { $eq: group } },
                { day: { $eq: day } },
                { month: { $eq: month } },
                { year: { $eq: year } }
            ]
        }).lean()
        if (CHECK_STAFF.length >= 1) {
            res.json({
                status: false,
                message: "Yo'qlama allaqachon qilingan"
            })
        } else {

            let data1 = usersYesId.map(async (item) => {
                const staff_attendance_1 = new Attendance({ ...req.body, absent: "1", members: item._id, name: item.name })
                let sav = await saving1(staff_attendance_1)
                return sav
            })
            let data2 = usersNoId.map(async (item) => {
                const staff_attendance_2 = new Attendance({ ...req.body, absent: "0", members: item._id, name: item.name })
                let sav = await saving1(staff_attendance_2)
                return sav
            })
            const fresult1 = await Promise.all(data1);
            const fresult2 = await Promise.all(data2);
            fresult1.concat(fresult2)
            res.json({
                message: "Success", data: fresult1
            })
        }
    }

})
exports.createData = asyncHandler(async (req, res, next) => {
    const { school, group, members, name, day, month, year, absent, reason, checkRole } = req.body;
    const saving = (item) => {
        item.save()
            .then(() => {
                res.json({
                    message: "Success", data: item
                })
            })
    }
    // O'quvchidan boshqa barcha hodimlar uchun yo'lama qilish
    if (checkRole == "student") {
        const CHECK_STAFF = await Attendance.find({
            $and: [
                { school: { $eq: school } },
                { members: { $eq: members } },
                { group: { $eq: group } },
                { day: { $eq: day } },
                { month: { $eq: month } },
                { year: { $eq: year } }
            ]
        }).lean()
        if (CHECK_STAFF.length >= 1) {
            res.json({
                status: false,
                message: "Yo'qlama allaqachon qilingan"
            })
        } else {
            if (!reason && absent == "1") {
                const staff_attendance_1 = new Attendance({ school: school, group: group, members: members, name: name, day: day, month: month, year: year, absent: absent, })
                saving(staff_attendance_1)
            }
            if (reason && (absent == "0")) {
                const staff_attendance_2 = new Attendance({ school: school, group: group, members: members, name: name, day: day, month: month, year: year, absent: absent, reason: reason, })
                saving(staff_attendance_2)
            }
        }
    }
    // Faqat xodimlar uchun yo'qlama qilish
    if (checkRole == "staff") {
        const CHECK_STAFF = await Attendance.find({
            $and: [
                { school: { $eq: school } },
                { members: { $eq: members } },
                { day: { $eq: day } },
                { month: { $eq: month } },
                { year: { $eq: year } }
            ]
        }).lean()
        if (CHECK_STAFF.length >= 1) {
            res.json({
                status: false,
                message: "Yo'qlama allaqachon qilingan"
            })
        } else {
            if (!reason && absent == "1") {
                const staff_attendance_1 = new Attendance({ school: school, members: members, name: name, day: day, month: month, year: year, absent: absent, })
                saving(staff_attendance_1)
            }
            if (reason && absent == "0" || absent == "2" || absent == "3") {
                const staff_attendance_2 = new Attendance({ school: school, members: members, name: name, day: day, month: month, year: year, absent: absent, reason: reason, })
                saving(staff_attendance_2)
            }
        }
    }
});
exports.getAll = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Attendance, req, res, next)
    result.get_all(
        "school",
        "group",
        "members"
    )
});
exports.getOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Attendance, req, res, next)
    result.get_one(
        "school",
        "group",
        "members",
    )
});
exports.updateOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Attendance, req, res, next)
    result.update_content()
});
exports.deleteOne = asyncHandler(async (req, res, next) => {
    const result = new MyClass(Attendance, req, res, next)
    result.delete_data_without_file()
});

exports.filter_all = asyncHandler(async (req, res, next) => {

    pipeline = [
        {
            $match: {
                $and: [
                    { group: ObjectId(req.query.group) },
                    { month: req.query.month },
                    { year: req.query.year },
                ]
            }
        },
        {
            $group: {
                _id: "$members",
                user: {
                    $push: {
                        _id: "$_id",
                        absent: "$absent",
                        name: "$name",
                        reason: "$reason",
                        day: "$day",
                        absent: "$absent"
                    }
                }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "people",
            }
        },
        {
            $project: {
                name: { $arrayElemAt: ["$user.name", 0] },
                user: 1,

            }
        },
        {
            $sort: {
                name: 1
            }
        }

    ]
    const result = await Attendance.aggregate(pipeline)
    res.json({
        count: result.length,
        data: result
    })
});

exports.filter_by_user = asyncHandler(async (req, res, next) => {

    pipeline = [
        {
            $match: {
                $and: [
                    { members: ObjectId(req.query.members) },
                    { month: req.query.month },
                    { year: req.query.year },
                ]
            }
        },
        {
            $group: {
                _id: "$members",
                user: {
                    $push: {
                        _id: "$_id",
                        absent: "$absent",
                        name: "$name",
                        reason: "$reason",
                        day: "$day",
                        absent: "$absent"
                    }
                }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "people",
            }
        },
        {
            $project: {
                name: { $arrayElemAt: ["$user.name", 0] },
                user: 1,

            }
        },

    ]
    const result = await Attendance.aggregate(pipeline)
    res.json({
        count: result.length,
        data: result
    })
});

