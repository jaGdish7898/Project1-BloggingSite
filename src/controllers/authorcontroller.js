const authorsModel = require("../models/authorsModel")
const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt");
const mongoose  = require("mongoose")
const funcValidator=require("../validations/validator")



//saving user datails

const authorsCreation = async function (req, res) {
    try {
       
        if (!funcValidator.isValidRequestBody(req.body)) {
            return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide author details' })
        }

        let { fname, lname, title, email, password, mobile } = req.body;

        if (!funcValidator.isValid(fname)) {
            return res.status(400).send({ status: false, message: 'First name is not valid' })
        }

        if (!funcValidator.isValid(lname)) {
            return res.status(400).send({ status: false, message: 'Last name is not valid' })
        }
        
        if (!funcValidator.isValid(title)) {
            return res.status(400).send({ status: false, message: 'title is not valid' })
        }
        title=title.trim()
        if (!(['Mr', 'Mrs', 'Miss'].includes(title))) {
            return res.status(400).send({ status: false, message: 'Title should be among Mr, Mrs, Miss' })
        }
        if (!funcValidator.isValid(mobile)) {
            res.status(400).send({ status: false, message: `mobile is required` })
            return
        }
        if (!funcValidator.isValidPhoneSyntax(mobile)) {
            return res.status(400).send({ status: false, message: `${mobile} should be a valid mobile ` })
        }
        const ismobileAlreadyUsed = await authorsModel.findOne({ mobile })

        if (ismobileAlreadyUsed) {
            res.status(400).send({ status: false, message: `${mobile} is already registered` })
            return
        }

        if (!funcValidator.isValid(email)) {
            return res.ststus(400).send({ status: false, message: 'email is not valid' })
        }
        email=email.trim()

        if (!funcValidator.isValidEmailSyntax(email)) {
            return res.status(400).send({ status: false, message: `Email should be a valid email address` })
        }

        const isEmailAlreadyUsed = await authorsModel.findOne({ email })

        if (isEmailAlreadyUsed) {
            res.status(400).send({ status: false, message: `${email} email address is already registered` })
            return
        }
        if (!funcValidator.isValid(password)) {
            res.status(400).send({ status: false, message: `Password is required` })
            return
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        const savedAuthor = await authorsModel.create({fname, lname, title, email, password:hashedPassword, mobile});

        res.status(201).send({ status: true, message: `Author created successfully`, data: savedAuthor });

    } catch (err) {
        console.log(err)
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
        const InputEmail=req.body.email
        const inputPassword=req.body.password

        const author=await authorsModel.find({email:InputEmail})

        if(!author) return res.status(400).send({ status: false, message: 'invalid login credentials' }) 

        const {password,_id}=author
        const isMatched=await bcrypt.compare(inputPassword, password);
        if (!isMatched) {
            return res.status(400).send({ status: false, message: 'invalid login credentials' })
        }
        
        let token = await jwt.sign({ _id:_id }, "radium")
        res.setHeader("x-api-key", token)
        res.status(200).send({ status: true, msg: "Author logged in successfully" })
    } 
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, message: err.message })
    }
}
module.exports.login = login

module.exports.authorsCreation = authorsCreation







