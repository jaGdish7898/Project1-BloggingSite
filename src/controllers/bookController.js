const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const bookModel = require("../models/bookModel")


// // //-------------------------------Validation functions-----------------------------------------

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

 //-------------------------------------------Redis Connection-------------------------------------------

 const redis = require("redis");

const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
    16851,
  "redis-16851.c12.us-east-1-4.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("syIZhPb6h5RKOhrvAQgoGJrzrNTWjeAs", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);




 //----------------------------------------------------------------------------------------------------------
const CreateBook= async (req, res) => {
    try {


        if(!isValidRequestBody(req.body)) {
            return res.status(400).send({status: false, message: 'Invalid request parameters. Please provide blog details'})
        }



        let {name,author,category}=req.body

        if(!isValid(name)) {
            return res.status(400).send({status: false, message: 'Valid name is required'})
        }

        if(!isValid(author)) {
            return res.status(400).send({status: false, message: 'Valid author is required'})
        }

        if(!isValid(category)) {
            return res.status(400).send({status: false, message: 'Valid category is required'})
        }


        let savedBook=await bookModel.create(req.body)

        res.status(201).send({status:true,data:savedBook})

    } catch (error) {
        console.log(error)
        res.status(400).send({ status: false, msg: "server error" })
    }
}

module.exports.CreateBook=CreateBook


// //Q4-
const getThisBook= async function (req, res) {

    try {

        if(!(isValid(req.params.bookId) && isValidObjectId(req.params.bookId))){
            return res.status(400).send({status:false,msg:"authorId is not valid"})
        }


        let bookFromCache= await GET_ASYNC(`${req.params.bookId}`)

        if(bookFromCache){
            let data=JSON.parse(bookFromCache)
            res.status(200).send({status:true,msg:"i found book",data})

        }else{
            
            let fetchedBook=await bookModel.findOne({_id:req.params.bookId})

            if(fetchedBook){
                await SET_ASYNC(`${req.params.bookId}`, JSON.stringify(fetchedBook))
                res.status(200).send({status:true,msg:"i found book",fetchedBook})
                
            }else{
                res.status(400).send({status:false,msg:"book not found"})

            }
        }     
    } 
    catch (err) {
        console.log(err)
        res.status(500).send({ msg: err.message });
    }

}

module.exports.getThisBook=getThisBook

