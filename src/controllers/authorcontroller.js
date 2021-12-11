const authorsModel = require("../models/authorsModel")
const jwt = require('jsonwebtoken')
const commonMw = require("../middleware/commonmiddleware")
const mongoose  = require("mongoose")
const blogModel = require("../models/blogModel")


//-------------------------------Validation functions----------------------------------------------------

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

//---------------------------------Validation function----------------------------------------------
//Q1
const authorsCreation = async function (req, res) {
    try {
        console.log(req.body)
        if (!isValidRequestBody(req.body)) {
            return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide author details' })
        }

        const { fname, lname, title, email, password, mobile } = req.body;

        if (!isValid(fname)) {
            return res.status(400).send({ status: false, message: 'First name is not valid' })
        }

        if (!isValid(lname)) {
            return res.status(400).send({ status: false, message: 'Last name is not valid' })
        }

        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: 'title is not valid' })
        }

        if (!(['Mr', 'Mrs', 'Miss'].includes(title))) {
            return res.status(400).send({ status: false, message: 'Title should be among Mr, Mrs, Miss' })
        }

        if (!isValid(email)) {
            return res.ststus(400).send({ status: false, message: 'email is not valid' })
        }

        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, message: `Email should be a valid email address` })
        }

        const isEmailAlreadyUsed = await authorsModel.findOne({ email })

        if (isEmailAlreadyUsed) {
            res.status(400).send({ status: false, message: `${email} email address is already registered` })
            return
        }
        if (!isValid(password)) {
            res.status(400).send({ status: false, message: `Password is required` })
            return
        }


        const savedAuthor = await authorsModel.create(req.body);

        res.status(201).send({ status: true, message: `Author created successfully`, data: savedAuthor });

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}




///Authentication

//Q1
const login = async function (req, res) {

    try {
        if(!isValidRequestBody(req.body)) {
            res.status(400).send({status: false, message: 'Invalid request parameters. Please provide login details'})
            return
        }

        let {email,password}=req.body

        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: 'email is not valid' })
        }

        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, message: `Email should be a valid email address` })
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: 'password is not valid' })
        }
        
        let author = await authorsModel.findOne(req.body)

        if (author) {
            let token = await jwt.sign({ _id: author._id }, "radium")
            res.setHeader("x-api-key", token)
            res.status(200).send({ status: true, msg: "user logged in successfully" })

        } else {
            res.status(404).send({
                status: false,
                msg: "invalid Credentials.no Author found."
            })
        }

    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, message: err.message })
    }
}

module.exports.authorsCreation = authorsCreation
module.exports.login = login

const a=(req,res)=>{
    console.log(req.params)
    res.send(typeof(req.params))
}

module.exports.a=a




