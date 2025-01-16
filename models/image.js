const mongoose = require('mongoose')
const imageSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    image:{
        data:Buffer,
        contentType:String
    }
})
module.exports = mongoose.model('Image', imageSchema)