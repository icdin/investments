const bcrypt = require('bcrypt')
const User = require('../models/user')
const Admin = require('../models/admin')
const Mails = require('../models/mails')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
require('dotenv').config()
const {USER_SECRET,PASSWORD_RESET_SECRET,adminEmails,mailPass,mailEmail,mailPort,mailHost,CLIENT_URL} = require('../config/config')

module.exports = {
    async checkEmail(req,res){
        try {
            const{email} = req.body
            const queryMail = await User.findOne({email:email})
            if(queryMail){
                return res.status(400).json({err:'Sorry, this email is not available'})
            }else{
                return res.status(200).json({resp:'Congrats!'})
            }
        } catch (error) {
            return res.status(500).json({err:error})
        }
    },
    async createAccount(req,res){
        try {
            const{email,referrer} = req.body
            const queryMail = await Mails.findOne({email:email})
        const token = jwt.sign({email},USER_SECRET,{expiresIn:'1h'})

        const transporter = nodemailer.createTransport({
            auth:{
                user:mailEmail,
                pass:mailPass
            },
            host: mailHost,
            port: mailPort,
            secure: true
        })
        const mailOptions = {
            from:mailEmail,
            to:email,
            subject:'Email validation.',
            html:`
            <div style="background:#eee;padding:10px;border-radius:5px;">
            <img src=".logo.png" alt="site logo" width="70px" height="70px" border-radius="35px" />
            <h5 stye="text-align:center;">If you are the one who initiated this registration, authorize it by clicking the link below:</h5>
            ${CLIENT_URL}/${token}/${email}/${referrer?referrer:'self'}/authentication
            <h5>If you are not redirected to the site automatically, you may also copy and paste the link into your URL.</h5>
            
            </div>
            `
        }
        transporter.sendMail(mailOptions, function(err, data){
        if(err){
            res.status(400).json({err:err.message})
        }else{
            if(queryMail){
                Mails.findOneAndUpdate({email:email},{$set:{email:email}},{new:true})
                .exec((err,resp)=>{
                    if(err){
                        return res.status(400).json({err:err.message})
                    }else if(resp){
                        return res.status(200).json({mailData:data,token:token})
                    }
                })
            }else{
                Mails.create({email}).then(mail=>{
                    if(mail){
                        return res.status(200).json({mailData:data,token:token})
                    }else{
                        return res.status(500).json({err:'Please try again.'})
                    }
                }).catch(err=> res.status(500).json({err:err.message}))
            }
        }
        })
            
        } catch (err) {
            return res.status(500).json({err:err.message})
        }
    },
    async accountActivation(req,res){
        try {
            const{token,email} = req.body
            jwt.verify(token,USER_SECRET, (err,payload)=>{
                if(err){
                    return res.status(403).json('Expired or invalid token.')
                }else{
                    return res.status(200).json(email)
                }
            })
        } catch (error) {
            return res.status(500).json({err:error})
        }
    },
    async deleteAccount(req,res){
        const {id} = req.body
        try {
            User.findByIdAndDelete(id).then(data=>{
                if(data){
                return res.json({resp:data})
            }else{
                return res.json({err:"error deleting the user"})
            }
                
        })
        } catch (error) {
            return res.status(500).json({err:error})
        }
    },
    async checkUserName(req,res){
try {
    const {userName,lastName,firstName} = req.body
    var usernameExists = await User.findOne({userName:userName})
        if(usernameExists){
                function randGen1(max){
                    const availableName1 = userName+Math.floor(Math.random() * max)
                    return availableName1+1
                }
                function randGen2(){
                    const availableName2 = firstName+lastName
                    return availableName2+1
                }
                function randGen3(){
                    const availableName3 = lastName+firstName
                    return availableName3+1
                }
                function randGen4(max){
                    const availableName4 = firstName+Math.floor(Math.random() * max)
                    return availableName4+1
                }
                function randGen5(max){
                    const availableName5 = lastName+Math.floor(Math.random() * max)
                    return availableName5+1
                }
                function randGen6(max){
                    const availableName6 = firstName+lastName+Math.floor(Math.random() * max)
                    return availableName6+1
                }
                function randGen7(max){
                    const availableName7 = lastName+firstName+Math.floor(Math.random() * max)
                    return availableName7+1
                }
                function randGen8(max){
                    const availableName8 = Math.floor(Math.random() * max)
                    return availableName8+1
                }
                const suggestedName1 = await User.find({userName:randGen1(2)})
                    const suggestedName2 = await User.find({userName:randGen2()})
                    const suggestedName3 = await User.find({userName:randGen3()})
                    const suggestedName4 = await User.find({userName:randGen4(2)})
                    const suggestedName5 = await User.find({userName:randGen5(2)})
                    const suggestedName6 = await User.find({userName:randGen6(2)})
                    const suggestedName7 = await User.find({userName:randGen7(2)})
                    if(suggestedName1.length <1){
                       return res.json({err:`${userName} is taken. Try ${randGen1(2)} instead.`})
                   }else if(suggestedName2.length <1){
                    return res.json({err:`${userName} is taken. Try ${randGen2(2)} instead.`})
                   }else if(suggestedName3.length <1){
                        return res.json({err:`${userName} is taken. Try ${randGen3(2)} instead.`})
                   }else if(suggestedName4.length <1){
                        return res.json({err:`${userName} is taken. Try ${randGen4(2)} instead.`})
                   }else if(suggestedName5.length <1){
                        return res.json({err:`${userName} is taken. Try ${randGen5(2)} instead.`})
                   }else if(suggestedName6.length <1){
                        return res.json({err:`${userName} is taken. Try ${randGen6(2)} instead.`})
                   }else if(suggestedName7.length <1){
                        return res.json({err:`${userName} is taken. Try ${randGen7(2)} instead.`})
                   }else{
                       return res.json({err:'Try another user name'})
                   }
                }else if(!usernameExists){
                    return res.json({resp:`${userName} is available!`})
                }
} catch (error) {
    return res.status(500).json({err:error.message});
}
    },
    async register(req,res){
        const {userName,firstName,lastName,middleName,phone,email,country,password,confirmedPassword,referrer} = req.body
        const queryRef = await User.findOne({userName:referrer})
        try {
            if(!userName || !firstName||!lastName||!phone||!email||!password ||!country || !confirmedPassword){
                return res.status(422).json({
                    err:"Please fill out all required fields"
                })
            }
            else if(confirmedPassword !== password){
                return res.status(422).json({
                    err:'Sorry, the passwords do not match'
                })
            }else if(password.length<8){
                return res.status(401).json({err:`Password must be minimum 8 characters.`})
            }else if(password.length>100){
                return res.status(401).json({err:`Password must be maximum 100 characters.`})
            }if(password.includes(userName)||password.includes(firstName)||password.includes(lastName)||password.includes(middleName)){
                return res.status(401).json({err:`Passwords that contain your details can be easily guessed.`})
            }else if(password.length>=8){
                const queryMail = await Mails.findOne({email:email})
                if(queryMail){
                    await User.findOne({email:email}).then(emailUsed=>{
                        if(emailUsed){
                            return res.status(422).json({
                                err:"This email is not available, login instead?"
                            })
                        }
                        const queryAdmin = adminEmails.indexOf(email)
                            bcrypt.hash(password,12).then(hashedPassword=>{
                                User.create({
                                    userName:`${userName.toLowerCase()}`,
                                    firstName,
                                    lastName,
                                    middleName,
                                    phone,
                                    email,
                                    country,
                                    isAdmin:queryAdmin >=0?true:false,
                                    password:hashedPassword,
                                    usedPasswords:[password],
                                    orbits:[{orbit:1,worth:0,level:0,paymentId:null,date:null,save:0,nextWithdrawal:null}],
                                    savings:[],
                                    paid:0,
                                    received:0,
                                    referrer:referrer==='self'?null:{user:queryRef.email,used:false,expired:false,date:new Date()}
                                }).then(val=>{
                                    if(val){
                                        return res.status(200).json({resp:'Registration successful.'})
                                    }else{
                                        return res.status(500).json({err:'Sorry, something went wrong.'})
                                    }
                                })
                        })
                        
                                      
                    })
                }else{
                    return res.status(401).json({err:`Sorry ${email} hasn\'t been confirmed.`})
                }
            }
          
        } catch (error) {
            return res.status(500).json({err:error.message})
        }
    }
,
    async passwordReset(req,res){
        try {
            const{email } = req.body
            await User.findOne({email:email}).then(data=>{
                if(!data){
                    return res.status(400).json({err:`Sorry, ${email} was not found.`})
                }else{
                    const token = jwt.sign({email},PASSWORD_RESET_SECRET,{expiresIn:'20m'})
                    
                    const transporter = nodemailer.createTransport({
                        auth:{
                            user:mailEmail,
                            pass:mailPass
                        },
                        host: mailHost,
                        port: mailPort,
                        secure: true
                    })
                    
                    const mailOptions = {
                        from:mailEmail,
                        to:email,
                        subject:'Password reset.',
                        html:`
                        <div style="background:#eee;padding:10px;border-radius:5px;">
                        <img src=".logo.png" alt="site logo" width="70px" height="70px" border-radius="35px" />
                        <h5 stye="text-align:center;">If you are the one who initiated this registration, authorize it by clicking the link below:</h5>
                        <a href='${CLIENT_URL}/${token}/${email}/create-new-password'>Change Password</a>
                        <h5>If you are not redirected to the site automatically, you may also copy and paste the link into your URL.</h5>
                        
                        </div>
                        `
                    }
                    transporter.sendMail(mailOptions, function(err, data){
                    if(err){
                        res.status(400).json({err:'Mail not sent'})
                    }else{
                        res.status(200).json({mailData:data,token:token})
                    }
                    })
                }
            })
        } catch (error) {
            return res.status(500).json({err:error})
        }
    },
    async newPassword(req,res){
        try {
            const{email,token,password} = req.body
             const user = await User.find({email:email})
             const userObj = user[0]
             if(userObj.usedPasswords.includes(password)){
                return res.status(400).json({err:'You\'ve used this password before. Try another.'})
             }else{
               if(token){
                bcrypt.hash(password,12).then(pass=>{
                    if(pass){
                        User.findOneAndUpdate({email:email},{$set:{password:pass}},{new:true})
                        .exec((err,resp)=>{
                            if(err){
                                return res.status(400).json({err:'Sorry, there was an error.'})
                            }else if(resp){
                                User.findOneAndUpdate({email:email},{$push:{usedPasswords:password}},{new:true})
                                .exec((err,resp)=>{
                                    if(err){
                                        return res.status(400).json({response:'Password wasn\'t added to recent passwords.'})
                                    }else if(resp){
                                        return res.status(200).json({response:'Password changed'})
                                    }
                                })
                            }
                        })
                    }
                })
               }else{
                return res.status(400).json({err:'Invalid token.'})
               }
             }
        } catch (error) {
            return res.status(500).json({err:error})
        }
    },

    async login(req,res){
                try{
                    const{email,password} = req.body
                    if(!email || !password){
                        return res.json({empty:'Please fill out all required fields'})
                    }else{
                                User.findOne({email:req.body.email}).then(userData=>{
                                    if(userData){
                                        bcrypt.compare(req.body.password,userData.password).then(matching=>{
                                            if(matching){
                                                const token = jwt.sign({_id:userData._id},USER_SECRET,{expiresIn:'1d'})
                                                return res.json({user:userData,token:token})
                                            }else{
                                                return res.status(401).json({msg:'Sorry, your login details are incorrect'})
                                            }
                                        })
                                    }else{
                                        return res.status(401).json({msg:'Sorry, your login details are incorrect'})
                                    }
                                })
                            }                    
                }catch(error){
                    return res.json(error)
                }
    },
    async getUsers(req,res){
        await User.find().then(getUser=>{
            if(getUser){
                return res.json(getUser)
            }
            return res.json({msg:'Sorry, no user is available'})
        }).catch(error=>{
            return res.status(500).json({err:error})
        })
    },
    async getReferrers(req,res){
        try {
            
        const users = await User.find()
        const referrers = users.filter(filt=>filt.referrer!==null)
        let referees = []
        let myReferrers =[]
        referrers.forEach(element => { 
            if(element.referrer.user===req.user.email){
            myReferrers.push(element)
         }
            users.forEach(item=>{
                const data = item.email===element.referrer.user;
                if(data){
                    referees.push(data)
                  }
            })
           
           
        });
            return res.status(200).json([referees.map(item=>item.email),referrers.map(item=>item.email),myReferrers.map(item=>item.referrer)])
        
    
        } catch (error) {
            return res.status(500).json({err:error.message})
        }
    },
    async getUser(req,res){
        
        const queryId = await User.findById(req.user)
        try {
            if(queryId){
                return res.json(queryId)
            }
            return res.json({
                        err:"Sorry, your search was not found"
                    })
        } catch (error) {
            throw (error)
        }
    },
    async myCommissions(req,res){
        console.log('hey')
        try{
            await User.findById({_id:req.user}).then(user=>{
                if(!user){
                    return res.sendStatus(400)
                }else{
                    const commission = user.commissions
                    return res.json(commission)
                    
                }
            })
         }catch(error){
            return res.json(error)
         }
    },
async editUser(req,res){
    const{country,password} = req.body
    try {
                 User.findByIdAndUpdate(req.user._id,{$set:{
                    country:country?country:req.user.country}},{new:true})
                    .exec((err,resp)=>{
                        if(err){
                            return res.status(400).json({err:'Sorry, there was error updating your account.'})
                        }else if(resp){
                            if(password){
                                bcrypt.hash(password,12).then(pass=>{
                            User.findByIdAndUpdate(req.user,{$set:{password:pass}},{new:true})
                            .exec((err,resp)=>{
                                if(err){
                                    return res.status(400).json({err:'Sorry, password wasn\'t changed.'})
                                }else if(resp){
                                    User.findByIdAndUpdate(req.user,{$push:{usedPasswords:password}},{new:true})
                                    .exec((err,resp)=>{
                                        if(err){
                                            return res.status(400).json({err:'Sorry, there was an error updating recent passwords.'})
                                        }else if(resp){
                                            return res.status(200).json({response:'Password changed'})
                                        }
                                    })
                                }
                            })
                                })
                            }else{
                                return res.status(200).json({response:'User details updated successfully.'})
                            }
                        }
                    })
    } catch (error) {
        return res.status(500).json({err:error}).message 
    }
},
//Admin
async getAdmins(req,res){
      
    await Admin.find().then(getAdmin=>{
        if(getAdmin){
            return res.json(getAdmin)
        }
        return res.json({msg:'Sorry, no admin is available'})
    }).catch(error=>{
        return res.status(500).json({err:error})
    })
},
async getAdmin(req,res){
    
    const queryId = await Admin.findById(req.user)
    try {
        if(queryId){
            return res.json(queryId)
        }
                 res.json({
                    msg:"Sorry, your search was not found"
                })
    } catch (error) {
        throw (error)
    }
},
async editAdmin(req,res){
const{middleName,gender,phone2,
    country,currentCity,website,facebook,instagram,twitter,thumbnail} =req.body
try {
    if(middleName || gender || phone2 ||  
        country || currentCity || website || facebook || 
        instagram || twitter){
            await Admin.findByIdAndUpdate(req.user._id,
                {middleName:middleName,gender:gender,phone2:phone2,thumbnail:thumbnail,country:country,
                    currentCity:currentCity,website:website,facebook:facebook,instagram:instagram,
                    twitter:twitter},{new:true},(error,data)=>{
                    if(error){
                        return res.json({msg:error})
                    }else{
                        data.save()
                        return res.json(data)
                    }
                }
                )
        }else{
            return res.json({msg:'Fill out all required fields'})
    }
} catch (error) {
    return res.status(500).json({err:error}) 
}
},
async createBankAccount(req,res){
    try {
        const{bankName, bankAccountName, bankAccountNumber} = req.body;
        if(!bankName || !bankAccountName || !bankAccountNumber){
            return res.status(500).json({
                empty:'Please fill out all required fields.'
            })
        }else{
            const bank = {bankName,bankAccountNumber,bankAccountName}
            User.findByIdAndUpdate(req.user,{$set:{bank:bank}},{new:true})
            .exec((err,resp)=>{
                if(err){
                    return res.status(500).json({err:err})
                }else{
                    return res.status(200).json({resp:'Account updated successfully.'})
                }
            })
        }
    } catch (error) {
        return res.status(500).json({err:error.message})
    }
},
async updateProfilePicture(req,res){
    try {
        const{image} = req.body
        if(image){
            User.findByIdAndUpdate(req.user._id,
                {$set:{image:image}},{new:true})
                .exec((err,resp)=>{
                    if(err){
                        return res.status(400).json({err:err.message})
                    }else{
                        return res.status(200).json({resp:'Profile Image updated'})
                    }
                }) 
        }
    } catch (error) {
        return res.status(500).json({err:error}).message
    }
},
async lastVisited(req,res){
    try {
        User.findByIdAndUpdate(req.user,{$set:{lastVisited:Date.now()}},{new:true})
        .exec((err,resp)=>{
            if(err){
                return res.status(400).json({err:'Sorry, there was an error updating last visited'})
            }else if(resp){
                return res.status(200).json({response:'Last visited updated'})
        }
    })
} catch (error) {
    return res.status(500).json({err:error}).message
}
},
async createBankAccount(req,res){
    try {
        const{bankName, bankAccountName, bankAccountNumber} = req.body;
        if(!bankName || !bankAccountName || !bankAccountNumber){
            return res.status(500).json({
                empty:'Please fill out all required fields.'
            })
        }else{
            const bank = {bankName,bankAccountNumber,bankAccountName}
            User.findByIdAndUpdate(req.user,{$set:{bank:bank}},{new:true})
            .exec((err,resp)=>{
                if(err){
                    return res.status(500).json({err:err})
                }else{
                    return res.status(200).json({resp:resp})
                }
            })
        }
    } catch (error) {
        return res.status(500).json({err:error})
    }
},
}