const movieModel = require('../models/movieModel')
//Scroll down for pointers

let createMovie = async function (req, res) {
    try {
        if (req.body && Object.keys(req.body).length > 0) {
            let movie = await movieModel.create(req.body)
            res.status(201).send({ status: true, data: movie })
        } else {
            //handles null/undefined/empty request body
            res.status(400).send({ status: false, msg: 'Request must contain a body' })
        }
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

let getMovies = async function (req, res) {
    try {
        //Only return the movies that are valid (not deleted)
        let movies = await movieModel.find({ isDeleted: false })
        if (movies && movies.length > 0) {
            res.status(200).send({ status: true, data: movies })
        } else {
            res.status(404).send({ status: false, msg: 'No movies found' })
        }
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

let updateMovie = async function (req, res) {
    //Only update the movies that are valid (not deleted)
    try {
        if (req.params.movieId && req.body.imdbRating && req.body.actor) {
            let updatedMovie = await movieModel.findOneAndUpdate({ _id: req.params.movieId , isDeleted: false},
                { $set: { imdbRating: req.body.imdbRating }, $push: { actor: req.body.actor } },
                { new: true })
            if (updatedMovie) {
                return res.status(200).send({ status: true, data: updatedMovie })
            } else {
                res.status(404).send({ status: false, msg: "Movie not found" })
            }
        } else {
            //For this question, the update to a movie has to happen on both these fields together
            res.status(400).send({ status: false, msg: "Request must have the movieId in params and imdb rating & a new actor in the request body" })
        }
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

let deleteMovie = async function(req, res){
try {
    //Only delete the movies that are valid (not deleted already)
    if (req.params.movieId) {
        let deletedMovie = await movieModel.findOneAndUpdate({ _id: req.params.movieId, isDeleted: false },
            { $set: { isDeleted: true }},
            { new: true })
        if (deletedMovie) {
            return res.status(200).send({ status: true, data: deletedMovie })
        } else {
            res.status(404).send({ status: false, msg: "Movie not found" })
        }
    } else {
        res.status(400).send({ status: false, msg: "Request must have the movieId" })
    }
} catch(error) {
    res.status(500).send({ status: false, msg: error.message })
}
}

module.exports.createMovie = createMovie
module.exports.getMovies = getMovies
module.exports.updateMovie = updateMovie
module.exports.deleteMovie = deleteMovie

//For update api - try using update, updateOne instead of findOneAndUpdate. Check what do you see in Postman
//Also remove {new: true} and see what happens to the response body in Postman. Do you see updated fields?
//Delete a movie
//Try deleting the same movie again. What happens? Check what code is responsible for the output you see
//Try updating a deleted movie
//Get all the movies. Do you see deleted movies in the result? Why is that so?
//What happens if you delete all the movies and then hit get movies api?
