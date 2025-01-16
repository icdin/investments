const Question = require('../models/question')
const User = require('../models/user')

module.exports = {
    async newQuestion(req,res){
        try {
            const{userId} = req.body
            if(userId===null){
                const{medium,name,body} = req.body
                if(!medium || !name || !body){
                    return res.json({msg:'Please fill out all required fields.'})
            }else{
                const question = await Question.create({
                    medium,name,body
                })
                return res.json(question)
            }
            }else{
                const queryUser = await User.findById(userId)
            if(queryUser){
                const{email,firstName,phone1} = queryUser
                const{body,viaPhone} = req.body
                if(!body){
                    return res.json({msg:'Please fill out all required fields.'})
            }else{
                let medium
                    if(viaPhone===true){
                         medium = {phone:phone1}
                    }else{
                         medium = {email}
                    }
                const question = await Question.create({
                    medium:medium,
                    name:firstName,body
                })
                console.log(medium)
                return res.json(question)
            }
            }else{
                return res.json({msg:'Sorry, no user found'})
            }
            }
            
        } catch (error) {
            throw error
        }



    },
    async answerQuestion(req,res){
        try {
            const{body,file} = req.body
            if(body || file){
                Question.findByIdAndUpdate(req.params.questionId,{$push:{answers:{by:req.user,body:body,file:file}}},{new:true})
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
    },
    async questions(req,res){
        try {
            await Question.find().then(question=>{
                if(question){
                    return res.json(question)
                }else{
                    return res.json({msg:'Sorry, no question was fetched...'})
                }
            })
        } catch (error) {
            throw error
        }
    }
}