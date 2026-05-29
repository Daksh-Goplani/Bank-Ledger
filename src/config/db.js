const mongoose = require('mongoose')

async function connectDB() {

    try {

        const conn = await mongoose.connect(process.env.MONGO_URI)

        console.log("connected to db")
        console.log(conn.connection.host)

    } catch (err) {

        console.log('error connecting to db', err)

        process.exit(1)
    }
}

module.exports = connectDB