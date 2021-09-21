const mongoose = require('mongoose')

const {validator} = require('../utils')
const {systemConfig} = require('../configs')

const authorSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: 'First name is required',
        trim: true,
    },
    lname: {
        type: String,
        required: 'Last name is required',
        trim: true,
    },
    title: {
        type: String,
        enum: systemConfig.titleEnumArray,
        required: 'Title is required',
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        validate: {validator: validator.validateEmail, message: 'Please fill a valid email address', isAsync: false},
        match: [validator.emailRegex, 'Please fill a valid email address']
    },
    password: {
        type: String,
        trim: true,
        required: 'Password is required'
    }
}, { timestamps: true })

module.exports = mongoose.model('Author', authorSchema, 'authors')