const mongoose = require('mongoose')
const discountSchema = mongoose.Schema({
    status: {
        type: String,
        enum: [
            "1", // Bir nechta fanga qatnashgani uchun qaysidir fan uchun bonus
            "2", // Bir oiladan bir nechta farzand uchun nechtadir fanga bonus qilish
            "3", // Hech qanday sabablarsiz
        ]
    },
    user: { type: mongoose.Schema.ObjectId, ref: "user" }, // student's id
    group: { type: mongoose.Schema.ObjectId, ref: "group" }, // student's group
    category: { type: mongoose.Schema.ObjectId, ref: "category" }, // group's category
    speciality: { type: mongoose.Schema.ObjectId, ref: "speciality" }, // category's speciality
    percentage: { type: String },
    actions: {
        type: String,
        enum: [
            "active",
            "archive",
        ],
        default: "active"
    },
}, {
    timestamps: true
})
module.exports = mongoose.model('discount', discountSchema)