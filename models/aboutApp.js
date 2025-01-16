const mongoose = require('mongoose')
const abouAppSchema = new mongoose.Schema({
    title:{type:String, required:true},
    body:{type:String, required:true},
    updatedAt:{
        type:Date,
        default:Date.now()
    }
},{timestamps:true})
module.exports = mongoose.model('About', abouAppSchema)