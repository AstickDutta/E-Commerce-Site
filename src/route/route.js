const express = require("express")
const router = express.Router()
const controllers = require("../controllers/userController")
const mid = require("../middleware/auth")






router.post("/register",controllers.createUser)
router.post("/login",controllers.loginUser)
router.get("/user/:userId/profile",mid.authenticate,controllers.getUserProfile)
router.put("/user/:userId/profile",mid.authenticate,mid.authorisation,controllers.updateProfile)


module.exports = router