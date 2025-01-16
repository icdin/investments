const mongoose = require('mongoose')
const supportSchema = new mongoose.Schema({
    problem:String,
    solution:String,
    image:String,
    comments:[],
    likes:[]
})
module.exports = mongoose.model('Support',supportSchema)