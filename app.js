//jshint esversion:6
const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const mongoose = require('mongoose')

const app = express()

app.use(express.static('public'))

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({
    extended:true
}))

const PORT = process.env.PORT || 3000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1/userDB'

const connDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI)
        console.log(`mongoDB connected to :${conn.connection.host}`);
    } catch (error) {
        console.log(`error connection mongoDB :${error}`);
    }
    
}
app.get("/", (req, res) => {
    res.render("home")
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/register", (req, res) => {
    res.render("register")
})


connDB().then(() => {
    app.listen(PORT, ()=>{
        console.log(`server runing on port ${PORT}`);
    })
})
