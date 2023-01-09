const mongoose = require('mongoose')
const DefaultSchema = mongoose.Schema({
    school: { type: mongoose.Schema.ObjectId, ref: "school", required: true }, // qaysi filial uchun anketa qoldirish
    name: { type: String, required: true, }, // anketani nom berish
    url: { type: String, required: true }, // anketa uchun link manzili berish
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
module.exports = mongoose.model('form', DefaultSchema)