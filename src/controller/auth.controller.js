const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')
const emailService = require('../services/email.service')

/** 
 * - user register controller 
 * - POST /api/auth/register
*/

async function userRegisterController(req, res) {

    const { email, password, name } = req.body
    const isExist = await userModel.findOne({ email: email })
    if (isExist) {
        return res.status(422).json({
            message: "email already exist",
            status: "failed"
        })
    }
    const user = await userModel.create({
        email, password, name
    })

    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: '3d'})
    res.cookie("token", token)
    res.status(201).json({
        message: "user registered success",
        user:{
            _id: user._id,
            email: user.email,
            name: user.name
        }, 
        token
    })

    await emailService.sendRegistrationEmail(user.email, user.name)
}

/**
 * - User Login Controller
 * - POST api/auth/login
 */

async function userLoginController(req, res) {
    const {email, password} = req.body
    const user = await userModel.findOne({email:email}).select('+password')
    if(!user){
        return res.status(401).json({
            message: "email or password is invalid"
        })
    }
    const isValidPassword = await user.comparePassword(password)

    if(!isValidPassword){
        return res.status(401).json({
            message: "email or password is invalid"
        })
    }

    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: '3d'})
    res.cookie("token", token)
    res.status(200).json({
        message: "user registered success",
        user:{
            _id: user._id,
            email: user.email,
            name: user.name
        }, 
        token
    })
}

module.exports = { userRegisterController, userLoginController }