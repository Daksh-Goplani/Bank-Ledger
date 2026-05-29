const app = require('./src/app')
require('dotenv').config()
const connectDB = require('./src/config/db')

connectDB()

app.listen(3000, ()=>{
    console.log("App listening on port 3000")
})