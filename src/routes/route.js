const express = require('express');
const router = express.Router();


const BookController= require("../controllers/bookController")
const commonMw=require("../middleware/commonmiddleware")





router.post("/books",BookController.CreateBook) 
router.get("/books/:bookId",commonMw.validator,BookController.getThisBook) 






// router.post("/login", AuthorController.login) 
//this is book management













module.exports = router;