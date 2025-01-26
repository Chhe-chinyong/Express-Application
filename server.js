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
]


app.get("/", (req, res) => {
    res.send("Hello World");
})

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
        const usernameData = user.username;
        const access_token = jwt.sign(usernameData, process.env.SECRET_KEY)

        console.log('access_token',access_token);
        return res.status(200).json({
            access_token: access_token
        });
    }

    else 
    {
        return res.status(400).send('Username & password is required');
    }


})



app.listen(PORT, (err) => {
    if (err) console.log("Error in server setup");
    console.log("Server listening on Port http://localhost:"+PORT);
});