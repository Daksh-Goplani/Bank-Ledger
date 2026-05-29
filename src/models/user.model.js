const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: [true, "Email is required for creating user"],
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please fill a valid email address"],
        unique: [true, "Email already exist"]
    },
    name: {
        type: String, 
        required: [true, 'Name is required'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, "Password should be atleast 6 letter"],
        select: false
    }
}, {
    timestamps:true
})

userSchema.pre('save', async function (next) {
    if(!this.isModified("password")){
        return 
    }
    const hash = await bcrypt.hash(this.password, 10)
    this.password = hash
    return 
})

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

const userModel = mongoose.model('user', userSchema) 
  
module.exports = userModel