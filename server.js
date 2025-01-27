const express = require("express");
const path = require("path");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { log } = require("console");
require('dotenv').config()

const app = express();


const PORT = 3000;



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

app.get("/blogs", authenticateToken, (req, res) => {
        console.log('req.user', req.user);
        const userName = req.user.username;
        const blogPostByUsername = blogs.filter(blog => blog.username === userName)
        res.json(blogPostByUsername);  
});

app.post("/register", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const userExist = users.find(user => user.username === username);

    if (userExist) {
        res.status(409).send("User already exist");
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

   
    // write to database
    // username 
    // password 
    users.push({
        username: username,
        password: hashPasword
    })
    res.status(201).send("User created successfully");
});

app.post("/login", async(req, res)=> {
    console.log('user', users)

    const username = req.body.username;
    const originalPass = req.body.password;

    if(username && originalPass)
    {
        // get user from database
        const user = users.find((user) => user.username === username)

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

app.listen(PORT, (err) => {
    if (err) console.log("Error in server setup");
    console.log("Server listening on Port http://localhost:"+PORT);
});