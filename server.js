const express = require("express");
const path = require("path");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { log } = require("console");
const mongoose = require('mongoose');
const User = require('./models/user');
const Blog = require('./models/blog');

require('dotenv').config()

const app = express();


const PORT = 3000;

// Conect to mongoDB
try {
    mongoose.connect(process.env.CONNECTION_STRING, {
        family: 4
    });
    console.log("Database connected successfully");
    app.listen(PORT, (err) => {
        if (err) console.log("Error in server setup");
        console.log("Server listening on Port http://localhost:"+PORT);
    });
}
catch (err) {
    console.log(err);
    console.log("Error in connecting to database");
}



// express app to json format 
app.use(express.json());

// express app receive from form data 
app.use(express.urlencoded({ extended: true }));

const users = [
    {
        username: "john",
        password: "password123member"
    },
    {
        username: "anna",
        password: "password123member"
    }
];

const blogs = [
    {
        id: 1,
        title: "Blog 1",
        content: "Content of Blog 1",
        username: "john",
    },
    {
        id: 2,
        title: "Blog 2",
        content: "Content of Blog 2",
        username: "dara koko",
    },
    {
        id: 3,
        title: "Blog 3",
        content: "Content of Blog 3",
        username: 'anna'
    }
]


app.get("/", (req, res) => {
    res.send("Hello World");
});

app.get("/blogs", authenticateToken, async(req, res) => {
    try{    
        // query from database to get blogs by username

        const username = req.user.username;

        console.log('username', username);

        const blogPostByUsername = await Blog.find({username: username});

        if (blogPostByUsername.length > 1){
            res.status(404).send('blog not found');
        }
        res.json({
            blogPostByUsername
        })
    }
    catch {

    }



        // console.log('req.user', req.user);
        // const userName = req.user.username;
        // const blogPostByUsername = blogs.filter(blog => blog.username === userName)
        // res.json(blogPostByUsername);  
});

app.post("/register", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    // get user collection to check whether user existed or not.
    try {
        // Check if user already existed 
        const userExist =  await User.findOne({ username });
        const emailExist =  await User.findOne({ email });
        if (userExist) {
            res.status(409).send("User already exist");
            return
        }

        if (emailExist)
        {
            res.status(409).send("Email already exist");
            return
        }

         // Validation layer of request
        if (!username || !password) {
            res.status(400).send("Please enter username and password");
            return;
        }

        // min password length 8 
        if (password.length < 8) 
        {
            res.status(400).send("Password must be at least 8 characters");
            return;
        }

        // encrypt password
        // hash password
        const hashPasword =  await bcrypt.hash(password, 10);

        console.log('hashPasword', hashPasword);

        const user = new User(
            {
                username: username,
                password: hashPasword,
                email: email
            }
        )

        // write to database
        // username 
        // password 
        await user.save();
        res.status(201).send("User created successfully");

    }
    catch(error){
        res.status(500).send('Internal server error')
    }


});

app.post("/login", async(req, res)=> {

    const username = req.body.username;
    const originalPass = req.body.password;

    if(username && originalPass)
    {

        try {
            // get user from database
            const user = await User.findOne({username});

            if(!user)
            {
                return res.status(400).send("Invalid credential");
            }

            const correctPassword = await bcrypt.compare(originalPass, user.password);

            if(!correctPassword)
            {
                return res.status(400).send("Invalid credential");
            }
    
            console.log('process.env.SECRET_KEY', process.env.SECRET_KEY);
            // retrurn token to user;
            const usernameData = 
            {
                username: user.username
            }
    
            // 1. userNameData is payload 
            // 2. process.env.SECRET_KEY is secret key
            const access_token = generateAccessToken(usernameData)
    
            console.log('access_token',access_token);
            return res.status(200).json({
                access_token: access_token
            });

        }
        catch(error){
            res.status(500).send('Internal server error')
        }
    }

    else 
    {
        return res.status(400).send('Username & password is required');
    }
});


function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];

    if(!token)
    {
        return res.status(401).send('Access Token is required because the route is protected');
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, user) =>{
        if (err) {
            return res.status(403).send('Invalid Token');
        }

        req.user = user;
        next();
    })
}

function generateAccessToken(usernameData){
    return jwt.sign(usernameData, process.env.SECRET_KEY, {expiresIn: '15m'})
}
