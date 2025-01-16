const Groove = require('../models/groove');
const Payment = require('../models/payment');
const User = require('../models/user');
const AppSetting = require('../models/appSetting');

module.exports={
     async createGroove(req,res){
      try {
        const{target,name,} = req.body;
        const queryGroove = await Groove.findOne({name:name})
        const app = await AppSetting.find()
        const grooveMin = app[0].grooveMin
        const queryUser = await User.findById(req.user)
        
        if(queryGroove){
          return res.status(500).json({err:`${name} is taken, try another name.`})
        }else{
          if(queryUser.health<100){
            return res.status(401).json({err:`Your  account is not healthy enough to manage a groove. ${name} wasn't created, try again.`})
          }else{
          if(target<grooveMin){
            //less than groove min target
            return res.status(401).json({err:`Minimum target is ${grooveMin}.`})
          }else if(target>=grooveMin){
            return res.status(200).json({resp:'Groove is being created...'})
          }else{
            return res.status(422).json({err:'Please enter a valid amount.'})
          }
          }

        }
      } catch (error) {
        return res.status(500).json({err:error.message})
      }
     },
     async confirmCreateGroove(req,res){
       try {
         const{paymentStatus,teller,payee,cashier,target,duration,period,description,name,image,requiredMembers} = req.body;
         const myGrooves = await Groove.find({'members.member':req.user.email})
             const app = await AppSetting.find()
             const grooveMinTarget = target-(app[0].grooveRate*target);
             const queryPayee = await User.findOne({email:payee})
        const queryTeller = await Payment.findOne({teller:teller})
             const gTime = new Date()
             const aTime = new Date()
             const grooveTime = app[0].grooveTime
             const appSchedule = aTime.setHours(aTime.getHours()+grooveTime)
             const grooveSchedule = gTime.setHours(gTime.getHours()+parseInt(duration))

         if(paymentStatus==='success'){
          if(queryTeller){
      return res.status(401).json({err: `The teller ${teller} has been confirmed already`})
          }else if(!queryTeller){
            Payment.create({
              teller,
              amount:target,
              nextWithdrawal:grooveSchedule>=appSchedule?grooveSchedule:appSchedule,
              type:'groove',
    payer:cashier,
    payee,
    date:new Date()
          }).then(payment=>{
            if(payment){
              Groove.create({
                name,description,target,duration:duration>=grooveTime?duration:grooveTime,
                period:parseInt(period),image:image===''?'image':image,active:false,
                requiredMembers,haveWithdrawn:[],orbit:1,payments:[{member:queryPayee.email,amount:target,paid:true,nextPayment:null,date:new Date()}],
                members:[{member:queryPayee.email,isAdmin:true,paymentId:payment._id,nextPayment:null,withdrawable:target*((app[0].grooveFirstPaySpeed+app[0].groovePayAllSpeed)+
                  (target)/grooveMinTarget),canWithdraw:true,progress:target/grooveMinTarget,status:'active'}]
              }).then(groove=>{
                if(groove){
                 if(myGrooves.length>0){
                   return res.status(200).json({resp:`You have successfully joined ${name}.`})
                 }else if(myGrooves.length===0){
                  if(queryPayee.beneficiary===null){
                   User.findByIdAndUpdate(payee,{$set:{beneficiary:{user:queryPayee.referrer.user,date:new Date()}}},{new:true})
                   .exec((err,resp)=>{
                     if(err){
                       return res.status(500).json({err:err.message})
                     }else if(resp){
                       return res.status(200).json({resp:`You have successfully joined ${name}.`})
                     }
                   })
                  }else{
                   return res.status(200).json({resp:`${name} was successfully created.`})
                  }
                 }
                  
                }else{
                  return res.status(500).json({err:`An error occurred and ${name} wasn't created, try again.`})
                }
              }).catch(err=>{
                return res.status(500).json({err:err.message})
              })
            }else{
              return res.status(500).json({err:`Payment wasn't made.`})
            }
          })
        
          }
         }else{
           return res.status(422).json({err:`Sorry, payment was not successful. Contact ${app[0].help}`})
         }
       } catch (error) {
         return res.status(500).json({err:error.message})
       }
     }
     ,async joinGroove(req,res){
      try {
        const{grooveId} = req.params;
        const{amount} = req.body;
        const queryGroove = await Groove.findById(grooveId)
        const app = await AppSetting.find()
        const time = new Date();
        const grooveMinTarget = queryGroove.target-(app[0].grooveRate*queryGroove.target);
        const grooveMinPeriodicTarget = grooveMinTarget/queryGroove.requiredMembers;

        if(queryGroove.members.length<queryGroove.requiredMembers){
          if(queryGroove.members.filter(filt=>filt.member===req.user.email).length>0){
            return res.status(422).json({err:"You are already member of the groove. Try another groove."})
          }else{
            
            if(amount>=grooveMinPeriodicTarget){
              return res.status(200).json({resp:{grooveId,amount}})
            }else{
            return res.status(401).json({err:`Pay either ${grooveMinTarget} or ${grooveMinPeriodicTarget}.`})
            
            }
           }
          
        }else{
          return res.status(422).json({err:`${queryGroove.name} has reached its max. Try another groove.`})
        }
      } catch (error) {
        return res.status(422).json({err:error.message})
      }
     },async confirmJoinGroove(req,res){
      try {
        const{paymentStatus,teller,grooveId,cashier,payee,type,amount} = req.body;
        const queryPayee = await User.findOne({email:payee})
        const myGrooves = await Groove.find({'members.member':queryPayee.email})
        const app = await AppSetting.find()
        const queryGroove = await Groove.findById(grooveId)
        const grooveMinTarget = queryGroove.target-(app[0].grooveRate*queryGroove.target);
        const gTime = new Date()
        const groovePeriod = gTime.setHours(gTime.getHours()+parseInt(queryGroove.period))
        const queryTeller = await Payment.findOne({teller:teller})
        const gdTime = new Date()
        const grooveDuration = gdTime.setHours(gdTime.getHours()+parseInt(queryGroove.duration));

        if(paymentStatus==='success'){
          if(queryTeller){
            return res.status(401).json({err: `The teller ${teller} has been confirmed already`})
          }else if(!queryTeller){
          Payment.create({
            teller,
            amount:amount,
            nextWithdrawal:grooveDuration,
            type:type,
            payer:cashier,
            payee,
            date:new Date(),
        }).then(payment=>{
          if(payment){
            Groove.findByIdAndUpdate(grooveId,{$push:{members:{member:queryPayee.email,isAdmin:false,
              nextPayment:groovePeriod,withdrawable:0,canWithdraw:false,progress:amount/grooveMinTarget,status:'active'},
              payments:{member:queryPayee.email,paymentId:payment._id,paid:false,amount:amount,nextPayment:groovePeriod,date:new Date()}}},{new:true}).exec((err,resp)=>{
              if(err){
                return res.status(422).json({err:err.message})
              }else if(resp){
                if(myGrooves.length>0){
                  return res.status(200).json({resp:`You have successfully joined ${queryGroove.name}.`})
                }else if(myGrooves.length===0){
                  
                  if(!queryPayee.beneficiary){
                    User.findByIdAndUpdate(queryPayee,{$set:{beneficiary:{user:queryPayee.referrer.user,date:new Date()}}},{new:true})
                    .exec((err,resp)=>{
                      if(err){
                        return res.status(500).json({err:err.message})
                      }else if(resp){
                        return res.status(200).json({resp:`You have successfully joined ${queryGroove.name}.`})
                      }
                    })
                   }else{
                    return res.status(200).json({resp:`You have successfully joined ${queryGroove.name}.`})
                   }
                }
                
              }
              return res.status(500).json({err:'Something went wrong. Try again.'})
  
            })
          }}).catch(err=>res.status(500).json({err:err.message}))
          }
        }else{
          return res.status(401).json({err:'Payment not successful and groove was joined.'})
        }
      } catch (error) {
        return res.status(500).json({err:error.message})
      }
     },
     async investors(req,res){
      try {
        const users = await User.find()
        const grooves = await Groove.find()
        let groovememberMails = []
        let grooved = []
        grooves.forEach(ele=>{
          return grooved.push(ele.members)
        })
        grooved.forEach(e=>{
          return groovememberMails.push(e.member)
        })
        let grooveOnly = []
        let personalOnly = []
        let both = []
        let none = []

        users.forEach(element => {
           element.orbits.forEach(el=>{
            if(el.level>0 && groovememberMails.includes(el.email)){
              both.push(el)
            }else if(el.level>0 && !groovememberMails.includes(el.email)){
              personalOnly.push(el)
            }else if(el.level<0 && groovememberMails.includes(el.email)){
              grooveOnly.push(el)
            }else if(el.level>0 && !groovememberMails.includes(el.email)){
              none.push(el)
            }
            
            return res.status(200).json({resp:{personalInvestorsOnly:personalOnly,
            bothInvestors:both,
            grooveInvestorsOnly:grooveOnly,
            notInvestor:none
            }})
           })
        });
      } catch (error) {
        return res.status(500).json({err:error.message})
      }
     },
     async grooves(req,res){
      try {
        const investors = await Groove.find()
        if(investors.length<1){
          return res.status(404).json({err:"There's no groove no investor yet."})
        }else{
          return res.json({resp:investors})
        }
      } catch (error) {
        return res.json({err:error.message})
      }
     },
     async myGrooves(req,res){
      try {
        const investors = await Groove.find({'members.member':req.user.email})
        if(investors.length<1){
          return res.status(404).json({err:"You are not in any groove."})
        }else{
          return res.json({resp:investors})
        }
      } catch (error) {
        return res.json({err:error.message})
      }
     },
     async deleteGroove(req,res){
      try {
        const admin = await User.findById(req.user)
        if(admin.isAdmin){
          Groove.findByIdAndDelete(req.params.grooveId).then(resp=>{
            return res.status(200).json({resp:`The groove has been deleted successfully.`})
          })
        }else {
          return res.status(401).json({err:'This is admin role.'})
        }
      } catch (error) {
        return res.status(500).json({err:error.message})
      }
     }
, async penaliseUser(req,res){
  try {
    const{penalty} = req.body
    const{userId} = req.params;
    const admin = await User.findById(req.user)
    const queryUser = await User.findById(userId)
    if(admin.isAdmin){
    if(queryUser.health<penalty){
      return res.status(400).json({err:`Health can\'t be less than 0. Penalty must be maximum ${queryUser.health}.`})
    }else{
      User.findByIdAndUpdate(userId,{health:parseInt(queryUser.health)-parseInt(penalty)},{new:true}).exec((err,resp)=>{
        if(err){
          return res.status(500).json({err:err.message})
        }else if(resp){
          return res.status(200).json({resp:`The user has been penalised successfully.`})
        }
        return
      })
    }
    }else {
      return res.status(401).json({err:'This is admin role.'})
    }
  } catch (error) {
    return res.status(500).json({err:error.message})
  }
 },
  async pardonUser(req,res){
  try {
    const{pardon} = req.body
    const{userId} = req.params;
    const admin = await User.findById(req.user)
    const queryUser = await User.findById(userId)
    if(admin.isAdmin){
    if(queryUser.health+pardon>100){
      return res.status(400).json({err:`Health can\'t be greater than 100. Pardon must be maximum ${100-queryUser.health}.`})
    }else{
      User.findByIdAndUpdate(userId,{health:parseInt(queryUser.health)+parseInt(pardon)},{new:true}).exec((err,resp)=>{
        if(err){
          return res.status(500).json({err:err.message})
        }else if(resp){
          return res.status(200).json({resp:`The user has been pardoned successfully.`})
        }
        return
      })
    }
    }else {
      return res.status(401).json({err:'This is admin role.'})
    }
  
  } catch (error) {
    return res.status(500).json({err:error.message})
  }
 },async upgradegrooveOrbit(req,res){
  try {
    const{target,duration,period,description,requiredMembers,grooveId} = req.body;
    const queryGroove = await Groove.findOne({_id:grooveId})
    const grooveMembers = queryGroove.members
    let memberMails = []
grooveMembers.forEach(el=>{
  return memberMails.push(el.member)
})
    const app = await AppSetting.find()
    const grooveMin = app[0].grooveMin
    const queryUser = await User.findById(req.user)
    const time = new Date();
    const date = new Date();
    const groovePeriod = date.setHours(date.getHours()+period)
const queryAdmin = queryGroove.members.filter(filt=>filt.member===req.user.email&&filt.isAdmin)
const oldAdmin = queryGroove.members.filter(filt=>filt.isAdmin)
const queryOldAdmin = await User.findOne({email:oldAdmin[0].member})
if(queryOldAdmin.health<100){
//Unhealthy admin
if(memberMails.includes(req.user.email)){
  if(queryUser.health<100){
    return res.status(401).json({err:`Your account is not healthy enough to manage a groove. ${queryGroove.name} again. Contact the new admin.`})
  }else{
  if(target<grooveMin){
    //less than groove min target
    return res.status(401).json({err:`Minimum target is ${grooveMin}.`})
  }else if(target>=grooveMin){
    return res.status(200).json({resp:{target,duration,period,description,requiredMembers,grooveId}})
  }else{
    return res.status(422).json({err:'Please enter a valid amount.'})
  }
  }
}else{
  return res.status(401).json({err:`You are not a member of ${queryGroove.name}. So you can not be the next admin.`})
}

}else{
  if(queryAdmin.length<1){
    //Not admin and old admin is healthy
    return res.status(401).json({err:'Only groove admin can change the groove\'s orbit.'})
  }else{
    //it is old admin and is healthy
    if(target<grooveMin){
      //less than groove min target
  
      return res.status(401).json({err:`Minimum target is ${grooveMin}.`})
    }else if(target>=grooveMin){
      return res.status(200).json({resp:{target,duration,period,description,requiredMembers,grooveId}})
    }else{
      return res.status(422).json({err:'Please enter a valid amount.'})
    }
  }
}
  } catch (error) {
    return res.json({err:error.message})
  }
 },
 async confirmGrooveUpgrade(req,res){
  try{
    const{target,teller,duration,period,cashier,payee,description,paymentStatus,type,requiredMembers,grooveId} = req.body;
    const groove = await Groove.findById(grooveId)
    const app = await AppSetting.find()
    const grooveMinTarget = groove.target-(app[0].grooveRate*groove.target);
    const queryPayee = await User.findOne({email:payee})
    const grooveMinPeriodicTarget = grooveMinTarget/groove.requiredMembers;
    const date = new Date();
    const time = new Date();
    const grooveAppSchedule = time.setHours(time.getHours()+app[0].grooveTime)
    const grooveSchedule = date.setHours(date.getHours()+parseInt(duration))
    const queryTeller = await Payment.findOne({teller:teller})

      if(paymentStatus==='success'){
        if(queryTeller){
          return res.status(401).json({err: `The teller ${teller} has been confirmed already`})
        }else if(!queryTeller){
        Payment.create({teller,type,payer:cashier,payee,nextWithdrawal:grooveSchedule>=grooveAppSchedule?grooveSchedule:grooveAppSchedule})
        .then(resp=>{
          if(!resp){
            return res.status(500).json({err:'Payment was not successfuly confirmed'})
          }else if (resp){
            Groove.findOneAndUpdate({_id:grooveId},{
              $set:{
                description:description,target:target,duration:duration,
              period:period,active:true,orbit:parseInt(groove.orbit)+parseInt(1),
              requiredMembers:requiredMembers,haveWithdrawn:[],orbit:groove.orbit+1,
              members:[{member:queryPayee.email,isAdmin:true,nextPayment:null,
                withdrawable:groove.target*((app[0].grooveFirstPaySpeed+app[0].groovePayAllSpeed)+
                (target)/grooveMinTarget),readyToWithdraw:[queryPayee.email],
                canWithdraw:true,progress:(target/grooveMinTarget),status:'active'}],
                payments:[{member:queryPayee.email,amount:target,nextPayment:null,paymentId:resp._id,date:new Date()}],
              }
            }).exec((err,resp)=>{
              if(resp){
                return res.status(200).json({resp:`${groove.name} upgraded to ${groove.orbit+1}`})
              }else if(err){
                return res.status(500).json({err:err.message})
              }
            })
              }else if(err){
                return res.status(500).json({err:err.message})  
              }})
    }
      
        }
      }catch (err){
    return res.status(500).json({err:err.message})
  }
 }
 ,async updateGrooveProfilePicture(req,res){
  try {
      const{image,grooveId} = req.body;
      const queryGroove = await Groove.findOne({_id:grooveId})
  const queryAdmin = queryGroove.members.filter(filt=>filt.member===req.user.email&&filt.isAdmin);

     if(queryAdmin.length<1){
      return res.status(401).json({err:'Sorry, only an admin can update a groove\'s profile picture.'})
     }else if(queryAdmin.length>0){
      if(image){
        Groove.findByIdAndUpdate(grooveId,
            {$set:{image:image}},{new:true})
            .exec((err,resp)=>{
                if(err){
                    return res.status(400).json({err:err.message})
                }else{
                    return res.status(200).json({resp:'Profile Image updated'})
                }
            }) 
    }
     }
  } catch (error) {
    return res.status(500).json({err:error.message})
  }
},
}