const mongoose=require('mongoose')
const validator=require('validator');

const authorSchema=new mongoose.Schema({
    fname:{
        type:String,
        required:true,
        trim:true
    },
    lname:{
        type:String,
        required:true,
        trim:true
    },
    title:{
        type:String,
        required:true,
        enum:['Mr','Mrs','Miss'],
        trim:true
    },
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
    password:{
        type:String,
        required:true
    },
    mobile:{
        type:Number
    }
}, {timestamps: true} )



module.exports=mongoose.model("P1_Authors",authorSchema)  