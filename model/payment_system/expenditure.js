// Chiqimlar
const mongoose = require('mongoose')
const DefaultSchema = mongoose.Schema({
    school: {
        type: mongoose.Schema.ObjectId,
        ref: "school",
        required: true,
        index: true
    },
    // qaysi oy uchun tolanadi
    month: {
        type: String,
        enum: [
            "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"
        ],
        required: true
    },
    // qaysi yil uchun tolanadi
    year: {
        type: String,
        enum: ["2022", "2023", "2024", "2025"],
        required: true
    },
    service: {
        type: String,
        enum: [
            "1", // yillik bir martalik davlat uxhun tolanadigan soliq
            "2", // elektr-energiyasi
            "3", // gaz
            "4", // suv
            "5", // jot uchun arenda to'lovi
            "6", // daromad soligi
            "7", // oylik maoshlar 
            // "8",
            // "9",
            // "10",
            // "11",
            // "12",
            // "13",
            // "14",
            // "15",
            // "16",
            // "17",
            // "18",
            // "19",
            // "20",
        ],
        required: true
    },
    // chiqim summasi
    expenditure_amount: {
        type: Number,
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('expenditure', DefaultSchema)