const mongoose = require('mongoose')
// Yo'nalishlar
const DefaultSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    region: {
        type: mongoose.Schema.ObjectId,
        ref: "region",
        required: true,
        index: true
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

module.exports = mongoose.model('district', DefaultSchema)