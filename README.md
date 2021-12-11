




 <a href="https://www.google.com" target="blank">p1 questions</a>

# email validation function
1)for cantroller:

if(!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({status: false, message: `Email should be a valid email address`})
        }
2)for model:

email:{
        type:String,
        unique: true,
        required:true,
        validate:{
            validator:function(email){
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
            },
            message:'{VALUE} is not a valid email',
            isAsync:false
        }
    },




      