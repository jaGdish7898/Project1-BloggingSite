const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const blogModel = require("../models/blogModel")
const AuthorModel = require("../models/authorsModel")

//-------------------------------Validation functions-----------------------------------------

const isValid = function(value) {
    if(typeof value === 'undefined' || value === null) return false
    if(typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}
//----------------------------------------------------------------------------------------------------------
const createBlog = async (req, res) => {
    try {
        
        if (!(req.body.authorId == req.validToken._id)) 
        return res.send({status:false,msg:"Author is not valid"})
        

        if(!isValidRequestBody(req.body)) {
            return res.status(400).send({status: false, message: 'Invalid request parameters. Please provide blog details'})
            
        }

        // Extracting containt of body to validate
        const {title, body, authorId, tags, category, subcategory} = req.body;

        //checking all mandetory things through is valid function
        if(!isValid(title)) {
            res.status(400).send({status: false, message: 'Blog Title is required'})
            return
        }

        if(!isValid(body)) {
            res.status(400).send({status: false, message: 'Blog body is required'})
            return
        }

        if(!isValid(authorId)) {
            res.status(400).send({status: false, message: 'Author id is required'})
            return
        }

        if(!isValidObjectId(authorId)) {
            res.status(400).send({status: false, message: `${authorId} is not a valid author id`})
            return
        }

        if(!isValid(category)) {
            res.status(400).send({status: false, message: 'Blog category is required'})
            return
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
            if(typeof(tags)===String) {
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




//Q3
const getThisBlog = async function (req, res) {

    try {

        if (Object.values(req.query).length === 0) {
            let filter = { isDeleted: false, isPublished: true, authorId: req.validToken._id }
            let data = await blogModel.find(filter)
            if (data) {
                res.status(200).send({ status: true, data: data })
            } else {
                res.status(404).send({ status: false, msg: "no such blog found" })
            }

        } else {
            req.query["authorId"] = req.validToken._id
            req.query["isDeleted"] = false
            data = await blogModel.find(req.query)
            if (data) {
                res.status(200).send({ status: true, data: data })
            } else {
                res.status(404).send({ status: false, msg: "no such blog found" })
            }
        }
    }
    catch (err) {
        console.log(err)
        res.send(err)
    }
}

//Q4-
const updateDetails = async function (req, res) {
    try {
        const title = req.body.title;
        const body = req.body.body;
        const tags = req.body.tags;
        const subcategory = req.body.subcategory;
        let id = req.validToken._id
        let Update = {}
        Update.title = await blogModel.findOneAndUpdate({ _id: req.params.blogId, isDeleted: false, authorId: id }, { title: title }, { new: true })
        Update.body = await blogModel.findOneAndUpdate({ _id: req.params.blogId, isDeleted: false, authorId: id }, { body: body }, { new: true })
        Update.tags = await blogModel.findOneAndUpdate({ _id: req.params.blogId, isDeleted: false, authorId: id }, { $push: { tags: tags } }, { new: true })
        Update.subcategory = await blogModel.findOneAndUpdate({ _id: req.params.blogId, isDeleted: false, authorId: id }, { $push: { subcategory: subcategory } }, { new: true })
        Update.isPublished = await blogModel.findOneAndUpdate({ _id: req.params.blogId, isDeleted: false, authorId: id }, { isPublished: true }, { new: true })
        Update.publishedAt = await blogModel.findOneAndUpdate({ _id: req.params.blogId, isDeleted: false, authorId: id }, { publishedAt: String(new Date()) }, { new: true })
        console.log(Update)
        let updatedBlog = await blogModel.find({ _id: req.params.blogId, isDeleted: false, authorId: id })

        res.send({ data: updatedBlog })

    } catch (err) {
        res.status(500).send({ msg: err });
    }

}





//Q5-
let deleteBlog = async function (req, res) {
    try {

        let filter = { isDeleted: false }
        filter["authorId"] = req.validToken._id
        filter["_id"] = req.params.blogId
        console.log(filter)
        let deletedTime = String(new Date());

        let DeletedBlog = await blogModel.findOneAndUpdate(filter, { isDeleted: true, deletedAt: deletedTime })
        if (DeletedBlog) {
            res.status(200).send({ status: true, msg: "Blog has been deleted" })
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
        if(Object.values(req.query).length===0){
           res.status(404).send({msg:"please provide the query it's needed"})
        }else{
            const filter = {
                isDeleted: false,
                isPublished:false,
            };
            filter["authorId"]=req.validToken._id
            
            if (req.query.category) {
                filter["category"] = req.query.category;
            }
            if (req.query.AuthorId) {
            filter["authorId"] = req.query.AuthorId;
            }
            if (req.query.tags) {
                filter["tags"] = req.query.tags;
            }
            if (req.query.subcategory) {
                filter["subcategory"] = req.query.subcategory;
            }
            
            let deletedTime = String(new Date());
            let deleteData = await blogModel.findOneAndUpdate(filter, {
                isDeleted: true,
                deletedAt: deletedTime
            });
            
            if (deleteData) {
                res.status(200).send({ status: true, msg: "Blog has been deleted" });
            } else {
                res.status(404).send({ status: false, msg: "no such blog exist" });
            }
        }
        
    } catch {
        res.status(500).send({ status: false, msg: "Something went wrong" });
    }
}

module.exports.createBlog = createBlog;
module.exports.getThisBlog = getThisBlog;
module.exports.updateDetails = updateDetails
module.exports.deleteBlog = deleteBlog
module.exports.specificDelete = specificDelete