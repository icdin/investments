const About = require('../models/aboutApp')

module.exports = {
    async addAboutApp(req,res){
        try {
            const{title,body} = req.body
            const checkTitle = await About.findOne({title:title})
            if(checkTitle){
               return res.status(422).json({msg:'Sorry, this title is already used.'})
            }else{
                if(!title || !body){
                    return res.status(422).json({msg:'Please fill out all required fields'})
                }else{
                    const about = About.create({
                        title,body
                    })
                    return res.json(about)
                }
            }
        } catch (error) {
            throw error
        }
    },
    async editAboutApp(req,res){
        try {
            const{title,body} = req.body
            if(!title && !body){
                return res.status(422).json({msg:'No change is made.'})
            }else if(title && !body){
                await About.findByIdAndUpdate(req.body.aboutId,{title:title},{new:true})
                .exec((result,err)=>{
                    if(result){
                        return res.json(result)
                    }else{
                        return res.json(err)
                    }
                })
            }else if(!title && body){
                await About.findByIdAndUpdate(req.body.aboutId,{body:body},{new:true})
                .exec((result,err)=>{
                    if(result){
                        return res.json(result)
                    }else{
                        return res.json(err)
                    }
                })
            }else if(title && body){
                await About.findByIdAndUpdate(req.body.aboutId,{title:title,body:body},{new:true})
                .exec((result,err)=>{
                    if(result){
                        return res.json(result)
                    }else{
                        return res.json(err)
                    }
                })
            }
        } catch (error) {
            throw error
        }
    }
}