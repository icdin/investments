const userAuth = require('../middleware/userAuth')
const Feedback = require('../models/feedback')
const User = require('../models/user')
const nodemailer = require('nodemailer')
const mailGun = require('nodemailer-mailgun-transport')

module.exports = {
    async newFeedback(req,res){
        try {
            const{userId} = req.body
            console.log(userId)
            if(userId===null||userId===''){
                const{email,name,problem,suggestion} = req.body
                if(!email || !name || !problem || !suggestion){
                    return res.json({msg:'Please fill out all required fields.'})
            }else{
                const feedback = await Feedback.create({
                    email,name,problem,suggestion
                })
                return res.json(feedback)
            }
            }else{
                const queryUser = await User.findById(userId)
            if(queryUser){
                const{email,firstName} = queryUser
                const{problem,suggestion} = req.body
                if(!problem){
                    return res.json({msg:'State the problem to help us fix it.'})
            }else{
                const feedback = await Feedback.create({
                    email,
                    problem,
                    suggestion,
                    name:firstName
                })
                return res.json(feedback)
            }
            }else{
                const{name,email,problem,suggestion} = req.body
                if(name&&email&&problem){
                    const feedback = await Feedback.create({
                        email,
                        problem,
                        suggestion,
                        name
                    })
                    return res.json(feedback)
                }
                return res.json({msg:'Sorry, no data is provided.'})
            }
            }
            
        } catch (error) {
            throw error
        }
    },
    async feedbackFixing(req,res){
        try {
            const{feedbackId} = req.params
                Feedback.findByIdAndUpdate(feedbackId,{$set:{fixed:true}},{new:true})
                .exec((err,response)=>{
                    if(response){
                         const feedBackEmail = response.email
                                const auth = {
                                    auth:{
                                        api_key:'1e1ed14f9260bcd7d063c98d1e7f9b0b-27a562f9-3a7a5375',
                                        domain:'zaligi.com'
                                    }
                                }
                                const transporter = nodemailer.createTransport(mailGun(auth))
                                
                                const mailOptions={
                                    from:'noreply@xfindx.com',
                                    to:feedBackEmail,
                                    subject:'Your suggestion has been applied!!!',
                                    html:`
                                    <div style="background:rgb(1, 120, 167);color:white;font-weight:bold;padding:10px;border-radius:5px;">
                                    <img src="./logo.png" alt="xfindx logo" width="70px" height="70px" border-radius="35px" />
                                    <h5 stye="text-align:center;">We want to notify you that the problem below which you gave us feedback on has been fixed. Thanks and keep helping us improve on our services.</h5>
                                    <p style="color:#c8d8e6; text-decoration:none; text-align:center;">${response.problem}</p>
                                    <button style="color:white; border:2px solid white; text-decoration:none; text-align:center;" href='http://localhost:3000'>Click here</button>
                                    </div>
                                    `
                                }
                                transporter.sendMail(mailOptions, function(err, data){
                                if(err){
                                    res.status(500).json(err)
                                }else{
                                    res.status(200).json({mailData:data})
                                }
                                })
                                
                    }else{
                        return res.status(400).json(err)
                    }
                })
        } catch (error) {
            throw error
        }
    },
    async feedbacks(req,res){
        try {
            await Feedback.find().then(feedbacks=>{
                if(feedbacks){
                    return res.json(feedbacks)
                }else{
                    return res.json({msg:'Sorry, no feedbacks was fetched...'})
                }
            })
        } catch (error) {
            throw error
        }
    }
}