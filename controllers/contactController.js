const userAuth = require('../middleware/userAuth')
const Contact = require('../models/contact')
const User = require('../models/user')
const nodemailer = require('nodemailer')
const mailGun = require('nodemailer-mailgun-transport')
const Support = require('../models/support')

module.exports = {
    async newContact(req,res){
        try {
            const{userId} = req.body
            if(userId===null||userId===''){
                const{email,name,topic,description} = req.body
                if(!email || !name || !topic || !description){
                    return res.json({msg:'Please fill out all required fields.'})
            }else{
                const contact = await Contact.create({
                    email,name,topic,description
                })
                return res.json(contact)
            }
            }else{
                const queryUser = await User.findById(userId)
            if(queryUser){
                const{email,firstName} = queryUser
                const{topic,description} = req.body
                if(!topic){
                    return res.json({msg:'State the topic to help us fix it.'})
            }else{
                const contact = await Contact.create({
                    email,
                    topic,
                    description,
                    name:firstName
                })
                return res.json(contact)
            }
            }else{
                const{name,email,topic,description} = req.body
                if(name&&email&&topic){
                    const contact = await Contact.create({
                        email,
                        topic,
                        description,
                        name
                    })
                    return res.json(contact)
                }
                return res.json({msg:'Sorry, no data is provided.'})
            }
            }
            
        } catch (error) {
            throw error
        }
    },
    async contactResponse(req,res){
        try {
            const{contactId} = req.params
            Contact.findByIdAndUpdate(contactId,{$push:{response:req.body.reply}},{new:true})
            .exec((err,resp)=>{
                if(resp){
                    Contact.findByIdAndUpdate(contactId,{$set:{replied:true}},{new:true})
                    .exec((err,response)=>{
                        if(response){
                            Support.create({support:response,solution}).then(resp=>{
                                if(resp){
                                    const contactEmail = response.email
                                    const auth = {
                                        auth:{
                                            api_key:'1e1ed14f9260bcd7d063c98d1e7f9b0b-27a562f9-3a7a5375',
                                            domain:'zaligi.com'
                                        }
                                    }
                                    const transporter = nodemailer.createTransport(mailGun(auth))
                                    
                                    const mailOptions={
                                        from:'noreply@xfindx.com',
                                        to:contactEmail,
                                        subject:'This is a reply to your message',
                                        html:`
                                        <div style="background:rgb(1, 120, 167);color:white;font-weight:bold;padding:10px;border-radius:5px;">
                                        <p>${req.body.reply}</p>
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
                                    return res.json({msg:'Sorry, the support was not updated.',errorMsg:err})
                                }
                            })
                        }else{
                            return res.status(400).json(err)
                        }
                    })
                }else{
                    return res.json({msg:'Sorry, the reply was not updated'})
                }
            })
               
        } catch (error) {
            throw error
        }
    },
    async contacts(req,res){
        try {
            await Contact.find().then(contacts=>{
                if(contacts){
                    return res.json(contacts)
                }else{
                    return res.json({msg:'Sorry, no contacts was fetched...'})
                }
            })
        } catch (error) {
            throw error
        }
    }
}