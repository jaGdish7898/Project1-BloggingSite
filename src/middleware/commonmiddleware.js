const jwt = require("jsonwebtoken")

let array=[]


const validator = function (req, res, next) {

    let count =Math.floor(Math.random()*5-1)+1
    array.push(count)
    if(array.length===6){
        res.status(400).send({msg:"limit exids !!"})
    }else{
        next();
    }

}


    




module.exports.validator = validator

//