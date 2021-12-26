const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const blogModel = require("../models/blogModel")
const authorModel = require("../models/authorsModel")
const funcValidator = require("../validations/validator")


//create new blog
const createBlog = async (req, res) => {
    try {
        if (!funcValidator.isValidRequestBody(req.body)) {
            return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide blog details' })
        }

        // Extracting containt of body to validate
        const { title, body, authorId, tags, category, subcategory } = req.body;

        if (!funcValidator.isValid(authorId) || !funcValidator.isValidObjectId(authorId)) {
            res.status(400).send({ status: false, message: 'Author id is required' })
            return
        }

        // cheacking if author is present with given authorId or not
        const author = await authorModel.findById(authorId);

        if (!author) {
            return res.status(400).send({ status: false, msg: `Invalid AuthorId,no Author exist with the provided AuthorId` })
        }

        //cheacking if logged in author creating blog by his own id or not
        if (!(authorId.toString() === (req.validToken._id).toString()))
            return res.send({ status: false, msg: "Authorization Denide" })//provide ur authorId

        //checking all mandetory things through is valid function
        if (!funcValidator.isValid(title)) {
            return res.status(400).send({ status: false, message: 'Blog Title is required' })
        }

        if (!funcValidator.isValid(body)) {
            return res.status(400).send({ status: false, message: 'Blog body is required' })
        }

        if (!funcValidator.isValid(category)) {
            return res.status(400).send({ status: false, message: 'Blog category is required' })

        }

        //now we will check non mandetry things,because first we have to check wheather value of nan mandetory thing is coming or not if coming then we will validate it

        const blogData = {
            title,
            body,
            authorId,
            category,
        }

        if (tags) {
            if (Array.isArray(tags) && tags.length > 0) {
                blogData['tags'] = tags
            }
            //is someone has given single tag and forget to give it in array
            //tags="nature"
            if (typeof (tags) === String && funcValidator.isValid(tags)) {
                blogData['tags'] = [tags]
            }
        }

        if (subcategory) {
            if (Array.isArray(subcategory) && subcategory.length > 0) {
                blogData['subcategory'] = subcategory
            }
            if (typeof (subcategory) === String && funcValidator.isValid(subcategory)) {
                blogData['subcategory'] = [subcategory]
            }
        }

        const newBlog = await blogModel.create(blogData)
        res.status(201).send({ status: true, message: 'New blog created successfully', data: newBlog })

    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, msg: err.message })
    }
};


//Q4-
const updateDetails = async function (req, res) {

    try {
        if (!funcValidator.isValidObjectId(req.params.blogId)) {
            res.status(400).send({ status: false, message: `${req.params.blogId} is not a valid blog id` })
            return
        }
        const blog = await blogModel.findOne({ _id: req.params.blogId, isDeleted: false })

        if (!blog) {
            res.status(404).send({ status: false, msg: "no such blog found to update" })
            return
        }
        if (!((blog.authorId).toString() === (req.validToken._id).toString())) {
            res.status(400).send({ status: false, msg: "Authorization Denide ur ot valid author to update this blog" })
            return
        }

        if (!funcValidator.isValidRequestBody(req.body)) {
            return res.status(400).send({ status: false, message: 'Body is empty' })

        }
        const { title, body, tags, category, subcategory, isPublished } = req.body

        let updateBlog = new Object;
        if (title) {
            if (!funcValidator.isValid(title)) {
                return res.status(400).send({ status: false, message: 'title is not valid' })
            }
            updateBlog["title"] = title
        }
 
        if (body) {
            if (!funcValidator.isValid(body)) {
                return res.status(400).send({ status: false, message: 'title is not body' })
            }
            updateBlog["body"] = body
        }

        if (category) {
            if (!funcValidator.isValid(category)) {
                return res.status(400).send({ status: false, message: 'valid category is required' })
            }
            updateBlog["category"] = category
        }

        if (isPublished) {
            if(isPublished !==true) 
            return res.status(400).send({ status: false, message: 'only boolean value is accepted' })
            updateBlog["isPublished"] = true;
            updateBlog["publishedAt"] = new Date();
        }
        //for adding value in array with otherthings our update blog should look like this
        // updateBlog={ $addToSet:{ tags: req.body.tags ,subcategory: req.body.subcategory},title:req.body.title }

        updateBlog["$addToSet"] = {}

        if (tags) {
            if (Array.isArray(tags) && tags.length > 0) {
                updateBlog.$addToSet["tags"] = tags
            }
            else if(Array.isArray(tags) && tags.length === 0){
                return res.status(400).send({status:false,msg:"invalid input tags"})
            }
            else if (Object.prototype.toString.call(tags) === "[object String]" && funcValidator.isValid(tags)) {
                updateBlog["$addToSet"]["tags"] = [tags]
            }
            else{
                return res.status(400).send({status:false,msg:"invalid input tags"})
            }
        }  

        if (subcategory) {
            if (Array.isArray(subcategory) && subcategory.length > 0) {
                updateBlog.$addToSet["subcategory"] = subcategory
            }
            else if(Array.isArray(subcategory) && subcategory.length === 0){
                return res.status(400).send({status:false,msg:"invalid input subcategory"})
            }
            else if (typeof (subcategory) === "string" && funcValidator.isValid(subcategory)) {
                updateBlog.$addToSet["subcategory"] = [subcategory]
            }
            else{
                return res.status(400).send({status:false,msg:"invalid input subcategory"})
            }
        }
        
       
        let updatedBlog = await blogModel.findOneAndUpdate({_id:req.params.blogId,isDeleted:false}, updateBlog, { new: true })

        if (updatedBlog) {
            return res.status(201).send({ status: true, msg: "data updated successfully", updatedData: updatedBlog })
        } else {
            return res.status(404).send({ status: false, msg: "no such blog exist" })
        }
    } 
    catch (err) {
        console.log(err)
        res.status(500).send({ msg: err.message });
    }

}

