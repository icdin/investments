const AppSetting = require('../models/appSetting')
const Support = require('../models/support')

module.exports = {
    async getSupports(req,res){
        try {
            await Support.find().then(response=>{
                if(response){
                    return res.status(200).json(response)
                }else{
                    return res.status(404).json({msg:'Sorry, no result was found.'})
                }
            })
        } catch (error) {
            throw error
        }
    },
    async newSupport(req,res){
        try {
            const{problem,solution,image,appId} = req.body
            const aDate = new Date()
            const rands = Math.floor(Math.random(494930)*6)
            const val = aDate+rands
            if(image===''){
                const newSupport = {problem:problem,author:req.user.email,solution:solution,supportId:val,image:'',helped:[]}
                AppSetting.findOneAndUpdate({_id:appId},{$push:{supports:newSupport}},{new:true})
                .exec((err,resp)=>{
                    if(err){
                        return res.status(400).json({err:err.message})
                    }else if(resp){
                        return res.status(200).json({resp:'Support created'})
                    }
                })
            }else{
                const newSupport = {problem:problem,author:req.user,solution:solution,supportId:val,image:image,helped:[]}
            AppSetting.findOneAndUpdate({_id:appId},{$push:{supports:newSupport}},{new:true})
            .exec((err,resp)=>{
                if(err){
                    return res.status(400).json({err:err.message})
                }else if(resp){
                    return res.status(200).json({resp:'Support created'})
                }
            })
            }
        } catch (error) {
            return res.status(400).json({err:error.message})
        }
    },
async supportComment(req,res){
    try {
        const{comment,appId} = req.body
        const{supportId} = req.params
        const newComment = {comment:comment,supportId:supportId}
        
            AppSetting.findOneAndUpdate({_id:appId},{$push:{helped:newComment}},{new:true})
            .exec((err,resp)=>{
                if(err){
                    return res.status(400).json({err:err.message})
                }else if(resp){
                    return res.status(200).json({resp:'Thanks for your review.'})
                }
            })
    } catch (error) {
        return res.status(400).json({err:error.message})
    }
},
async updateSupport(req,res){
    const{problem,solution,image} = req.body
    const{supportId} = req.params
    try {
        const apps = await AppSetting.find()
        const supports = apps[0].supports
        const filter = supports.filter(filt=>filt.supportId.toString()!==supportId.toString())
        const filt = supports.filter(filt=>filt.supportId.toString()===supportId.toString())
        const helped = filt[0].helped
        const index = supports.indexOf(supportId)
        const newSupport = {problem:problem,author:req.user.email,solution:solution,supportId:val,image:image,helped:helped,lastUpdated:Date.now()}
        const newSupports = filter.splice(index,0,newSupport)

        AppSetting.findOneAndUpdate({_id:appId},{$set:{supports:newSupports}},{new:true})
        .exec((err,resp)=>{
            if(err){
                return res.status(400).json({err:err.message})
            }else if(resp){
                return res.status(200).json({response:'Support updated'})
            }
        })
    } catch (error) {
        return res.status(400).json({err:error.message})
    }
}
}