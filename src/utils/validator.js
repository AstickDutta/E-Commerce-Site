const mongoose = require('mongoose')

const {systemConfig} = require('../configs')

const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const validateEmail = function(email) {
    return re.test(email)
};

const isValid = function(value) {
    if(typeof value === 'undefined' || value === null) return false
    if(typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidTitle = function(title) {
    return systemConfig.titleEnumArray.indexOf(title) !== -1
}

const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const isValidString = function(value) {
    return Object.prototype.toString.call(value) === "[object String]"
}

const isArray = function(arr) {
    return Array.isArray(arr)
}

module.exports = {
    validateEmail,
    emailRegex: re,
    isValid,
    isValidTitle,
    isValidRequestBody,
    isValidObjectId,
    isValidString,
    isArray
};