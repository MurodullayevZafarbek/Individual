//  @Description: Qilinadigan to'lovlar uchun - KIRIM

const mongoose = require('mongoose')
const DefaultSchema = mongoose.Schema({
    school: { type: mongoose.Schema.ObjectId, ref: "school", index: true },
    category: { type: mongoose.Schema.ObjectId, ref: "category", index: true },
    speciality: { type: mongoose.Schema.ObjectId, ref: "speciality", index: true },
    group: { type: mongoose.Schema.ObjectId, ref: "group", index: true },
    user: { type: mongoose.Schema.ObjectId, ref: "user", required: true, index: true },
    day: {
        type: String,
        enum: [
            "1", "11", "21", "31",
            "2", "12", "22",
            "3", "13", "23",
            "4", "14", "24",
            "5", "15", "25",
            "6", "16", "26",
            "7", "17", "27",
            "8", "18", "28",
            "9", "19", "29",
            "10", "20", "30",
        ]
    },
    month: {
        type: String,
        enum: [
            "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"
        ],
        required: true
    },
    year: {
        type: String,
        enum: ["2022", "2023", "2024", "2025"],
        required: true
    },
    status: {
        type: String,
        enum: [
            "debtor",
            "no_debtor",
        ],
        required: true
    },
    payment_type: {
        type: String,
        required: true,
        enum: [
            "1", // o'quvchilar kurs uchun qilgan to'lovlari uchun
            "2", // online video kurslarni sotib olganlik uchun qilinadigan to'lovlar
            "3", // hayr exson qilinadigan to'lovlar
        ]
    },
    payment_system: {
        type: String,
        enum: [
            "account_number", // bank hisob raqami orqali to'langan
            "cash", // naqd pulda to'langan
            "card", // plastik orqali to'langan
        ],
        required: true
    },
    // To'langan summa yoziladi
    amount: {
        type: String, required: true
    },
    // Qarzdor bo'lgan summa yoziladi
    reminderSumm: {
        type: String,
    },
    discountSumm: {
        type: String,
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('income', DefaultSchema)