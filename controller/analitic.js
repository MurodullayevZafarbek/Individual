const Lead = require('../model/lid');
const Group = require('../model/group');
const User = require('../model/user');
const asyncHandler = require('../middleware/async');
const ObjectId = require("mongodb").ObjectId;

// O'quvchilarni olish
exports.getAllUsers = asyncHandler(async (req, res, next) => {
    const { schoolId, role, actions } = req.query;
    const user = await User.find({
        $and: [
            { school: { $in: schoolId } },
            { role: { $eq: role } },
            { actions: { $eq: actions } },
        ]
    })
        .select({ name: 1 })
        .lean()
    res.json({ message: "Success", data: user })
});
// Manager uchun yonalish boyicha o'quvchilarni olish
exports.getStudentByCategory = asyncHandler(async (req, res, next) => {
    const { userId, category, speciality, actions } = req.query;
    const USERS = await User.aggregate([
        { $match: { _id: ObjectId(userId) } },
        { $project: { _id: 1, name: 1, passport: 1 } },
        {
            $lookup: {
                from: "schools",
                let: { manager: "$_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$manager", "$$manager"] } } },
                    { $project: { name: 1, _id: 1, passport: 1 } },
                    {
                        $lookup: {
                            from: "groups",
                            let: { school: "$_id" },
                            pipeline: [
                                {
                                    $match: {
                                        $and: [
                                            { $expr: { $eq: ["$school", "$$school"] } },
                                            { category: { $eq: ObjectId(category) } },
                                            { speciality: { $eq: ObjectId(speciality) } },
                                        ]
                                    }
                                },
                                { $project: { name: 1, speciality: 1, category: 1, passport: 1 } },
                                {
                                    $lookup: {
                                        from: "users",
                                        let: { group: "$_id" },
                                        pipeline: [
                                            {
                                                $match: {
                                                    $and: [
                                                        { role: { $eq: "student" } },
                                                        { actions: { $eq: actions } },
                                                    ]
                                                }
                                            },
                                            { $unwind: "$group" },
                                            { $match: { $expr: { $eq: ["$group", "$$group"] } } },
                                            { $project: { name: 1, _id: 1, passport: 1 } },
                                        ],
                                        as: "students",
                                    },
                                },
                                { $project: { students: 1, name: 1, passport: 1 } },

                            ],
                            as: "groups",
                        },
                    },



                ],
                as: "schools",
            },
        },
        {
            $group: {
                _id: null,
                student: {
                    $push: "$schools.groups.students"
                }
            }
        },

    ])
    res.json({ message: "Success", data: USERS })
})
// Admin uchun yonalish boyicha o'quvchilarni olish
exports.getStudentByCategories = asyncHandler(async (req, res, next) => {
    const { school, category, speciality, actions } = req.query;
    const USERS = await Group.aggregate([
        {
            $match: {
                $and: [
                    { school: { $eq: ObjectId(school) } },
                    { category: { $eq: ObjectId(category) } },
                    { speciality: { $eq: ObjectId(speciality) } },
                    { actions: "active" },
                ]
            }
        },
        {
            $lookup: {
                from: "users",
                let: { group: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $and: [
                                { role: { $eq: "student" } },
                                { actions: { $eq: actions } },
                            ]
                        }
                    },
                    { $unwind: "$group" },
                    { $match: { $expr: { $eq: ["$group", "$$group"] } } },
                    { $project: { name: 1, _id: 1, passport: 1 } },
                ],
                as: "students",
            },
        },
        {
            $group: {
                _id: null,
                student: {
                    $push: "$students"
                }
            }
        },



    ])
    res.json({ message: "Success", data: USERS })
})
// Barcha filiallarni olish
exports.getSchools = asyncHandler(async (req, res, next) => {
    const { userId, schoolAction } = req.query;
    const result = await User.aggregate([
        { $match: { _id: ObjectId(userId) } },
        { $project: { _id: 1, name: 1, } },
        {
            $lookup: {
                from: "schools",
                let: { manager: "$_id" },
                pipeline: [
                    { $project: { name: 1, manager: 1, actions: 1 } },
                    {
                        $match: {
                            $and: [
                                { $expr: { $eq: ["$manager", "$$manager"] } },
                                { actions: { $eq: schoolAction } }
                            ]
                        }
                    },
                ],
                as: "school",
            },
        },
    ])
    res.json({ message: "Success", data: result })
})
// guruhlarni olish
exports.getGroups = asyncHandler(async (req, res, next) => {
    const { schoolId, actions } = req.query;
    const groups = await Group.find({
        $and: [
            { school: { $in: schoolId } },
            { actions: { $eq: actions } },
        ]
    })
        .select({ name: 1 })
        .lean()
    res.json({ message: "Success", data: groups })
})
// Lidlar sonini olish
exports.getLeads = asyncHandler(async (req, res, next) => {
    const { school, status } = req.query;
    const leads = await Lead.find({
        $and: [
            { school: { $eq: school } },
            { status: { $eq: status } },
        ]
    })
        .select({ name: 1 })
        .lean()
    res.json({ message: "Success", data: leads })
})
// mentor o'zi dars beradigan o'quvchilarni olish
exports.mentorOwnStudent = asyncHandler(async (req, res, next) => {
    const { mentor, actions } = req.query
    const user = await User.findById({ _id: mentor }).select("group")
    const GROUP = user.group
    const result = await User.find({ group: { $in: GROUP }, role: "student", actions: { $eq: actions } }).lean().select("name")
    res.json({ message: "Success", count: result.length, data: result, })
});
