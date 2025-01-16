const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const {USER_SECRET} = require('../config/config')

module.exports = {
    userAuth(req,res,next){
    const {authorization} = req.headers
    if(!authorization){
        return res.status(401).json("You must be logged in to access this route")
    }
    const token = authorization.replace("Bearer ", "")
    jwt.verify(token,USER_SECRET,(err,payload)=>{
        if(payload){
            const {_id} = payload
            User.findById(_id).then(userData=>{
                req.user = userData
                next()    
            })
        }       
    })
}
}