// Require Statements
const mongoose = require('mongoose')
const express = require("express")

// for cross site communication
const cors = require('cors')

const passport = require("passport")
// uses the cookies to read session data 
const cookieParser = require('cookie-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser')
const {User} = require('./models/user')

require('./passport')
// End of Require

// saving from having to call frontend url everywhere, declared here
const url = "https://login-with-google.netlify.app"



const app = express()

// connect to Db
mongoose.connect("mongodb+srv://dbUser:dbUserPassword@cluster0.tlhpy.mongodb.net/database1?retryWrites=true&w=majority", {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useNewUrlParser: true
})

// Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// all access, no security
// app.use(cors())

app.use(cors({
    // people coming from "http://localhost:3000"
    origin: "https://login-with-google.netlify.app",
    // allow client to send credentials like cookies and headers
    credentials: true
}))

// Saving session
app.use(session({
    secret: "fooooooooooooo",
    resave: true,
    saveUninitialized: false,
    // new MongoStore needs a connection, we have an existing connection so we re-use that
    store: new MongoStore({mongooseConnection: mongoose.connection}),
    // cookie: {
    //     maxAge: 3600000
    // }
}))

// Reading Cookies to read session
// secret needs to be the same as what is provided to cookieParser
app.use(cookieParser("fooooooooooooo"))

app.use(passport.initialize())
app.use(passport.session())
// End of the Middleware




// Start of routes
app.get('/failed', (req, res) => {
    res.redirect(url)
})

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }))

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
  function(req, res) {
        res.redirect(url)
  });

app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback', passport.authenticate('discord', {failureRedirect: '/'}), 
    function(req, res) {
        res.redirect(url)
});


app.post("/users/login", (req, res, next) => {
    passport.authenticate('local', (err, user) => {
        if (err) throw err
        // if no user found or password doesn't match etc
        if (!user) {
            res.status(401).send({name: "Incorrect Credentials", message: "The details you have entered are not correct"})
        } else {
            // log in the user through the request object
            req.logIn(user, err => {
                if (err) throw err
                res.send(user)
            })
        }
    })(req, res, next)
})

app.post('/users/register', (req, res) => {
    //3 args
    //1 new User object
    //2 password => that gets automatically hashed and stored in db
    //3 callback

    User.register(new User({username: req.body.username, displayName: req.body.username}), req.body.password, function(err, user) {
        // creates a new User
        // if theres an error
        if (err) {
            console.log(err)
            // return that error sent in the response object
            return res.send({fail: err})
        } else {
            // if it works, authenticate the user, attaches session cookie to response automatically
            passport.authenticate('local')(req, res, function() {
                return res.send(user)
            })
        }
    })
})

app.get('/users/me', (req, res) => {
    // when the client refreshes the page, it makes a request to this route
    // passport reads the cookie and attaches the user to the req object
    // then we send back the user
    res.send(req.user)
})

app.get('/users/logout', (req, res) => {
    // call the logout function provided by passport
    req.logOut()
    // send an ok
    res.sendStatus(200)
})


app.listen(process.env.PORT || 4000, () => {
    console.log("Server Listening")
})