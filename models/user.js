const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: 
    {
        type: String,
        required: true,
        maxLength: 124,
        minLength: 8
    },
    email: 
    {
        type: String,
        required: true,
        unique: true,
    }
});

// takes two paramter: 
// 1. collection name : users
// 2. Schema
const User = mongoose.model('users', userSchema);

module.exports = User;


