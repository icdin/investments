const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Admin = mongoose.model('Admin')
const {APP_SECRET} = require('../config/config')

module.exports = (req,res,next)=>{
    const {authorization} = req.headers
    if(!authorization){
        return res.status(401).json('You must be logged in to access this route.')
    }else{
        const token = authorization.replace("Bearer ","")
        jwt.verify(token,APP_SECRET,(err,payload)=>{
            if(err){
                return res.status(401).json({err:'Invalid token'})
            }else{
                const{_id} = payload
                if(_id){
                    const data = Admin.findById(_id)
                    req.user = data
                    next()
                }else{
                    return res.status(401).json({err:'Only site admin can access this route'})
                }
                
            }
        })
    }

}