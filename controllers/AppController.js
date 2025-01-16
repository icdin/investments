const User = require('../models/user')
const AppSetting = require('../models/appSetting')
const nodemailer = require('nodemailer')
require('dotenv').config()

module.exports = {
    async createAppSetting(req,res){
        try {
            const {name,bankName,accountName,accountNumber} = req.body
            const queryApp = await AppSetting.find()
            const user = await User.findById(req.user._id)
            const isOwner = user.isAdmin
            if(queryApp.length>0){
                if(isOwner){
                    await AppSetting.findOneAndDelete({owner:req.user._id}).then(data=>{
                        if(data){
                            return res.status(200).json({resp:'Your app was deleted successfully.'})
                        }
                    })
                }else{
                    returnres.status(401).json({err:'Sorry, only app owner can do this.'})
                }
            }else{
                if(isOwner){
                    const setApp = await AppSetting.create({owner:req.user._id,name,email:req.user.email,phone:req.user.phone,bankName,accountName,accountNumber})
                    setApp.save().then(app=>{
                        if(app){
                            return res.status(200).json({resp:'App created successfully.'})
                        }else{
                            return res.status(400).json({err:'Sorry, your app was not created.'})
                        }
                    })
                }else{
                    return res.status(401).json({err:'Sorry, only app owner can do this.'})
                }
            }
        } catch (error) {
            return res.status(500).json({err:error.message})
        }
    },
    async updateApp(req,res){
        try {
            const app = await AppSetting.find()
            const{personalMin,withdrawable,salaryTarget,withdrawableReBonus,baseSalary, grooveMin,minTime,increment,appMaxLevel,referralBonus,referralExpiration,currency,
                groovePayAllSpeed,grooveFirstPaySpeed,grooveTime,help,savingsTime,personalRate,grooveRate} = req.body;
            const queryAdmin = await User.findById(req.user)
            if(queryAdmin.isAdmin){
                AppSetting.findByIdAndUpdate(app[0]._id,{help:help,withdrawable:withdrawable,personalRate:personalRate,appMaxLevel:appMaxLevel,
                    withdrawableReBonus:withdrawableReBonus,personalMin:personalMin,grooveTime:grooveTime,savingsTime:savingsTime,
                    referralBonus:referralBonus,baseSalary:baseSalary,salaryTarget:salaryTarget,referralExpiration:referralExpiration,groovePayAllSpeed,grooveFirstPaySpeed,
                    grooveRate:grooveRate,increment:increment,currency:currency, grooveMin:grooveMin,minTime:minTime},{new:true})
                .exec((err,resp)=>{
                    if(err){
                        return res.status(500).json({err:err.message})
                    }else if(resp){
                        return res.status(200).json({resp:'App was updated successfully.'})        
                    }
                })
            }else{
                return res.status(401).json({err:'Sorry, only app owner can do this.'})
            }
        } catch (error) {
            return res.status(500).json({err:error.message})
        }
    },
    async getApp(req,res){
        try {
            const app = await AppSetting.find()
            const queryAdmin = await User.findById(req.user)
            if(queryAdmin.isAdmin){
                AppSetting.find(appId).then(app=>{
                    if(app){
                        return res.status(200).json({resp:app[0]})
                    }else{
                        return res.status(500).json({err:error.message})
                    }
                }).catch(err=> res.status(500).json({err:err.message}))
            }
            return
        } catch (error) {
            return res.status(500).json({err:error.message})
        }
    },
    async userRegistration(req,res){
        try {
            const user = await User.findById(req.user._id)
            const isOwner = user.isAdmin
            const app = await AppSetting.find({ower:req.user._id})
            
            if(app.length>0){
                const appObj = app[0]
                if(isOwner){
                    if(appObj.userRegistration===true){
                        AppSetting.findOneAndUpdate({ower:req.user._id},{$set:{userRegistration:false}},{new:true})
                        .exec((err,resp)=>{
                            if(err){
                                return res.status(400).json({err:'Sorry, an error occured.'})
                            }else{
                                return res.status(200).json({response:resp})
                            }
                        })
                    }else{
                        AppSetting.findOneAndUpdate({ower:req.user._id},{$set:{userRegistration:true}},{new:true})
                        .exec((err,resp)=>{
                            if(err){
                                return res.status(400).json({err:'Sorry, an error occured.'})
                            }else{
                                return res.status(200).json({response:resp})
                            }
                        })
                    }
                }else{
                    return res.status(401).json({err:'Sorry, only app admin can do this.'})
                }
            }else{
                return res.status(400).json({err:'Sorry, no setting is available.'})
            }
        } catch (error) {
            throw error.message
        }
    },
 async deleteAppUsers(req,res){
    try {
        const user = await User.findById(req.user._id)
        const isOwner = user.isAdmin
        const users = await User.find()

        if(isOwner){
          if(users.length>0){
            await User.deleteMany().then(data=>{
                if(data){
                    return res.status(200).json({response:'All users have been deleted from the platform'})
                }else{
                    return res.status(400).json({err:'Sorry, there was an error.'})
                }})
          }else{
            return res.status(400).json({err:'Sorry, there is no user to delete'})
          }
        }else{
            return res.status(401).json({err:'Sorry, only app admin can delete users.'})
        }
    } catch (error) {
        throw error.message
    }
 },
 async getAppSetting(req,res){
    try {
       AppSetting.find().then(resp=>{
        if(resp){
            return res.status(200).json({resp:resp[0]})
        }else{
            return res.status(400).json({err:err.message})
        }
    })
    } catch (error) {
        throw error.message
    }
 },
 async deleteAUser(req,res){
    try {
        const user = await User.findById(req.user._id)
        const isOwner = user.isAdmin
        const users = await User.find()

        if(isOwner){
          if(users.length>0){
            await User.findByIdAndDelete().then(data=>{
                if(data){
                    return res.status(200).json({response:'All users have been deleted from the platform'})
                }else{
                    return res.status(400).json({err:'Sorry, there was an error.'})
                }})
          }else{
            return res.status(400).json({err:'Sorry, there is no user to delete'})
          }
        }else{
            return res.status(401).json({err:'Sorry, only app admin can delete users.'})
        }
    } catch (error) {
        throw error.message
    }
 },
 async replyUserReport(req,res){
    try {
        const{reportId,content,receiver,app} = req.body
        const lastThreeUser = req.user._id.toString().slice(21)
        const lastFourApp = app.toString().slice(20)
        const replyId = lastThreeUser+lastFourApp
        console.log(reportId,content,receiver,app)
        const reply = {replyId:replyId,content:content,read:false}
        User.findOneAndUpdate({email:receiver,'reports.reportId':reportId},{$push:{'reports.$.replies':reply}},{new:true})
        .exec((err,resp)=>{
            if(resp){
                AppSetting.findOneAndUpdate({_id:app,'reports.reportId':reportId},{$push:{'reports.$.replies':reply}},{new:true})
                .exec((err,resp)=>{
                    if(resp){
                        User.findOneAndUpdate({email:receiver,'reports.reportId':reportId},{$set:{'reports.$.replied':true}},{new:true})
                        .exec((err,resp)=>{
                            if(resp){
                                AppSetting.findOneAndUpdate({_id:app,'reports.reportId':reportId},{$set:{'reports.$.replied':true}},{new:true})
                                .exec((err,resp)=>{
                                    if(resp){
                                        return res.status(200).json({response:'Reply sent.'})        
                                    }else if(err){
                                        return res.status(400).json({err:err.message})                
                                    }
                                })
                            }else if(err){
                                return res.status(400).json({err:err.message})        
                            }
                        })
                    }else if(err){
                        return res.status(400).json({err:err.message})
                    }
                })
            }else if(err){
            return res.status(400).json({err:err.message})
            }
        })
    } catch (error) {
        throw error.message
    }
 },
 async readUserReport(req,res){
    try {
        
        const apps = await AppSetting.find()
        const reportObj = apps[0]
        const reports = reportObj.reports
        const unreadReport = reports.filter(filt=>filt.read===false)
        const unreadReportObj = unreadReport[0]
        const email = unreadReportObj.sender
        const reportId = unreadReportObj.reportId
        const app = reportObj._id

        AppSetting.findOneAndUpdate({_id:app,'reports.reportId':reportId},{$set:{'reports.$.read':true}},{new:true})
        .exec((err,resp)=>{
            if(resp){
                User.findOneAndUpdate({email:email,'reports.reportId':reportId},{$set:{'reports.$.read':true}},{new:true})
                .exec((err,resp)=>{
                    if(err){
                        return res.status(400).json({err:err.message})
                    }else if(resp){
                        return res.status(200).json({response:'Report read'})
                    }
                })
            }else if(err){
                return res.status(400).json({err:err.message})
            }
        })
    } catch (error) {
        throw error.message
    }
 },
 async newsletterSubscription(req,res){
     try {
         const{email,appId} = req.body
        const newObj = {email,date:Date.now()}
        AppSetting.findOneAndUpdate({_id:appId},{$push:{newsletterSubscribers:newObj}},{new:true})
        .exec((err,resp)=>{
            if(err){
                return res.status(400).json({err:err.message})
            }else if (resp){
                return res.status(200).json({response:'Thanks for subscribing to our newsletter.'})
            }
        })
    } catch (error) {
        return res.status(400).json({err:error.message})
    }
 },
 async newNewsletterToSubscribers(req,res){
    try {
        const {title,body,recipient,appId,disclaimer,site} = req.body
        
        const app = await AppSetting.findOne({_id:appId})
        
        const shops = await Shop.find()
        const regularshops = shops.filter(filt=>filt.isPremium===false)
        const premiumshops = shops.filter(filt=>filt.isPremium===true)
        const newObj = 
        {title:title,body:body,sender:req.user,recipient:recipient,date:Date.now()}
       if(title&&body&&recipient&&appId){
        AppSetting.findOneAndUpdate({_id:appId},{$push:{newsletters:newObj}},{new:true})
        .exec((err,resp)=>{
            if(err){
                return res.status(400).json({err:err.message})
            }else if(resp){
                
        if(recipient==='personal'){
            const subscribers = app.newsletterSubscribers
            subscribers.forEach(item=>{
                const transporter = nodemailer.createTransport({
                    service:'gmail',
                    auth:{
                        user:process.env.email,
                        pass:process.env.pass
                    },
                    host:'smtp.gmail.com',
                    port:465,
                    secure:true
                })
                const mailOptions = {
                    from:process.env.email,
                    to:item.email,
                    subject:title,
                    html:`<div style="margin:30px 30px;box-shadow:2px 2px 2px rgb(220,220,220); padding:20px 20px;background:hsl(210,55%,8%);border-radius:5px;">
                    <h1 style="color:#fff;font-weight:bold;padding:20px 10px;text-align:center;">${title}</h1>
                    <h3 style="color:#fff;font-weight:bold;padding:20px 10px;text-align:center;">${site}</h3>
                    <p style="color:#eee;font-size:14px;padding:20px 10px;text-align:justify;">${body}</p>
                    <p style="color:#eee;font-style:italic;font-size:12px;padding:20px 10px;margin-top:50px;text-align:justify;">${disclaimer}</p>
                    </div>`
                }
                transporter.sendMail(mailOptions,function(err,data){
                    if(err){
                        return res.status(400).json({err:err.message})
                    }else if(data){
                        return res.status(200).json({response:`Mail sent to ${subscribers.length} subscribers`})
                    }
                })
            })
           
        }else if(recipient==='businesses'){
            shops.forEach(item=>{
                const transporter = nodemailer.createTransport({
                    service:'gmail',
                    auth:{
                        user:process.env.email,
                        pass:process.env.pass
                    },
                    host:'smtp.gmail.com',
                    port:465,
                    secure:true
                })
                const mailOptions = {
                    from:process.env.email,
                    to:item.email,
                    subject:title,
                    html:`<div style="margin:30px 30px;box-shadow:2px 2px 2px rgb(220,220,220); padding:20px 20px;background:hsl(210,55%,8%);border-radius:5px;">
                    <h1 style="color:#fff;font-weight:bold;padding:20px 10px;text-align:center;">${title}</h1>
                    <h3 style="color:#fff;font-weight:bold;padding:20px 10px;text-align:center;">${site}</h3>
                    <p style="color:#eee;font-size:14px;padding:20px 10px;text-align:justify;">${body}</p>
                    <p style="color:#eee;font-style:italic;font-size:12px;padding:20px 10px;margin-top:50px;text-align:justify;">${disclaimer}</p>
                    </div>`
                }
                transporter.sendMail(mailOptions,function(err,data){
                    if(err){
                        return res.status(400).json({err:err.message})
                    }else if(data){
                        return res.status(200).json({response:`Mail sent to ${shops.length} businesses.`})
                    }
                })
            })
        }else if(recipient==='premium'){
            shops.forEach(item=>{
                if(item.isPremium===true){
            const transporter = nodemailer.createTransport({
                service:'gmail',
                auth:{
                    user:process.env.email,
                    pass:process.env.pass
                },
                host:'smtp.gmail.com',
                port:465,
                secure:true
            })
            const mailOptions = {
                from:process.env.email,
                to:item.email,
                subject:title,
                html:`<div style="margin:30px 30px;box-shadow:2px 2px 2px rgb(220,220,220); padding:20px 20px;background:hsl(210,55%,8%);border-radius:5px;">
                <h1 style="color:#fff;font-weight:bold;padding:20px 10px;text-align:center;">${title}</h1>
                <h3 style="color:#fff;font-weight:bold;padding:20px 10px;text-align:center;">${site}</h3>
                <p style="color:#eee;font-size:14px;padding:20px 10px;text-align:justify;">${body}</p>
                <p style="color:#eee;font-style:italic;font-size:12px;padding:20px 10px;margin-top:50px;text-align:justify;">${disclaimer}</p>
                </div>`
            }
            transporter.sendMail(mailOptions,function(err,data){
                if(err){
                    return res.status(400).json({err:err.message})
                }else if(data){
                    return res.status(200).json({response:`Mail sent to ${premiumshops.length} premium businesses.`})
                }
            })
        }
    })
        }else if('regular'){
            shops.forEach(item=>{
                if(item.isPremium===false){
            const transporter = nodemailer.createTransport({
                service:'gmail',
                auth:{
                    user:process.env.email,
                    pass:process.env.pass
                },
                host:'smtp.gmail.com',
                port:465,
                secure:true
            })
            const mailOptions = {
                from:process.env.email,
                to:item.email,
                subject:title,
                html:`<div style="margin:30px 30px;box-shadow:2px 2px 2px rgb(220,220,220); padding:20px 20px;background:hsl(210,55%,8%);border-radius:5px;">
                <h1 style="color:#fff;font-weight:bold;padding:20px 10px;text-align:center;">${title}</h1>
                <h3 style="color:#fff;font-weight:bold;padding:20px 10px;text-align:center;">${site}</h3>
                <p style="color:#eee;font-size:14px;padding:20px 10px;text-align:justify;">${body}</p>
                <p style="color:#eee;font-style:italic;font-size:12px;padding:20px 10px;margin-top:50px;text-align:justify;">${disclaimer}</p>
                </div>`
            }
            transporter.sendMail(mailOptions,function(err,data){
                if(err){
                    return res.status(400).json({err:err.message})
                }else if(data){
                    return res.status(200).json({response:`Mail sent to ${regularshops.length} regular businesses.`})
                }
            })
        }
    })
        }
            }
        })
       }else{
        return res.status(400).json({err:'Fill out all required fields.'})
       }
    } catch (error) {
        return res.status(400).json({err:error.message})
    }
 },
 async joinStaffs(req,res){
    try{
        if(req.user.isStaff){
            return res.status(422).json({err:'You\'re already our staff.'})
        }else{
            User.findByIdAndUpdate(req.user,{$set:{isStaff:true}},{new:true})
        .exec((err,resp)=>{
            if(err){
                return res.status(500).json({err:err.message})
            }else if(resp){
                return res.status(200).json({resp:'Application confirmed'})
            }else{
                return res.status(422).json({err:'Sorry, something went wrong.'})
            }
        })
        }
    }catch(err){
        return re.status(500).json({err:err.message})
    }
 },
 async createCashier(req,res){
    try{
        const{email} = req.body
        const users = await User.find();
        const app = await AppSetting.find()
        const applicants = app[0].applicants
        const user = applicants.filter(filt=>filt===email)[0]
        const queryCashier = users.filter(filt=>filt.isCashier===true||filt.email===user);
        if(queryCashier.length>0 && user){
            User.findOneAndUpdate({email:email},{$set:{isCashier:true}},{new:true})
            .exec((err,resp)=>{
                if(err){
                    return res.status(500).json({err:err.message})
                }else if(resp){
                    AppSetting.findOneAndUpdate({_id:app[0]._id},{$pull:{applicants:email}},{new:true})
                    .exec((err,resp)=>{
                        if(err){
                            return res.status(500).json({err:err.message})
                        }else if(resp){
                            return res.status(200).json({resp:`${user} was successfully employed as a cashier.`})
                        }
                    })
                }
            })
        }else if(!user){
            return res.status(404).json({err:`Please register ${email} and apply to work as cashier.`})
        }else if(user && queryCashier.length>0){
            return res.status(401).json({err:`${user} is already a cashier.`})
        }
    }catch(err){
        return res.status(500).json({err:err.message})
    }
 },
 async cashierApplication(req,res){
    try{
        const app = await AppSetting.find()
        const applicants = app[0].applicants
        const queryApplicant = applicants.filter(filt=>filt===req.user.email)
        const applicant = queryApplicant[0];

        if(applicant){
            return res.status(401).json({err:`${req.user.userName} application is pending. Wait for confirmation.`})
        }else{
            if(req.user.isCashier===true){
                return res.status(401).json({err:`You\'re already our cashier.`})
            }else if(req.user.isCashier===false){
            AppSetting.findOneAndUpdate({_id:app[0]._id},{$push:{applicants:req.user.email}},{new:true})
            .exec((err,resp)=>{
                if(err){
                    return res.status(500).json({err:err.message})
                }else if(resp){
                    return res.status(200).json({resp:`Your application was sent!`})
                }
            })
        
            }
        }
    }catch(err){
        return res.status(500).json({err:err.message})
    }
 }
}