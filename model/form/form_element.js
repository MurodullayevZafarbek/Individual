const mongoose = require('mongoose')
const DefaultSchema = mongoose.Schema({
    school: { type: mongoose.Schema.ObjectId, ref: "school", required: true },
    form: { type: mongoose.Schema.ObjectId, ref: "form", required: true },
    firsname: { type: String, required: true, },
    lastname: { type: String, required: true, },
    phone_number_1: { type: String, required: true, },
    phone_number_2: { type: String, },
    status: { type: String, enum: ["0", "1"], default: "0" },
}, {
    timestamps: true
})
module.exports = mongoose.model('form_element', DefaultSchema)