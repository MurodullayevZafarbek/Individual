const mongoose = require('mongoose')
// Viloyatlar
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

module.exports = mongoose.model('region', DefaultSchema)