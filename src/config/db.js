const mongoose = require('mongoose')

function connectDB(){
    mongoose.connect(process.env.MONGO_URI)
    .then((
        console.log("connected to db")
    ))
    .catch(err=>{
        console.log('error connecting to db', err)
        process.exit(1)
    })
}

module.exports = connectDB