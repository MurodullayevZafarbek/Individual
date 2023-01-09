// O'quvchi va xodimlar uchun umumiy davomad qilish
const mongoose = require('mongoose')
const DefaultSchema = mongoose.Schema({
    school: {
        type: mongoose.Schema.ObjectId,
        ref: "school",
        required: true,
        index: true
    },
    group: {
        type: mongoose.Schema.ObjectId,
        ref: "group",
        index: true
    },
    members: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        index: true,
        required: true
    },
    // jamoa azozsi agar ochib ketadigan bolsa shu yerga ismi yoziladi
    name: {
        type: String, required: true,
    },
    day: {
        type: String, required: true,
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
        type: String, required: true,
        enum: [
            "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"
        ]
    },
    year: {
        type: String, required: true,
        enum: ["2022", "2023", "2024", "2025"]
    },
    absent: {
        type: String,
        required: true,
        enum: [
            "0",// kelmagan 
            "1" // kelgan
        ]
    },
    reason: [{
        type: String,
        enum: [
            "0",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
        ]
    }]
}, {
    timestamps: true
})

module.exports = mongoose.model('attendance', DefaultSchema)