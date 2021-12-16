const express = require('express');
const router = express.Router();


const AuthorController= require("../controllers/usercontroller")
const BlogController= require("../controllers/bookController")
const commonMw=require("../middleware/commonmiddleware")



// router.post('/blogs',commonMw.validator, BlogController.createBlog);
// router.get("/blogs",commonMw.validator,BlogController.getThisBlog) 

router.get("/books",commonMw.validator,BlogController.getThisBook) 




// router.post("/login", AuthorController.login) 
//this is book management













module.exports = router;