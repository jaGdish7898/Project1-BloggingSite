const express = require('express');
const router = express.Router();


const AuthorController= require("../controllers/authorcontroller")
const BlogController= require("../controllers/blogController")
const commonMw=require("../middleware/commonmiddleware")

//Create new Author
router.post('/createAuthors',AuthorController.authorsCreation);
//create new blog
router.post('/blogs',commonMw.validator, BlogController.createBlog);
//get blogs
router.get("/blogs",commonMw.validator,BlogController.getThisBlog) 
//update blogs
router.put('/blogs/:blogId',commonMw.validator,BlogController.updateDetails)
//delete blog by id
router.delete("/blog/:blogId",commonMw.validator,BlogController.deleteBlogById)
//delete blog by query
router.delete("/blog",commonMw.validator,BlogController.specificDelete)


//login api
router.post("/login", AuthorController.login) 














module.exports = router;