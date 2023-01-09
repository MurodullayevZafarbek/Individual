const mongoose = require('mongoose')
// Kategoriyalar
const DefaultSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
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

module.exports = mongoose.model('category', DefaultSchema)