const {jwt} = require('../utils')

const autherAuth = async (req, res, next) => {
    try {
        const token = req.header('x-api-key')
        if(!token) {
            res.status(403).send({status: false, message: `Missing authentication token in request`})
            return;
        }

        const decoded = await jwt.verifyToken(token);

        if(!decoded) {
            res.status(403).send({status: false, message: `Invalid authentication token in request`})
            return;
        }

        req.authorId = decoded.authorId;

        next()
    } catch (error) {
        console.error(`Error! ${error.message}`)
        res.status(500).send({status: false, message: error.message})
    }
}

module.exports = autherAuth