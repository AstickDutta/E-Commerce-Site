const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({

    // attribute : type
    // OR
    // attribute : { type: <data type>, validation1, validation2, etc}
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model('Movie', movieSchema)