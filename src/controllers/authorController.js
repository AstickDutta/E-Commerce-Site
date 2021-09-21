const {validator, jwt} = require('../utils')
const {systemConfig} = require('../configs')
const {authorModel} = require('../models')

const registerAuthor = async function (req, res) {
    try {
        const requestBody = req.body;
        if(!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({status: false, message: 'Invalid request parameters. Please provide author details'})
            return
        }

        // Extract params
        const {fname, lname, title, email, password} = requestBody; // Object destructing

        // Validation starts
        if(!validator.isValid(fname)) {
            res.status(400).send({status: false, message: 'First name is required'})
            return
        }

        if(!validator.isValid(lname)) {
            res.status(400).send({status: false, message: 'Last name is required'})
            return
        }

        if(!validator.isValid(title)) {
            res.status(400).send({status: false, message: 'Title is required'})
            return
        }
        
        if(!validator.isValidTitle(title)) {
            res.status(400).send({status: false, message: `Title should be among ${systemConfig.titleEnumArray.join(', ')}`})
            return
        }

        if(!validator.isValid(email)) {
            res.status(400).send({status: false, message: `Email is required`})
            return
        }
        
        if(!validator.validateEmail(email)) {
            res.status(400).send({status: false, message: `Email should be a valid email address`})
            return
        }

        if(!validator.isValid(password)) {
            res.status(400).send({status: false, message: `Password is required`})
            return
        }
        
        const isEmailAlreadyUsed = await authorModel.findOne({email}); // {email: email} object shorthand property

        if(isEmailAlreadyUsed) {
            res.status(400).send({status: false, message: `${email} email address is already registered`})
            return
        }
        // Validation ends

        const authorData = {fname, lname, title, email, password}
        const newAuthor = await authorModel.create(authorData);

        res.status(201).send({status: true, message: `Author created successfully`, data: newAuthor});
    } catch (error) {
        res.status(500).send({status: false, message: error.message});
    }
}

const loginAuthor = async function (req, res) {
    try {
        const requestBody = req.body;
        if(!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({status: false, message: 'Invalid request parameters. Please provide login details'})
            return
        }

        // Extract params
        const {email, password} = requestBody;
        
        // Validation starts
        if(!validator.isValid(email)) {
            res.status(400).send({status: false, message: `Email is required`})
            return
        }
        
        if(!validator.validateEmail(email)) {
            res.status(400).send({status: false, message: `Email should be a valid email address`})
            return
        }

        if(!validator.isValid(password)) {
            res.status(400).send({status: false, message: `Password is required`})
            return
        }
        // Validation ends

        const author = await authorModel.findOne({email, password});

        if(!author) {
            res.status(401).send({status: false, message: `Invalid login credentials`});
            return
        }

        const token = await jwt.createToken({authorId: author._id});

        res.header('x-api-key', token);
        res.status(200).send({status: true, message: `Author login successfull`, data: {token}});
    } catch (error) {
        res.status(500).send({status: false, message: error.message});
    }
}

module.exports = {
    registerAuthor,
    loginAuthor
}
