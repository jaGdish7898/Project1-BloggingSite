const jwt = require("jsonwebtoken")


const validator = function (req, res, next) {
    let token = req.headers["x-api-key"]
    if (token) {
        const validToken = jwt.verify(token, "radium")
        console.log(validToken)
        if (validToken) {
             console.log("you can go to main function now")
            req.validToken=validToken                     //setting variable validToken inside req such as
            next();                                      //req.validToken={_id,iat} sending it to hander as 
        }else {                                         //we need it there
            res.send({ msg: "invalid Token" })
        }
    } else {
        res.send({ msg: "mandatory header is not present" })
    }
}



module.exports.validator = validator