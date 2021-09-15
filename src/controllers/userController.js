const jwt = require('jsonwebtoken')
//Scroll down for pointers

const userModel = require('../models/userModel')
let registerUser = async function (req, res) {
    try {
        if (req.body && Object.keys(req.body).length > 0) {
            let user = await userModel.create(req.body)
            res.status(201).send({ status: true, data: user })
        } else {
            //handles null/undefined/empty request body
            res.status(400).send({ status: false, msg: 'Request must contain a body' })
        }
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

//This api won't be called from a user app. Why? 
//An api like this is called from softwares other than a user specific app
let getUsers = async function (req, res) {
    try {
        let users = await userModel.find({ isDeleted: false }, { createdAt: 0, updatedAt: 0, __v: 0, _id: 0 })
        if (users && users.length > 0) {
            res.status(200).send({ status: true, data: users })
        } else {
            res.status(404).send({ status: false, msg: "No users found" })
        }
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}



//YAGNI - You ain't gonna need it// keep it simple at present.
//TODO: Check whats the problem with document as a payload. We discuss this tomorrow
let loginUser = async function (req, res) {
    try {
        if (req.body && req.body.userName && req.body.password) {
            let user = await userModel.findOne({ name: req.body.userName, password: req.body.password, isDeleted: false }, { createdAt: 0, updatedAt: 0, __v: 0 })//10 fields total -> 2 include
            if (user) {
                let payload = { _id: user._id }
                let token = jwt.sign(payload, 'mysecretkey')

                res.header('x-auth-token', token)//adds a new header to your response.
                res.status(200).send({ status: true })
            } else {
                res.status(401).send({ status: false, msg: "Invalid username or password" })
            }
        } else {
            res.status(400).send({ status: false, msg: "Request body must contain userName as well as password" })
        }
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

//If logged-in user request for an api that fetches/modifies a users data
//  a) - check if the token receievd in request header is valid
//  b) - check if the userId in token is same as the userId recieved in request

//Apis we will create
//1. user details
//2. user updates his mobile number


//TOKEN GENERATION - This is done so that we use this token to check whether the right user is requesting for an api. A valid user means, the logged in user is asking to view/edit his own data and not some other user's
// 1. user1 tries to log in on his device with his credentials
// 2. server recieves the login request and validates the credentials
// 3. if credentials match then a token is sent in a response header
// 4. user1 ka app stores this token locally
// 5. this token is sent in request header in apis thereafter


//TOKEN VALIDATION -
// 1. every api other than public ones (login, register etc) recieves token in header
// 2. the token is checked. If it is a valid token, then the userIds are compared next
// 3. If the userIds match, then the actual api logic is run
// 4. the above 3 steps are performed for multiple apis that view/modify a user's data
// 5. do we write the same steps in every api or we write it at one common place and call it before these apis. 


let getUserDetails = async function (req, res) {
    try {
        let token = req.headers['x-auth-token']
        let validToken = jwt.verify(token, 'mysecretkey')//test by setting this header in postman to an empty value or an invalid string like 'abcd'
        if (validToken) {
            if (validToken._id == req.params.userId) {//logged in user is requesting this api for his own data
                let user = await userModel.findOne({ _id: req.params.userId, isDeleted: false })
                if (user) {
                    res.status(200).send({ status: true, data: user })
                } else {
                    res.status(404).send({ status: false, msg: "User not found" })
                }
            } else {
                res.status(403).send({ status: false, msg: "Not authorized" })
            }
        } else {
            res.status(401).send({ status: false, msg: "Invalid token" })
        }
    } catch (error) {
        res.status(500).send({ staus: false, msg: error.message })
    }
}

module.exports.registerUser = registerUser//token in request? No
module.exports.getUsers = getUsers//token? No
module.exports.loginUser = loginUser//token? No
module.exports.getUserDetails = getUserDetails// use specific operation. token? Yes

// RECAP: 
//Other user specific operations that contain logged-in user's info(jwt token)- update profile, delete profile, create a post, send a friend request  
//How do we check if the user who is logged in is requesting for an operation to be performed on his own data or some other user?
//We compare his token and the userId specified in the requests

//New things learnt today:
//jwt - what are they? what functions we have with jsonwebtoken - sign and verify
//What is a valid token ? check yourself
//return res - when to return and when it gets returned by itself?

//middleware for jwt token validations - ? 


