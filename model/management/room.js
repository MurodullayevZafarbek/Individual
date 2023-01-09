const mongoose = require('mongoose')
// Filialning xonalari
const DefaultSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    school: {
        type: mongoose.Schema.ObjectId,
        ref: "school",
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

module.exports = mongoose.model('room', DefaultSchema)