const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const {validator} = require('../utils')
const {systemConfig} = require('../configs')
const {authorModel, blogModel} = require('../models')

const createBlog = async function (req, res) {
    try {
        const requestBody = req.body;

        if(!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({status: false, message: 'Invalid request parameters. Please provide blog details'})
            return
        }

        // Extract params
        const {title, body, authorId, tags, category, subcategory, isPublished} = requestBody;
        
        // Validation starts
        if(!validator.isValid(title)) {
            res.status(400).send({status: false, message: 'Blog Title is required'})
            return
        }

        if(!validator.isValid(body)) {
            res.status(400).send({status: false, message: 'Blog body is required'})
            return
        }
        
        if(!validator.isValid(authorId)) {
            res.status(400).send({status: false, message: 'Author id is required'})
            return
        }

        if(!validator.isValid(authorId)) {
            res.status(400).send({status: false, message: 'Author id is required'})
            return
        }

        if(!validator.isValidObjectId(authorId)) {
            res.status(400).send({status: false, message: `${authorId} is not a valid author id`})
            return
        }

        if(!validator.isValid(category)) {
            res.status(400).send({status: false, message: 'Blog category is required'})
            return
        }

        const author = await authorModel.findById(authorId);

        if(!author) {
            res.status(400).send({status: false, message: `Author does not exit`})
            return
        }
        // Validation ends
        
        const blogData = {
            title,
            body,
            authorId,
            category,
            isPublished: isPublished ? isPublished : false,
            publishedAt: isPublished ? new Date() : null
        }

        if(tags) {
            if(validator.isArray(tags)) {
                blogData['tags'] = [...tags]
            }
            if(validator.isValidString(tags)) {
                blogData['tags'] = [ tags ]
            }
        }

        if(subcategory) {
            if(validator.isArray(subcategory)) {
                blogData['subcategory'] = [...subcategory]
            }
            if(validator.isValidString(subcategory)) {
                blogData['subcategory'] = [ subcategory ]
            }
        }

        const newBlog = await blogModel.create(blogData)
        res.status(201).send({status: true, message: 'New blog created successfully', data: newBlog})
    } catch (error) {
        console.log(error)
        res.status(500).send({status: false, message: error.message});
    }
}

const listBlog = async function (req, res) {
    try {
        const filterQuery = {isDeleted: false, deletedAt: null, isPublished: true}
        const queryParams = req.query

        if(validator.isValidRequestBody(queryParams)) {
            const {authorId, category, tags, subcategory} = queryParams

            if(validator.isValid(authorId) && validator.isValidObjectId(authorId)) {
                filterQuery['authorId'] = authorId
            }

            if(validator.isValid(category)) {
                filterQuery['category'] = category.trim()
            }

            if(validator.isValid(tags)) {
                const tagsArr = tags.trim().split(',').map(tag => tag.trim());
                filterQuery['tags'] = {$all: tagsArr}
            }
            
            if(validator.isValid(subcategory)) {
                const subcatArr = subcategory.trim().split(',').map(subcat => subcat.trim());
                filterQuery['subcategory'] = {$all: subcatArr}
            }
        }

        const blogs = await blogModel.find(filterQuery)
        
        if(Array.isArray(blogs) && blogs.length === 0) {
            res.status(404).send({status: false, message: 'No blogs found'})
            return
        }

        res.status(200).send({status: true, message: 'Blogs list', data: blogs})
    } catch (error) {
        res.status(500).send({status: false, message: error.message});
    }
}

const updateBlog = async function (req, res) {
    try {
        const requestBody = req.body
        const params = req.params
        const blogId = params.blogId
        const authorIdFromToken = req.authorId
        
        // Validation stats
        if(!validator.isValidObjectId(blogId)) {
            res.status(400).send({status: false, message: `${blogId} is not a valid blog id`})
            return
        }

        if(!validator.isValidObjectId(authorIdFromToken)) {
            res.status(400).send({status: false, message: `${authorIdFromToken} is not a valid token id`})
            return
        }

        const blog = await blogModel.findOne({_id: blogId, isDeleted: false, deletedAt: null })

        if(!blog) {
            res.status(404).send({status: false, message: `Blog not found`})
            return
        }
        
        if(blog.authorId.toString() !== authorIdFromToken) {
            res.status(401).send({status: false, message: `Unauthorized access! Owner info doesn't match`});
            return
        }

        if(!validator.isValidRequestBody(requestBody)) {
            res.status(200).send({status: true, message: 'No paramateres passed. Blog unmodified', data: blog})
            return
        }

        // Extract params
        const {title, body, tags, category, subcategory, isPublished} = requestBody;

        const updatedBlogData = {}

        if(validator.isValid(title)) {
            if(!Object.prototype.hasOwnProperty.call(updatedBlogData, '$set')) updatedBlogData['$set'] = {}

            updatedBlogData['$set']['title'] = title
        }

        if(validator.isValid(body)) {
            if(!Object.prototype.hasOwnProperty.call(updatedBlogData, '$set')) updatedBlogData['$set'] = {}

            updatedBlogData['$set']['body'] = body
        }

        if(validator.isValid(category)) {
            if(!Object.prototype.hasOwnProperty.call(updatedBlogData, '$set')) updatedBlogData['$set'] = {}

            updatedBlogData['$set']['category'] = category
        }

        if(isPublished !== undefined) {
            if(!Object.prototype.hasOwnProperty.call(updatedBlogData, '$set')) updatedBlogData['$set'] = {}

            updatedBlogData['$set']['isPublished'] = isPublished
            updatedBlogData['$set']['publishedAt'] = isPublished ? new Date() : null
        }
        
        if(tags) {
            if(!Object.prototype.hasOwnProperty.call(updatedBlogData, '$addToSet')) updatedBlogData['$addToSet'] = {}
            
            if(validator.isArray(tags)) {
                updatedBlogData['$addToSet']['tags'] = { $each: [...tags]}
            }
            if(validator.isValidString(tags)) {
                updatedBlogData['$addToSet']['tags'] = tags
            }
        }

        if(subcategory) {
            if(!Object.prototype.hasOwnProperty.call(updatedBlogData, '$addToSet')) updatedBlogData['$addToSet'] = {}
            if(validator.isArray(subcategory)) {
                updatedBlogData['$addToSet']['subcategory'] = { $each: [...subcategory]}
            }
            if(validator.isValidString(subcategory)) {
                updatedBlogData['$addToSet']['subcategory'] = subcategory
            }
        }

        const updatedBlog = await blogModel.findOneAndUpdate({_id: blogId}, updatedBlogData, {new: true})

        res.status(200).send({status: true, message: 'Blog updated successfully', data: updatedBlog});
    } catch (error) {
        res.status(500).send({status: false, message: error.message});
    }
}

