const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({

    name: { type: String, required: true, unique: true },
    imdbRating: Number,
    director: String,
    actor: [String],
    releaseYear: Number,
    awards: { type: [String], default: [] },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model('Movie', movieSchema)