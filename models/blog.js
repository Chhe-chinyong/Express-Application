const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = new Schema({
    username: {
        type: String,
    },
    title: 
    {
        type: String,
    },
    content: 
    {
        type: String,
    }
});

// takes two paramter: 
// 1. collection name : users
// 2. Schema
const Blog = mongoose.model('blogs', blogSchema);

module.exports = Blog;