const deleteBlogByID = async function (req, res) {
    try {
        const params = req.params
        const blogId = params.blogId
        const authorIdFromToken = req.authorId

        if(!validator.isValidObjectId(blogId)) {
            res.status(400).send({status: false, message: `${blogId} is not a valid blog id`})
        }

        if(!validator.isValidObjectId(authorIdFromToken)) {
            res.status(400).send({status: false, message: `${authorIdFromToken} is not a valid token id`})
        }

        const blog = await blogModel.findOne({_id: blogId, isDeleted: false, deletedAt: null })
        // const blog = await blogModel.findOne({_id: blogId})

        if(!blog) {
            res.status(404).send({status: false, message: `Blog not found`})
        }

        // if(blog.isDeleted && deletedAt !== null) {
        //     res.status(404).send({status: false, message: `Blog is already deleted.`}) 
        // }

        if(blog.authorId.toString() !== authorIdFromToken) {
            res.status(401).send({status: false, message: `Unauthorized access! Owner info doesn't match`});
        }

        await blogModel.findOneAndUpdate({_id: blogId}, {$set: {isDeleted: true, deletedAt: new Date()}})
        res.status(200).send({status: true, message: `Blog deleted successfully`})
    } catch (error) {
        res.status(500).send({status: false, message: error.message});
    }
}

const deleteBlogByParams = async function (req, res) {
    try {
        const filterQuery = {isDeleted: false, deletedAt: null}
        const queryParams = req.query
        const authorIdFromToken = req.authorId

        if(!validator.isValidObjectId(authorIdFromToken)) {
            res.status(400).send({status: false, message: `${authorIdFromToken} is not a valid token id`})
            return
        }

        if(!validator.isValidRequestBody(queryParams)) {
            res.status(400).send({status: false, message: `No query params received. Aborting delete operation`})
            return
        }

        const {authorId, category, tags, subcategory, isPublished} = queryParams

        if(validator.isValid(authorId) && validator.isValidObjectId(authorId)) {
            filterQuery['authorId'] = authorId
        }

        if(validator.isValid(category)) {
            filterQuery['category'] = category.trim()
        }

        if(validator.isValid(isPublished)) {
            filterQuery['isPublished'] = isPublished
        }

        if(validator.isValid(tags)) {
            const tagsArr = tags.trim().split(',').map(tag => tag.trim());
            filterQuery['tags'] = {$all: tagsArr}
        }
        
        if(validator.isValid(subcategory)) {
            const subcatArr = subcategory.trim().split(',').map(subcat => subcat.trim());
            filterQuery['subcategory'] = {$all: subcatArr}
        }

        const blogs = await blogModel.find(filterQuery);

        if(Array.isArray(blogs) && blogs.length === 0) {
            res.status(404).send({status: false, message: 'No matching blogs found'})
        }

        const idsOfBlogsToDelete = blogs.map(blog => {
            if(blog.authorId.toString() === authorIdFromToken) return blog._id
        })

        if(idsOfBlogsToDelete.length === 0) {
            res.status(404).send({status: false, message: 'No blogs found'})
        }

        await blogModel.updateMany({_id: {$in: idsOfBlogsToDelete}}, {$set: {isDeleted: true, deletedAt: new Date()}})

        res.status(200).send({status: true, message: 'Blog(s) deleted successfully'});
    } catch (error) {
        res.status(500).send({status: false, message: error.message});
    }
}

module.exports = {
    createBlog,
    listBlog,
    updateBlog,
    deleteBlogByID,
    deleteBlogByParams
}
