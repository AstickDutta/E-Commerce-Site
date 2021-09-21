const jwt = require('jsonwebtoken')

const {systemConfig} = require('../configs')

const createToken = async ({authorId}) => {
    try {
        const token = await jwt.sign({
            authorId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + systemConfig.jwtExpiry
        }, systemConfig.jwtSecretKey)
        return token
    } catch (error) {
        console.error(`Error! creating jwt token ${error.message}`);
        throw error;
    }
}

const verifyToken = async (token) => {
    try {
        const decoded = await jwt.verify(token, systemConfig.jwtSecretKey);
        return decoded
    } catch (error) {
        console.error(`Error! verifying jwt token ${error.message}`)
        throw error;
    }
}

module.exports = {
    createToken,
    verifyToken
}