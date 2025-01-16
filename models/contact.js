const mongoose = require('mongoose')
const contactSchema = new mongoose.Schema({
    topic:{
        type:String
    },
    description:{
        type:String
    },
    name:{
        type:String
    },
    email:{
            type:String,
            match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
        },
    replied:{
        type:Boolean,
        default:false
    },
    response:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model('Contact',contactSchema)