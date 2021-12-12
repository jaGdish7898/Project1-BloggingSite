const express = require('express');
const router = express.Router();


const AuthorController= require("../controllers/authorcontroller")
const BlogController= require("../controllers/blogController")
const commonMw=require("../middleware/commonmiddleware")


router.post('/createAuthors',AuthorController.authorsCreation);
router.post('/blogs',commonMw.validator, BlogController.createBlog);
router.get("/blogs",commonMw.validator,BlogController.getThisBlog) 
router.put('/blogs/:blogId',commonMw.validator,BlogController.updateDetails)
router.delete("/blog/:blogId",commonMw.validator,BlogController.deleteBlogById)
router.delete("/blog",commonMw.validator,BlogController.specificDelete)



router.post("/login", AuthorController.login) 


//j











module.exports = router;