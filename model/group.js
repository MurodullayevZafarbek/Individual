const mongoose = require('mongoose')
// Guruhlar
const DefaultSchema = mongoose.Schema({
    school: { type: mongoose.Schema.ObjectId, ref: "school", required: true, index: true },
    room: { type: mongoose.Schema.ObjectId, ref: "room", required: true, index: true },
    category: { type: mongoose.Schema.ObjectId, ref: "category", required: true, index: true },
    speciality: { type: mongoose.Schema.ObjectId, ref: "speciality", required: true, index: true },
    name: { type: String, required: true },
    // guruhning oylik to'lovi
    payment: { type: String, required: true },
    group_startDate: { type: String, required: true }, // guruhning ochiladigan  sanasi
    group_endDate: { type: String, required: true }, // guruhning yopiladigan sanasi
    group_start_hour: {   // guruhning qaysi soatlarda dars boshlanishi
        type: String,
        enum: [
            "07:00",
            "07:30",
            "08:00",
            "08:30",
            "09:00",
            "09:30",
            "10:00",
            "10:30",
            "11:00",
            "11:30",
            "12:00",
            "12:30",
            "13:00",
            "13:30",
            "14:00",
            "14:30",
            "15:00",
            "15:30",
            "16:00",
            "16:30",
            "17:00",
            "17:30",
            "18:00",
            "18:30",
            "19:00",
            "19:30",
            "20:00",
            "20:30",
            "21:00",
            "21:30",
            "22:00",
            "22:30",
            "23:00",
            "23:30",
            "00:00",
        ],
        required: true
    },
    group_end_hour: { // guruhning qaysi soatlarda dars yakunlanishi
        type: String,
        enum: ["07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30", "00:00"],
        required: true
    },
    group_week: [{  // guruhning hafta kunlari davomidagi ish vaqti
        type: String, enum: ["1", "2", "3", "4", "5", "6", "7"], required: true
    }],
    group_lesson_duration: { // dars qancha vaqt davom etishi haqida malumot
        type: String,
        enum: [
            "1:00",
            "1:30",
            "2:00",
            "2:30",
            "3:00",
            "3:30",
            "4:00",
            "4:30",
            "5:00",
        ],
        required: true
    },
    status_default: {   // guruh statusi
        type: String,
        required: true,
        enum: [
            "none", // ochiq holatda
            "forever", // burunlay bloklangan
            "pending", // vaqtinchalik blokda
        ],
    },
    actions: {
        type: String,
        enum: [
            "active",
            "archive",
        ],
        default: "active"
    },
    color: { type: String, required: true }, // jadvalda rangi ajralib turishi uchun
    blocking_start_date: { type: String }, // vaqtinchalik bloklangan holatdagi BOSHLANG"ICH sana
    blocking_end_date: { type: String },  // vaqtinchalik bloklangan holatdagi YAKUNIY sana
}, {
    timestamps: true
})

module.exports = mongoose.model('group', DefaultSchema)