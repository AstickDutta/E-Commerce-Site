const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    name: { type: String, required: true, unique: true },
    mobile: {type: Number, required: true, unique: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)