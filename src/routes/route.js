const express = require('express');

const movieController = require('../controllers/movieController')
const userController = require('../controllers/userController')

const router = express.Router();

// Movie routes
router.post('/movies', movieController.createMovie)
router.get('/movies', movieController.getMovies)
router.put('/movies/:movieId', movieController.updateMovie)
router.delete('/movies/:movieId', movieController.deleteMovie)

// User routes
router.post('/users', userController.registerUser)
router.get('/users', userController.getUsers)
router.post('/login', userController.loginUser)
router.get('/users/:userId', userController.getUserDetails)

module.exports = router;