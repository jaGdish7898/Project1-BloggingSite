const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const blogModel = require("../models/blogModel")
const authorModel = require("../models/authorsModel")

//-------------------------------Validation functions-----------------------------------------

const isValid = function(value) {
    if(typeof value === 'undefined' || value === null) return false
    if(typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidRequestBody = function(requestBody) {
    return Object.values(requestBody).length > 0
}

const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}
//----------------------------------------------------------------------------------------------------------
const createBlog = async (req, res) => {
    try {
        if(!isValidRequestBody(req.body)) {
            return res.status(400).send({status: false, message: 'Invalid request parameters. Please provide blog details'})
        }

        // Extracting containt of body to validate
        const {title, body, authorId, tags, category, subcategory} = req.body;

        if(!isValid(authorId)) {
            res.status(400).send({status: false, message: 'Author id is required'})
            return
        }

        
        if(!isValidObjectId(authorId)) {
            res.status(400).send({status: false, message: `${authorId} is not a valid author id`})
            return
        }
       
        // cheacking if author is present with given authorId or not
        const author = await authorModel.findById(authorId);
        
        if(!author) {
            return res.status(400).send({status: false, msg: `No Author exist matching with this authorId`})
        }

        //cheacking if logged in author creating blog by his own id or not
        if (!(req.body.authorId == req.validToken._id)) 
        return res.send({status:false,msg:"Author is not valid to create blog with given authorId"})
        
        //checking all mandetory things through is valid function
        if(!isValid(title)) {
            return res.status(400).send({status: false, message: 'Blog Title is required'})
        }

        if(!isValid(body)) {
            return res.status(400).send({status: false, message: 'Blog body is required'})
        }
        
        if(!isValid(category)) {
            return res.status(400).send({status: false, message: 'Blog category is required'})
            
        }

        //now we will check non mandetry things,because first we have to check wheather value of nan mandetory thing is coming or not if coming then we will validate it

        const blogData = {
            title,
            body,
            authorId,
            category,
            
        }

        if(tags) {
            if(Array.isArray(tags)) {
                blogData['tags'] = tags
            }
            //is someone has given single tag and forget to give it in array
            //tags="nature"
            if(typeof(tags)===String && isValid(tags)) {
                blogData['tags'] = [ tags ]
            }
        }

        if(subcategory) {
            if(Array.isArray(subcategory)) {
                blogData['subcategory'] = subcategory
            }
            if(typeof(subcategory)===String) {
                blogData['subcategory'] = [ subcategory ]
            }
        }

        const newBlog = await blogModel.create(blogData)
        res.status(201).send({status: true, message: 'New blog created successfully', data: newBlog})

    } catch (error) {
        console.log(error)
        res.status(400).send({ status: false, msg: "server error" })
    }
};


//Q4-
const updateDetails = async function (req, res) {

    try {
        // let filter={};

        // if(!isValidRequestBody(req.body)) {
        //     return res.status(400).send({status: false, message: 'Invalid request parameters. Please provide blog details'})
        // }

        // Extracting containt of body to validate
        // const {title, body,tags,category,} = req.body;

        // if(!isValid(title)) {
        //     res.status(400).send({status: false, message: 'title is not valid'})
        //     return
        // }
        // //body is one of the key in blog
        // if(!isValid(body)) {
        //     res.status(400).send({status: false, message: 'body is not valid'})
        //     return
        // }
        //tag and subcategory will be a array having values to push.


        
        // let Update = {}
        // console.log()
        // let data= await blogModel.findOneAndUpdate({_id:req.params.blogId},{ $push:{ tags: req.body.tags }}, { $push: { subcategory: req.body.subcategory } }, { new: true })
        // if(data)
        // res.send(data)
        // else
        // res.send("not done")
        // Update.body = await blogModel.findOneAndUpdate({ _id: req.params.blogId, isDeleted: false, authorId: id }, { body: body }, { new: true })
        // Update.tags = await blogModel.findOneAndUpdate({ _id: req.params.blogId, isDeleted: false, authorId: id }, { $push: { tags: tags } }, { new: true })
        // Update.subcategory = await blogModel.findOneAndUpdate({ _id: req.params.blogId, isDeleted: false, authorId: id }, { $push: { subcategory: subcategory } }, { new: true })
        // Update.isPublished = await blogModel.findOneAndUpdate({ _id: req.params.blogId, isDeleted: false, authorId: id }, { isPublished: true }, { new: true })
        // Update.publishedAt = await blogModel.findOneAndUpdate({ _id: req.params.blogId, isDeleted: false, authorId: id }, { publishedAt: String(new Date()) }, { new: true })
        // console.log(Update)
        // let updatedBlog = await blogModel.find({ _id: req.params.blogId, isDeleted: false, authorId: id })

        // res.send({ data: updatedBlog })
        // console.log(data)

    } catch (err) {
        console.log(err)
        res.status(500).send({ msg: err });
    }

}

//Q3
const getThisBlog = async function (req, res) {

    try {
        if(!isValidRequestBody(req.query)) {
            let filter = { isDeleted: false, isPublished: true, authorId: req.validToken._id }
            let blogs = await blogModel.find(filter)
            if (blogs.length>0) {
                res.status(200).send({ status: true, data: blogs })
            } else {
                res.status(404).send({ status: false, msg: "no such blog found" })
            }
           
        }else{
        const {authorId, category, tags, subcategory} = req.query
        
        if(authorId){
            if(!(isValid(authorId) && isValidObjectId(authorId))){
                return res.status(400).send({status:false,msg:"authorId is not valid"})
            }
        }

        if(category){
            if(!isValid(category)){
                return res.status(400).send({status:false,msg:"category is not valid"})
            }
        }

        if(tags){
            if(!isValid(tags)){
                return res.status(400).send({status:false,msg:"category is not valid"})
            }
        }

        if(subcategory){
            if(!isValid(subcategory)){
                return res.status(400).send({status:false,msg:"category is not valid"})
            }
        }

        req.query["authorId"] = req.validToken._id
        req.query["isDeleted"] = false

        data = await blogModel.find(req.query)
        if (data) {
            res.status(200).send({ status: true, data: data })
        }else{
            res.status(404).send({ status: false, msg: "no such blog found" })

        }
    }
    }catch (err) {
        console.log(err)
        res.status(500).send(err.message)
        
    }
}










//Q5-
let deleteBlogById = async function (req, res) {
    try {

        let filter = { isDeleted: false }

        if(!(isValid(req.params.blogId) && isValidObjectId(req.params.blogId))){
            return res.status(400).send({status:false,msg:"authorId is not valid"})
        }
        filter["_id"] = req.params.blogId

        if(!isValid( req.validToken._id)) {
            return res.status(400).send({status: false, message: 'Token id is not valid'})
        }
        filter["authorId"] = req.validToken._id

        
        
        let DeletedBlog = await blogModel.findOneAndUpdate(filter, { isDeleted: true, deletedAt:new Date() },{new:true})
        if (DeletedBlog) {
            res.status(200).send({ status: true, msg: "Blog has been deleted",data:DeletedBlog })
        } else {
            res.status(404).send({ status: false, msg: "either the blog is already deleted or you are not valid author to access this blog" })
        }
    }
    catch (err) {
        console.log(err)
        res.send(err)
    }
}

//Q6-

const specificDelete = async function (req, res) {
    try {
        console.log(req.query)
        if(!isValidRequestBody(req.query)){
            return res.status(404).send({msg:"please provide the query it's needed"})
        }
            
        const filter = {
            isDeleted: false,
            isPublished:false,
        };
        
            
        filter["authorId"]=req.validToken._id
        

        if(req.query.category){
            if(!isValid(req.query.category)){
                return res.status(400).send({status:false,msg:"category is not valid"})
            }
            filter["category"] = req.query.category;
        }
        console.log(filter)
        if(req.querytags){
            if(!isValid(req.querytags)){
                return res.status(400).send({status:false,msg:"tags is not valid"})
            }
            filter["tags"] = req.query.tags;
        }

        if(req.query.subcategory){
            if(!isValid(req.query.subcategory)){
                return res.status(400).send({status:false,msg:"subcategory is not valid"})
            }
            filter["subcategory"] = req.query.subcategory;
        }
        if(req.query.AuthorId){
            if(!(isValid(req.query.AuthorId) && isValidObjectId(req.query.AuthorId))){
                return res.status(400).send({status:false,msg:"authorId is not valid"})
            }
            filter["authorId"]=req.query.AuthorId

        }
        
        console.log(filter)
        let deleteData = await blogModel.updateMany(filter, {
                isDeleted: true,
                deletedAt: new Date()
            });
            console.log(deleteData)
            
            if (deleteData.matchedCount>0) {
                res.status(200).send({ status: true, msg: "Blog has been deleted" });
            } else {
                res.status(404).send({ status: false, msg: "no such blog exist or blog is already deleted" })
            }
        
        
    } catch (err){
        console.log(err)
        res.status(500).send({ status: false, msg: err.message });
    }
}

module.exports.createBlog = createBlog;
module.exports.getThisBlog = getThisBlog;
module.exports.updateDetails = updateDetails
module.exports.deleteBlogById = deleteBlogById
module.exports.specificDelete = specificDelete