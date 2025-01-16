const mongoose = require('mongoose')
const deletedUserSchema = new mongoose.Schema({
    deletedUsers:[]
})
module.exports = mongoose.model('DeletedUser', deletedUserSchema)