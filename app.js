//jshint esversion:6

require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10;

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

app.post("/register", async (req, res) => {
    
    bcrypt.hash(req.body.password, saltRounds, async(err, hash) =>{
        // Store hash in your password DB.
        const newUser = new User({
            email: req.body.username,
            password:hash
        })

        const saveNewUser = await newUser.save()

        if (newUser === saveNewUser) {
            console.log(`${saveNewUser} successfully saved to database`);
            res.render("secrets")
        } else {
            console.log("cant save newUser to database");
    
        }
    });

    
})

app.post("/login",async (req, res) => {
    const username = req.body.username
    const password = req.body.password

    const doc = await User.findOne({
        email:username
    }).exec()

    if (username === doc.email) {
        // Load hash from your password DB.
        bcrypt.compare(password, doc.password, function(err, result) {
            // result == true
            if (result) {
                console.log(`${doc} is found`);
                res.render("secrets")
            } else {
                console.log(`${password} is wrong password`);
            }
        });
    } else {
        console.log(`${username} not found, please register`);
    }

})


connDB().then(() => {
    app.listen(PORT, ()=>{
        console.log(`server runing on port ${PORT}`);
    })
})
