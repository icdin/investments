const mongoose = require('mongoose');
const testerSchema = new mongoose.Schema({
    name:String,
    date:Date
})
module.exports = mongoose.model('Tester', testerSchema)