//Q3
const getThisBlog = async function (req, res) {

    try {
        const filter={
            isDeleted:false,
        }
        const {authorId,category,tags,subcategory}=req.query
        
        if (authorId) {
            if (!(funcValidator.isValid(authorId) && funcValidator.isValidObjectId(authorId))) {
                return res.status(400).send({ status: false, msg: "authorId is not valid" })
            }
            filter.authorId=authorId
        }

        if (category) {
            if (!funcValidator.isValid(category)) {
                return res.status(400).send({ status: false, msg: "category is not valid" })
            }
            filter.category=category
        }
            
        if (tags) {
            if (!funcValidator.isValid(tags)) {
                return res.status(400).send({ status: false, msg: "category is not valid" })
            }
            filter.tags=tags
        }

        if (subcategory) {
            if (!funcValidator.isValid(subcategory)) {
                return res.status(400).send({ status: false, msg: "category is not valid" })
            }
            filter.subcategory=subcategory
        }
            
        const matchingBlogs = await blogModel.find(filter)
        
        if (matchingBlogs.length>0) {
            res.status(200).send({ status: true, data: matchingBlogs})
        }else {
            res.status(404).send({ status: false, msg: "no such blog found" })

        }
    }

     catch (err) {
        console.log(err)
        res.status(500).send(err.message)

    }
}


let deleteBlogById = async function (req, res) {
    try {

       if (!(funcValidator.isValid(req.params.blogId) && funcValidator.isValidObjectId(req.params.blogId))) {
            return res.status(400).send({ status: false, msg: "authorId is not valid" })
        }

        const blog=await blogModel.findOne({_id:req.params.blogId,isDeleted:false})
        
        if(!blog){
            return res.status(404).send({ status: false, message: 'blog not exist' })
        }
        console.log(typeof(req.validToken._id))
        console.log(typeof(blog.authorId))
        if((blog.authorId).toString()!==(req.validToken._id).toString()){
            return res.status(400).send({ status: false, message: 'Authorization Denide' })
        }
        
        const blogToDelete = await blogModel.findOneAndUpdate(
            {_id:req.params.blogId,isDeleted:false}, 
            { isDeleted: true, deletedAt: new Date() },
             { new: true })
        if (blogToDelete) {
            res.status(200).send({ status: true, msg: "Blog has been deleted successfully", data: blogToDelete })
        } else {
            res.status(404).send({ status: false, msg: "blog not exist" })
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send(err.message)
    }
}

//Q6-

const specificDelete = async function (req, res) {
    try {
        if (!funcValidator.isValidRequestBody(req.query)) {
            return res.status(404).send({ msg: "please provide the query it's needed" })
        }
        const {authorId,tags,category,subcategory,isPublished}=req.query

        const filter={
            isDeleted:false,
            authorId:req.validToken._id
        }
        
        if (category) {
            if (!funcValidator.isValid(category)) {
                return res.status(400).send({ status: false, msg: "category is not valid" })
            }
            filter["category"] = category;
        }
        if (tags) {
            if (!funcValidator.isValid(tags)) {
                return res.status(400).send({ status: false, msg: "tags is not valid" })
            }
            filter["tags"] = tags;
        }

        if (subcategory) {
            if (!funcValidator.isValid(subcategory)) {
                return res.status(400).send({ status: false, msg: "subcategory is not valid" })
            }
            filter["subcategory"] = subcategory;
        }
       
        if (authorId) {
            if (!(funcValidator.isValid(authorId) && isValidObjectId(authorId))) {
                return res.status(400).send({ status: false, msg: "authorId is not valid" })
            }
            filter["authorId"] = authorId

        }
        if (isPublished) {
            if (!(funcValidator.isValid(isPublished))){
                return res.status(400).send({ status: false, msg: "isPublished is not valid" })
            }
            filter["isPublished"] = isPublished

        }
        let blogToDelete = await blogModel.updateMany(filter, {
            isDeleted: true,
            deletedAt: new Date()
        },{new:true});

        if (blogToDelete.matchedCount > 0) {
            res.status(200).send({ status: true, msg: "Blog has been deleted successfully"});
        } else {
            res.status(404).send({ status: false, msg: "no such blog exist with this author" })
        }


    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: err.message });
    }
}

module.exports.createBlog = createBlog;
module.exports.getThisBlog = getThisBlog;
module.exports.updateDetails = updateDetails
module.exports.deleteBlogById = deleteBlogById
module.exports.specificDelete = specificDelete