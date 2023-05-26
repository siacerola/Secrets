//jshint esversion:6

require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')

const mongoose = require('mongoose')
const findOrCreate = require('mongoose-findorcreate')

const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')

const GoogleStrategy = require('passport-google-oauth20').Strategy



const app = express()

app.use(express.static('public'))

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({
    extended:true
}))

app.use(session({
    secret: 'Our little secret.',
    resave: false,
    saveUninitialized:false
}))

app.use(passport.initialize())
app.use(passport.authenticate('session'))

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
    password: String,
    googleId:String
}) 

userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)



const User = new mongoose.model('User', userSchema)

passport.use(User.createStrategy())

passport.serializeUser((user, cb) => {
    process.nextTick(() => {
        cb(null,
            {
                id: user.id,
                username: user.username,
                name: user.name
            });
    });
});


passport.deserializeUser((user, cb) => {
    process.nextTick(() => {
        return cb(null,user)
    })
})


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/secrets',
    userProfileURL:'https://www.googleapis.com/oauth2/v3/userinfo'
},
    (accessToken, refreshToken, profile, cb) => {
        console.log(profile);
        User.findOrCreate({
            googleId:profile.id
        },
            (err, user) => {
            return cb(err,user)
        })
    }))

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/auth/google',
    passport.authenticate('google', {
        scope:['profile']
    })
)

app.get('/auth/google/secrets',
    passport.authenticate('google', {
        successRedirect: '/secrets',
        failureRedirect:'/login'
    })
)

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.get('/secrets', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('secrets')
    } else {
        res.redirect('/login')
    }
})

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/')
        }
    })
    
})

app.post('/register', async (req, res) => {
    User.register({ username: req.body.username }, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            res.redirect('/register')
        } else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets')
            })
        }
    })
    
})

app.post('/login', async (req, res) => {
    const user = new User({
        username: req.body.username,
        password:req.body.password
    })

    req.login(user, (err) => {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets')
            })
        }
    })
})


connDB().then(() => {
    app.listen(PORT, ()=>{
        console.log(`server runing on port ${PORT}`);
    })
})
