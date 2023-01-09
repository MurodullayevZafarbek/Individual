const mongoose = require('mongoose')
// Oylik maoshlasr
const DefaultSchema = mongoose.Schema({
    member: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: true,
        index: true
    },
    school: {
        type: mongoose.Schema.ObjectId,
        ref: "school",
        index: true
    },
    group: {
        type: mongoose.Schema.ObjectId,
        ref: "group",
        index: true
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
    payment_system: {
        type: String, required: true,
        enum: [
            "account_number",
            "cash",
            "card",
        ]
    },
    salary_type: {
        type: String,
        enum: [
            "percentage",
            "per_person",
            "default_salary",
        ]
    },
    /*
        1. Foizga ishlaydiganlar uchun oylik yozish
        2. Bitta o'quvchi boshiga belgilangan marx boyicha oylik olish
        3. Har qanday xodimga umumiy belgilangan maosh yoziladi
    */
    salary: {
        default: [
            {
                PAID_MONEY: { type: Number, },
                REMINDER_MONEY: { type: Number, },
                TOTAL_GROUP_MONEY: { type: Number, },
                SCHOOL_SIDE: { type: Number, },
                STAFF_SIDE: { type: Number, },
            }
        ],
        result: [
            {
                _id: { type: String, },
                total: [
                    {
                        student: { type: String, },
                        paid: { type: Number, },
                        reminder: { type: Number, },
                    }
                ]
            }
        ]
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('salary', DefaultSchema)