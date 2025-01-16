const mongoose = require('mongoose');
const mailsSchema = new mongoose.Schema({
    email:String
})
module.exports = mongoose.model('Mails', mailsSchema)