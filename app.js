//jshint esversion:6

require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const mongoose = require('mongoose')
const md5 = require('md5')

const app = express()

console.log(md5("123456"));

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

const userSchema = new mongoose.Schema({
    email: String,
    password:String
}) 



const User = new mongoose.model("User",userSchema)

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/register", (req, res) => {
    res.render("register")
})

app.post("/register",async (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password:md5(req.body.password)
    })

    const saveNewUser = await newUser.save()
    if (newUser === saveNewUser) {
        console.log(`${saveNewUser} successfully saved to database`);
        res.render("secrets")
    } else {
        console.log("cant save newUser to database");

    }
})

app.post("/login",async (req, res) => {
    const username = req.body.username
    const password = md5(req.body.password)

    const doc = await User.findOne({
        email:username
    }).exec()

    if (username === doc.email) {
        if (password === doc.password) {
            console.log(`${doc} is found`);
            res.render("secrets")
        } else {
            console.log(`${password} is wrong password`);
        }
        
    } else {
        console.log(`${username} not found, please register`);
    }

})


connDB().then(() => {
    app.listen(PORT, ()=>{
        console.log(`server runing on port ${PORT}`);
    })
})
