const School = require('../model/school');
const cron = require('node-cron');
const axios = require("axios");
 

const sendSMS = async () => {
    cron.schedule("30 58 15 * * *", async () => { // har 1 daqiqada
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
        const data = result.map((item) => {
            return {
                phone: item.phone.split("-").join(""),
                username: item.username,
                school: item.school,
                speciality: item.speciality,
                date: item.date,
            }
        })
        console.log(today.toLocaleString())
    });
}





const startCron = () => {
    // sendSMS()
}

module.exports = startCron
