const mongoose = require('mongoose')
const feedbackSchema = new mongoose.Schema({
    problem:{
        type:String
    },
    suggestion:{
        type:String
    },
    name:{
        type:String
    },
    email:{
            type:String,
            match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
        },
    fixed:{
        type:Boolean,
        default:false
    }
})

module.exports = mongoose.model('Feedback',feedbackSchema)