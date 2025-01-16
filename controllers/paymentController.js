const Payment = require('../models/payment');
const Withdrawal = require('../models/withdrawal');
const User = require('../models/user');
const Groove = require('../models/groove');
const AppSetting = require('../models/appSetting');

module.exports = {
  async makePayment(req,res){
    try {
        const {amount,nextWithdrawal,grooveId,type}=req.body; 
        const queryPayee = await User.findOne({email:req.user.email})
        const app = await AppSetting.find()
        const personalMin = app[0].personalMin
        const time = new Date();
        const increment = app[0].increment
        const appMaxLevel = app[0].appMaxLevel
        
        //Payee was not credited. Please verify that you paid at least
        if(type=='personal'){
          const orbits = queryPayee.orbits;
          const lastOrbit = orbits[orbits.length-1]
          const firstOrbitOldInvestor = orbits[0].worth/2
          if(orbits[orbits.length-1].orbit===1){
            //First orbit
            if(orbits[orbits.length-1].level>0&&orbits[orbits.length-1].level<appMaxLevel){
              //Orbit 1 but level greater than 1
              if(orbits[orbits.length-1].level===1){
                if(amount>=firstOrbitOldInvestor){
                  return res.status(200).json({resp:{amount,nextWithdrawal,grooveId,type}})
                }else{
                  return res.status(401).json({err:`Minimum you can invest is ${firstOrbitOldInvestor}.`})
                }
              }else if(orbits[orbits.length-1].level>1){
            //Greater than second time investor but orbit one
            if(amount>=lastOrbit.worth){
              return res.status(200).json({resp:{amount,nextWithdrawal,grooveId,type}})       
            }else{
              return res.status(401).json({err:`Minimum you can invest is ${lastOrbit.worth}.`})
            }
              }
            }else if(orbits[orbits.length-1].level===0){
              //Orbit 1 but level 0
              if(amount>=personalMin){
                return res.status(200).json({resp:{amount,nextWithdrawal,grooveId,type}})
              }else if(amount<personalMin){
                //New investor paying less amount
                return res.status(401).json({err:`Minimum you can invest is ${personalMin}.`})
              }else{
                //New investor paying invalid amount
                return res.status(404).json({err:'An valid amount is entered.'})
              }
            }else if(orbits[orbits.length-1].level===appMaxLevel){
              //Higher orbit but level is equal to the app max
              if((orbits[orbits.length-1].worth+(orbits[orbits.length-1].worth*increment))>amount){
                //Transition to the next orbit needs higher amount
                return res.status(401).json({err:`Please pay ${lastOrbit.worth+(lastOrbit.worth*increment)} to move to orbit ${parseInt(orbits[orbits.length-1].orbit)+parseInt(1)}`})        
              }else if((orbits[orbits.length-1].worth+(orbits[orbits.length-1].worth*increment))<=amount){
                return res.status(200).json({resp:{amount,nextWithdrawal,grooveId,type}})
              }
            }else if(orbits[orbits.length-1].level>=appMaxLevel){
              //Higher orbit but level is equal to the app max
              if((orbits[orbits.length-1].worth+(orbits[orbits.length-1].worth*increment))>amount){
                //Transition to the next orbit needs higher amount
                return res.status(401).json({err:`Please pay ${lastOrbit.worth+(lastOrbit.worth*increment)} to move to orbit ${parseInt(orbits[orbits.length-1].orbit)+parseInt(1)}`})        
              }else if((orbits[orbits.length-1].worth+(orbits[orbits.length-1].worth*increment))<=amount){
                return res.status(200).json({resp:{amount,nextWithdrawal,grooveId,type}})
              }else{
                return res.status(401).json({err:`Pay minimum of ${(orbits[orbits.length-1].worth+(orbits[orbits.length-1].worth*increment))} to move to orbit ${orbits[orbits.length-1].worth+1}`})
              }
            }
          }else if(orbits[orbits.length-1].orbit>1){
            //Higher than first orbit
            if(orbits[orbits.length-1].level<appMaxLevel){
              //Higher orbit and level is less than the app max
              const oldInvestment = orbits[orbits.length-1].worth
              //+(orbits[orbits.length-1].worth*increment)
              if(amount>=oldInvestment){
                return res.status(200).json({resp:{amount,nextWithdrawal,grooveId,type}})
               }else{
                return res.status(401).json({err:`Minimum to invest is ${oldInvestment}.`})
              }
            }else if(orbits[orbits.length-1].level===appMaxLevel){
              //Higher orbit but level is equal to the app max
              if((orbits[orbits.length-1].worth+(orbits[orbits.length-1].worth*increment))>amount){
                //Transition to the next orbit needs higher amount
                return res.status(401).json({err:`Please pay ${lastOrbit.worth+(lastOrbit.worth*increment)} to move to orbit ${parseInt(orbits[orbits.length-1].orbit)+parseInt(1)}`})        
              }else if((orbits[orbits.length-1].worth+(orbits[orbits.length-1].worth*increment))<=amount){
                return res.status(200).json({resp:{amount,nextWithdrawal,grooveId,type}})
              }
            }
          }
        }else if(type==='groove'){
          
      const dTime = new Date()
      const rTime = new Date()
      const groove = await Groove.findById(grooveId);
      const grooveSchedule = groove.duration
      const grooveAppSchedule = app[0].grooveTime
      const rSchedule = rTime.setHours(rTime.getHours()+parseInt(groove?.period))
      const queryPayee = await User.findById(req.user)
      const groovePayments = groove.payments
      const confirmedGroovePayments = groovePayments.filter(filt=>filt.paid===true)
      const grooveMinTarget = groove.target-(app[0].grooveRate*groove.target)
      const grooveMinPeriodicTarget = grooveMinTarget/groove.requiredMembers;
      let myPaymentsArr = [];
       groovePayments.forEach(el=>{
        if(el.member==queryPayee.email&&el.paid===true){
          return myPaymentsArr.push(el.amount)
        }
       });

       function reducer(a,c){
        return c+a;
       }
   const myPayments = myPaymentsArr.reduce(reducer,0)
      if(confirmedGroovePayments.length<1){
        //First payment confirmation
        if(amount>=grooveMinTarget){
          return res.status(200).json({resp:'Payment made and groove is active.'})
        }else{
          return res.status(401).json({err:`First payment must be at least ${grooveMinTarget}`})
         }
      }else{
        //Later payment confirmations
        if(amount>=grooveMinTarget){
          return res.status(200).json({resp:'Payment made and groove is active.'})
        }else if((amount+myPayments)>=grooveMinTarget){
          return res.status(200).json({resp:'Payment made and groove is active.'})
        }else if(amount+myPayments<grooveMinTarget){
          if(amount+myPayments>=grooveMinTarget/groove.requiredMembers){
            return res.status(200).json({resp:'Payment made and groove is active.'})
          }else if(amount+myPayments<grooveMinTarget/groove.requiredMembers){
            return res.status(401).json({err:`The minimum for the groove is ${grooveMinPeriodicTarget}`})
          }
         }
      }
        }else if('groove-top-up'){      
      const dTime = new Date()
      const rTime = new Date()
      const groove = await Groove.findById(grooveId);
      const grooveSchedule = groove.duration
      const grooveAppSchedule = app[0].grooveTime
      const rSchedule = rTime.setHours(rTime.getHours()+parseInt(groove?.period))
      const queryPayee = await User.findById(req.user)
      const groovePayments = groove.payments
      
      const grooveMinTarget = groove.target-(app[0].grooveRate*groove.target)
      const grooveMinPeriodicTarget = grooveMinTarget/groove.requiredMembers;
      let myPaymentsArr = [];
       groovePayments.forEach(el=>{
        if(el.member==queryPayee.email&&el.paid===true){
          return myPaymentsArr.push(el.amount)
        }
       });

       function reducer(a,c){
        return c+a;
       }
   const myPayments = myPaymentsArr.reduce(reducer,0)
   if(parseInt(amount)+myPayments>=grooveMinPeriodicTarget||parseInt(amount)+myPayments>=grooveMinTarget){
    return res.status(200).json({resp:'Payment made and groove is active.'})
  }else if(parseInt(amount)+myPayments<grooveMinPeriodicTarget){
    return res.status(401).json({err:`The minimum for the groove to up is ${grooveMinPeriodicTarget}`})
  }
}  
    } catch (error) {
        return res.status(500).json({err:error.message})
    }
},
async confirmPersonalTopUp(req,res){
  try {
    const {paymentStatus,cashier,payee,amount,nextWithdrawal,type,teller} = req.body;
        const app = await AppSetting.find()
        const queryTeller = await Payment.findOne({teller:teller})
        const queryPayee = await User.findOne({email:payee});
    if(paymentStatus==='success'){
    if(queryTeller){
      return res.status(401).json({err: `The teller ${teller} has been confirmed already`})
    }else if(!queryTeller){
      if(type=='personal'){
        const personalMin = app[0].personalMin
        const increment = app[0].increment
        const appMaxLevel = app[0].appMaxLevel
        const appTime = app[0].minTime;
        const orbits = queryPayee.orbits;
        const time = new Date();
        const date = new Date();
        const userSchedule = time.setHours(time.getHours()+parseInt(nextWithdrawal))
        const appSchedule = date.setHours(date.getHours()+appTime)
        const lastOrbit = orbits[orbits.length-1]
        const firstOrbitOldInvestor = orbits[0].worth/2
        if(orbits[orbits.length-1].orbit===1){
          //First orbit
          if(orbits[orbits.length-1].level>0&&orbits[orbits.length-1].level<appMaxLevel){
            //Orbit 1 but level greater than 1
            if(orbits[orbits.length-1].level===1){
              if(amount>=firstOrbitOldInvestor){
                Payment.create({teller,
                  amount:amount,
                  nextWithdrawal:userSchedule>=appSchedule?userSchedule:appSchedule,
                  type:type,
                  payer:cashier,
                  payee,
                  date:time
              }).then(payment=>{
                if(payment){
                  User.findOneAndUpdate({email:queryPayee.email,'orbits.orbit':orbits[orbits.length-1].orbit},
                  {$set:{'orbits.$.level':parseInt(orbits[orbits.length-1].level)+parseInt(1),
              'orbits.$.worth':parseInt(payment.amount),'orbits.$.nextWithdrawal':payment.nextWithdrawal,'orbits.$.paymentId':payment._id,'orbits.$.save':parseInt(payment.amount)}},{new:true})
                  .exec((err,resp)=>{
                    if(err){
                        return res.status(422).json({err:err.message})        
                    }else if(resp){
                        User.findOneAndUpdate({email:queryPayee.email},{$set:{paid:parseInt(queryPayee.paid)+parseInt(amount)}},{new:true})
                        .exec((err,resp)=>{
                          if(err){
                            return res.status(500).json({err:err.message})
                          }else if(resp){
                            return res.status(200).json({resp:resp})        
                          }else{
                            return res.status(500).json({err:'Something went wrong.'})        
                          }
                        })
                    }else{
                        return res.status(422).json({err:'Sorry, payment was not recorded in the payee\'s record. Please Contact support.'})        
                    }
                })
                }else{
                  return res.status(500).json({err:'Something went wrong.'})
                }
              })
                
              }else{
                return res.status(401).json({err:`Minimum you can invest is ${firstOrbitOldInvestor}.`})
              }
            }else if(orbits[orbits.length-1].level>1){
          //Greater than second time investor but orbit one
          if(amount>=lastOrbit.worth){
            Payment.create({teller,
                  amount:amount,
                  nextWithdrawal:userSchedule>=appSchedule?userSchedule:appSchedule,
                  type:type,
                  payer:cashier,
                  payee,
                  date:time
          }).then(payment=>{
            if(payment){
              User.findOneAndUpdate({email:queryPayee.email,'orbits.orbit':orbits[orbits.length-1].orbit},{$set:{'orbits.$.level':parseInt(orbits[orbits.length-1].level)+parseInt(1),
              'orbits.$.worth':parseInt(payment.amount),'orbits.$.nextWithdrawal':payment.nextWithdrawal,'orbits.$.paymentId':payment._id,'orbits.$.save':parseInt(payment.amount)}},{new:true})
              .exec((err,resp)=>{
                if(err){
                    return res.status(422).json({err:err.message})        
                }else if(resp){
                    User.findOneAndUpdate({email:queryPayee.email},{$set:{paid:parseInt(queryPayee.paid)+parseInt(amount)}},{new:true})
                    .exec((err,resp)=>{
                      if(err){
                        return res.status(500).json({err:err.message})
                      }else if(resp){
                        return res.status(200).json({resp:resp})        
                      }else{
                        return res.status(500).json({err:'Something went wrong.'})        
                      }
                    })
                }else{
                    return res.status(422).json({err:'Sorry, payment was not recorded in the payee\'s record. Please Contact support.'})        
                }
            })
            }else{
              return res.status(500).json({err:'Something went wrong.'})
            }
          })
            
          }else{
            return res.status(401).json({err:`Minimum you can invest is ${lastOrbit.worth}.`})
          }
            }
          }else if(orbits[orbits.length-1].level===0){
            //Orbit 1 but level 0
            if(amount>=personalMin){
              //New investor paying the required amount
              Payment.create({teller,
                  amount:amount,
                  nextWithdrawal:userSchedule>=appSchedule?userSchedule:appSchedule,
                  type:type,
                  payer:cashier,
                  payee,
                  date:time
            })
             .then(payment=>{
              if(payment){
                User.findOneAndUpdate({email:queryPayee.email,'orbits.orbit':1},
                  {$set:{'orbits.$.level':1,'orbits.$.worth':parseInt(payment.amount),'orbits.$.save':parseInt(payment.amount),'orbits.$.date':payment.date,'orbits.$.nextWithdrawal':payment.nextWithdrawal,
                  'orbits.$.paymentId':payment._id}},{new:true}).exec((err,resp)=>{
                  if(err){
                      return res.status(422).json({err:err.message})        
                  }else if(resp){
                    if(queryPayee.beneficiary===null){
                      User.findByIdAndUpdate(queryPayee,{$set:{beneficiary:{user:queryPayee.referrer.user,date:new Date()}}},{new:true})
                      .exec((err,resp)=>{
                        if(err){
                          return res.status(500).json({err:err.message})
                        }else if(resp){
                          return res.status(200).json({resp:`Payment successful.`})
                        }
                      })
                     }else{
                      return res.status(200).json({resp:`Payment successful.`})
                     }
                   
                  }else{
                      return res.status(422).json({err:'Sorry, payment was not recorded in the payee\'s record. Please Contact support.'})        
                  }
              })
              }else{
                return res.status(500).json({err:'Sorry, something went wrong. Please Contact support.'})        
              }
             })
            
          
            }else if(amount<personalMin){
              //New investor paying less amount
              return res.status(401).json({err:`Minimum you can invest is ${personalMin}.`})
            }else{
              //New investor paying invalid amount
              return res.status(404).json({err:'An valid amount is entered.'})
            }
          }else if(orbits[orbits.length-1].level>=appMaxLevel){
            //Higher orbit but level is equal to the app max
            if((orbits[orbits.length-1].worth+(orbits[orbits.length-1].worth*increment))>amount){
              //Transition to the next orbit needs higher amount
              return res.status(401).json({err:`Please pay ${lastOrbit.worth+(lastOrbit.worth*increment)} to move to orbit ${parseInt(orbits[orbits.length-1].orbit)+parseInt(1)}`})        
            }else if((orbits[orbits.length-1].worth+(orbits[orbits.length-1].worth*increment))<=amount){
              //Transitioning to a higer orbit paying with app increment
              
              Payment.create({teller,
                  amount:amount,
                  nextWithdrawal:userSchedule>=appSchedule?userSchedule:appSchedule,
                  type:type,
                  payer:cashier,
                  payee,
                  date:time
            })
             .then(payment=>{
              if(payment){
                User.findOneAndUpdate({email:queryPayee.email},
                  {$push:{orbits:{orbit:parseInt(orbits[orbits.length-1].orbit)+parseInt(1),nextWithdrawal:payment.nextWithdrawal,paymentId:payment._id,
                    date:new Date(),level:1,save:amount,worth:amount}}},{new:true}).exec((err,resp)=>{
                  if(err){
                      return res.status(422).json({err:err.message})        
                  }else if(resp){
                      
                    User.findOneAndUpdate({email:queryPayee.email},{$set:{paid:parseInt(queryPayee.paid)+parseInt(amount)}},{new:true})
                    .exec((err,resp)=>{
                      if(err){
                        return res.status(500).json({err:err.message})
                      }else if(resp){
                        return res.status(200).json({resp:`You have successfully upgraded to orbit ${parseInt(orbits[orbits.length-1].orbit)+parseInt(1)}`})        
                      }else{
                        return res.status(500).json({err:'Something went wrong.'})        
                      }
                    })
                       
                  }else{
                      return res.status(422).json({err:'Sorry, payment was not recorded in the payee\'s record. Please Contact support.'})        
                  }
              })
              }else{
                return res.status(500).json({err:'Sorry, something went wrong. Please Contact support.'})        
              }
             })
        
            }
          }
        }else if(orbits[orbits.length-1].orbit>1){
          //Higher than first orbit
          if(orbits[orbits.length-1].level<appMaxLevel){
            //Higher orbit and level is less than the app max
            const oldInvestment = orbits[orbits.length-1].worth
            //+(orbits[orbits.length-1].worth*increment)
            if(amount>=oldInvestment){
              Payment.create({teller,
                amount,
                nextWithdrawal:userSchedule>=appSchedule?userSchedule:appSchedule,
                type,
                payer:cashier,
                  payee,
                  date:time
            })
             .then(payment=>{
              if(payment){
                User.findOneAndUpdate({email:queryPayee.email,
                  'orbits.level':orbits[orbits.length-1].level},
                  {$set:{'orbits.$.level':parseInt(orbits[orbits.length-1].level)+parseInt(1),'orbits.$.worth':parseInt(payment.amount),'orbits.$.paymentId':payment._id,
                  'orbits.$.date':payment.date,'orbits.$.save':parseInt(payment.amount),'orbits.$.nextWithdrawal':payment.nextWithdrawal}},{new:true}).exec((err,resp)=>{
                  if(err){
                      return res.status(422).json({err:err.message})        
                  }else if(resp){
                      
                    User.findOneAndUpdate({email:queryPayee.email},{$set:{paid:parseInt(queryPayee.paid)+parseInt(amount)}},{new:true})
                    .exec((err,resp)=>{
                      if(err){
                        return res.status(500).json({err:err.message})
                      }else if(resp){
                        return res.status(200).json({resp:resp})        
                      }else{
                        return res.status(500).json({err:'Something went wrong.'})        
                      }
                    })
                       
                  }else{
                      return res.status(422).json({err:'Sorry, payment was not recorded in the payee\'s record. Please Contact support.'})        
                  }
              })
              }else{
                return res.status(500).json({err:'Sorry, something went wrong. Please Contact support.'})        
              }
             })
            }else{
              return res.status(401).json({err:`Minimum to invest is ${oldInvestment}.`})
            }
          }else if(orbits[orbits.length-1].level>=appMaxLevel){
            //Higher orbit but level is equal to the app max
            if((orbits[orbits.length-1].worth+(orbits[orbits.length-1].worth*increment))>amount){
              //Transition to the next orbit needs higher amount
              return res.status(401).json({err:`Please pay ${lastOrbit.worth+(lastOrbit.worth*increment)} to move to orbit ${parseInt(orbits[orbits.length-1].orbit)+parseInt(1)}`})        
            }else if((orbits[orbits.length-1].worth+(orbits[orbits.length-1].worth*increment))<=amount){
              //Transitioning to a higer orbit paying with app increment
              
              Payment.create({teller,
                  amount:amount,
                  nextWithdrawal:userSchedule>=appSchedule?userSchedule:appSchedule,
                  type:type,
                  payer:cashier,
                  payee,
                  date:time
            })
             .then(payment=>{
              if(payment){
                User.findOneAndUpdate({email:queryPayee.email},
                  {$push:{orbits:{orbit:parseInt(orbits[orbits.length-1].orbit)+parseInt(1),nextWithdrawal:payment.nextWithdrawal,
                    save:amount,paymentId:payment._id,date:new Date(),level:1,worth:amount}}},{new:true}).exec((err,resp)=>{
                  if(err){
                      return res.status(422).json({err:err.message})        
                  }else if(resp){
                      
                    User.findOneAndUpdate({email:queryPayee.email},{$set:{paid:parseInt(queryPayee.paid)+parseInt(amount)}},{new:true})
                    .exec((err,resp)=>{
                      if(err){
                        return res.status(500).json({err:err.message})
                      }else if(resp){
                        return res.status(200).json({resp:`You have successfully upgraded to orbit ${parseInt(orbits[orbits.length-1].orbit)+parseInt(1)}`})        
                      }else{
                        return res.status(500).json({err:'Something went wrong.'})        
                      }
                    })
                       
                  }else{
                      return res.status(422).json({err:'Sorry, payment was not recorded in the payee\'s record. Please Contact support.'})        
                  }
              })
              }else{
                return res.status(500).json({err:'Sorry, something went wrong. Please Contact support.'})        
              }
             })
        
            }
          }
        }
      
      }
     
      else{
        return res.status(422).json({err:`Sorry, payment was not specified. Contact ${app[0].help}`})
      }
    }
    }else{
      return res.status(422).json({err:`Sorry, payment was not successful. Contact ${app[0].help}`})
    }
  } catch (error) {
    return res.status(500).json({err:error.message})
  }
},
async confirmGrooveTopUp(req,res){
  try {
    const{grooveId,cashier,payee,teller,paymentStatus,type,amount} = req.body;
    const queryTeller = await Payment.findOne({teller:teller})
    const queryPayee = await User.findOne({email:payee})
        const app = await AppSetting.find()
    if(paymentStatus==='success'){
      if(queryTeller){
        return res.status(401).json({err: `The teller ${teller} has been confirmed already`})
      }else if(!queryTeller){
        
      const dTime = new Date()
      const rTime = new Date()
      const groove = await Groove.findById(grooveId);
      const grooveSchedule = groove.duration
      const grooveAppSchedule = app[0].grooveTime
      const rSchedule = rTime.setHours(rTime.getHours()+parseInt(groove?.period))
      const groovePayments = groove.payments
      const confirmedGroovePayments = groovePayments.filter(filt=>filt.paid===true)
      const grooveMinTarget = groove.target-(app[0].grooveRate*groove.target)
      let myPaymentsArr = [];
       groovePayments.forEach(el=>{
        if(el.member==queryPayee.email&&el.paid===true){
          return myPaymentsArr.push(el.amount)
        }
       });

       function reducer(a,c){
        return c+a;
       }
   const myPayments = myPaymentsArr.reduce(reducer,0)
      if(confirmedGroovePayments.length<1){
        //First payment confirmation
        if(amount>=grooveMinTarget){
          Payment.create({teller,type:type,payee,payer:cashier,nextWithdrawal:grooveSchedule>=grooveAppSchedule?grooveSchedule:grooveAppSchedule})
          .then(resp=>{
            if(!resp){
              return res.status(500).json({err:'Payment was not successfuly confirmed'})
            }else if (resp){
              Groove.findOneAndUpdate({_id:grooveId},{$set:{active:true,duration:groove.duration>=grooveAppSchedule?groove.duration:grooveAppSchedule}}).exec((err,resp)=>{
                if(err){
                  return res.status(500).json({err:err.message})  
                }else if(resp){
                  Groove.findOneAndUpdate({_id:grooveId,'members.member':queryPayee.email},
                  {$set:{'members.$.withdrawable':groove.target*((app[0].grooveFirstPaySpeed+app[0].groovePayAllSpeed)+
                  (amount)/grooveMinTarget),
                  'members.$.canWithdraw':true,'members.$.progress':(amount/grooveMinTarget)
                }
              }).exec((err,resp)=>{
                if(resp){
                  Groove.findOneAndUpdate({_id:grooveId},{$push:{readyToWithdraw:queryPayee.email}})
                  .exec((err,resp)=>{
                    if(err){
                      return res.status(500).json({err:err.message})
                    }else if(resp){
                      Groove.findOneAndUpdate({_id:grooveId,'payments.member':queryPayee.email},
                      {$set:{'payments.$.paid':true,
                    }
                  }).exec((err,resp)=>{
                    if(err){
                      return res.status(500).json({err:err.message})
                    }else if(resp){
                      return res.status(200).json({resp:'Payment made and groove is active.'})
                    }
                  })
                    }
                  })
                }else if(err){
                  return res.status(500).json({err:err.message})
                }
              })
                }else if(err){
                  return res.status(500).json({err:err.message})  
                }})
        }})
         }else{
          return res.status(401).json({err:`First payment must be at least ${grooveMinTarget}`})
         }
      }else{
        //Later payment confirmations
        if(amount>=grooveMinTarget){
          Payment.create({teller,type:type,payee,payer:cashier,nextWithdrawal:grooveSchedule>=grooveAppSchedule?grooveSchedule:grooveAppSchedule})
          .then(resp=>{
            if(!resp){
              return res.status(500).json({err:'Payment was not successfuly confirmed'})
            }else if (resp){
                  Groove.findOneAndUpdate({_id:grooveId,'members.member':queryPayee.email},
                  {$set:{'members.$.withdrawable':
                  groove.target*(app[0].groovePayAllSpeed+(amount)/grooveMinTarget),
                  'members.$.canWithdraw':true,'members.$.progress':(amount/grooveMinTarget)
                }
              }).exec((err,resp)=>{
                if(resp){
                  Groove.findOneAndUpdate({_id:grooveId},{$push:{readyToWithdraw:req.user.email}})
                  .exec((err,resp)=>{
                    if(err){
                      return res.status(500).json({err:err.message})
                    }else if(resp){
                      Groove.findOneAndUpdate({_id:grooveId,'payments.member':queryPayee.email},
                      {$set:{'payments.$.paid':true,
                    }
                  }).exec((err,resp)=>{
                    if(err){
                      return res.status(500).json({err:err.message})
                    }else if(resp){
                      return res.status(200).json({resp:'Payment was successful and you have completed your task.'})
                    }
                  })
                    
                    }
                  })
                }else if(err){
                  return res.status(500).json({err:err.message})
                }
              })
                
        }})
         }else if((amount+myPayments)>=grooveMinTarget){

          Payment.create({teller,type,payee,payer:cashier,nextWithdrawal:grooveSchedule>=grooveAppSchedule?grooveSchedule:grooveAppSchedule})
          .then(resp=>{
            if(!resp){
              return res.status(500).json({err:'Payment was not successfuly confirmed'})
            }else if (resp){
                  Groove.findOneAndUpdate({_id:grooveId,'members.member':queryPayee.email},
                  {$set:{'members.$.withdrawable':groove.target*
                    (amount)/grooveMinTarget,'members.$.canWithdraw':true,'members.$.progress':(amount/grooveMinTarget)
                }
              }).exec((err,resp)=>{
                if(resp){
                  Groove.findOneAndUpdate({_id:grooveId},{$push:{readyToWithdraw:queryPayee.email}})
                  .exec((err,resp)=>{
                    if(err){
                      return res.status(500).json({err:err.message})
                    }else if(resp){
                      
                      Groove.findOneAndUpdate({_id:grooveId,'payments.member':queryPayee.email},
                      {$set:{'payments.$.paid':true,
                    }
                  }).exec((err,resp)=>{
                    if(err){
                      return res.status(500).json({err:err.message})
                    }else if(resp){
                      return res.status(200).json({resp:'Payment was successful and you have completed your task.'})
                    }
                  })
                    
                    }
                  })
                }
              })
        }})
         
         }else if(amount+myPayments<grooveMinTarget){
          if(amount+myPayments>=grooveMinTarget/groove.requiredMembers){

            Payment.create({teller,type,payer:cashier,payee,nextWithdrawal:grooveSchedule>=grooveAppSchedule?grooveSchedule:grooveAppSchedule})
            .exec(resp=>{
              if(!resp){
                return res.status(500).json({err:'Payment was not successfuly confirmed'})
              }else if (resp){
                Groove.findOneAndUpdate({_id:grooveId,'members.member':queryPayee.email},{$set:{'members.$.progress':(amount/grooveMinTarget)
              }}).exec((err,resp)=>{
                  if(err){
                    return res.status(500).json({err:err.message})  
                  }else if(resp){
                    Groove.findOneAndUpdate({_id:grooveId,'payments.member':queryPayee.email},
                    {$set:{'payments.$.paid':true,'payments.$.nextPayment':rSchedule
                  }
                }).exec((err,resp)=>{
                  if(err){
                    return res.status(500).json({err:err.message})
                  }else if(resp){
                    return res.status(200).json({resp:`Payment success, pay more ${grooveMinTarget-(amount+myPayments)}.`})
                  }
                })
                  
                  }})
          }})
           
          }else if(amount+myPayments<grooveMinTarget/groove.requiredMembers){
            return res.status(401).json({err:`The minimum for the groove is ${grooveMinPeriodicTarget}`})
          }
         }
      }
    
    
      }
    }else{
      return res.status(422).json({err:`Sorry, payment was not successful. Contact ${app[0].help}`})
    }
  } catch (error) {
    return res.status(500).json({err:error.message})
  }
},
  async withdraw(req,res){
    try{
      const{amount,paymentId,type,grooveId} = req.body;
  const app = await AppSetting.find()

if(type=='save'){
  const user = await User.findById(req.user);
  const savings = user.savings;
  let withdrawables = [];
  let dates = []

  savings.forEach(element => {
    if(element.dueDate<=new Date()){
      withdrawables.push(element)
      dates.push(element.dueDate)
    }
  });
function reducer (a,v){
  return v.amount+a
}
const withdrawable = withdrawables.reduce(reducer,0)

if(amount<=withdrawable){
  return res.status(200).json({resp:{amount:amount,payee:req.user.email,account:'Savings',date:new Date()}})
}else{
  return res.status(401).json({err:`Insufficent fund, savings balance is ${withdrawable}.`})
}

}else if(type=='referral'){
  const user = await User.findById(req.user)
  const users = await User.find();
  const referrers = users.filter(filt=>filt.referrer.user===user.email);
  const payments = await Payment.find();
  let refPayments = []
  function refFunc(){
    let refs = [];
    referrers.forEach(el=>{
      if(el.referrer.used===false&&el.referrer.expired===false){
        const ref = payments.filter(filt=>filt.payee._id.toString()===el._id.toString()&&filt.canWithdraw)
        refs.push(ref)
      }
    });
    refs.forEach(element=>{
      if(element.length>0){
        refPayments.push(element[0])
      }
    })
  }
  refFunc()
  const reducer = (a,v)=>{
    return v.amount+a
  }
  const withdrawable = refPayments.reduce(reducer,0)
if(amount<=withdrawable*app[0].referralBonus){
  if(withdrawable*app[0].referralBonus>=app[0].withdrawableRefBonus){
    return res.status(200).json({resp:{amount:amount,payee:req.user.email,date:new Date()}})
  }else{
    return res.status(401).json({err:`Insuffient fund, withdrawable referral bonus is ${app[0].withdrawableRefBonus}`})
  }

}else{
  return res.status(401).json({err:`Insuffient fund, referral bonus is ${withdrawable*app[0].referralBonus}`})
}
}else{
  const payment = await Payment.findById(paymentId);
  const queryPayee = await User.findOne({email:payment.payee});
  const date = new Date();
const withdrawn = await Withdrawal.findOne({paymentId:paymentId});
const orbits = queryPayee?.orbits
const currentOrbit = orbits.filter(filt=>filt.paymentId.toString()===paymentId.toString())
const save = currentOrbit[0]?.save;
if(type=='personal-withdrawal'){
  if(payment.canWithdraw===true&&payment.payee.toString()===queryPayee.email.toString()&&!withdrawn){
    if(date<currentOrbit[0]?.nextWithdrawal){
      return res.status(422).json({err:`You can withdraw on ${currentOrbit[0].nextWithdrawal}.`})
    }else if(date>=currentOrbit[0].nextWithdrawal){
    if(amount<=save+(save*app[0].personalRate)){
      Withdrawal.create({
        amount,payee:req.user,type,paymentId:paymentId
      }).then(withdrawal=>{
        if(withdrawal){
          Payment.findOneAndUpdate({_id:paymentId},{$set:{canWithdraw:false}},{new:true})
          .exec((err,resp)=>{
            if(err){
              return res.status(500).json({err:err.message})
            }else if(resp){
              User.findOneAndUpdate({email:queryPayee.email},{$set:{received:parseInt(queryPayee.received)+parseInt(amount)}},{new:true})
              .exec((err,resp)=>{
                if(err){
                  return res.status(500).json({err:err.message})
                }else if(resp){
                  return res.status(200).json({resp:{withdrawalId:withdrawal._id,paymentId:withdrawal.paymentId,payee:req.user.email,amount:amount,date:date}})
                }else{
                  return res.status(500).json({err:'Something went wrong.'})        
                }
              })
            }else{
              return res.status(500).json({err:'Sorry, something went wrong.'})                }
          })
        }else{
          return 
        }
      }).catch(err=> res.status(500).json({err:err.message}))
     }else{
      return res.status(401).json({err:`Insufficient fund. Your max is ${save+(save*app[0].personalRate)}`})
     }
    }
    
        }else if(payment.canWithdraw===false||withdrawn){
          return res.status(401).json({err:"Sorry, you cannot withdraw one payment twice."})
      }else if(payment.payee.toString()!=queryPayee.email.toString()){
        return res.status(401).json({err:"Sorry, third-party withdrawal is not allowed."})
      }else{
        return res.status(403).json({err:"Something went wrong. Try again."})
      }
        
}else if(type=='groove-withdrawal'){
    //groove withdrawal
    const groove = await Groove.findById(grooveId)

    if(groove.members.filter(filt=>filt.isAdmin&&filt.member===req.user._id.toString()).length>0){
      if(!groove.haveWithdrawn.includes(req.user)){
//Admin wants to withdraw
const payment = groove.payments.filter(filt=>filt.member.toString()===req.user._id.toString())
if(payment.length>0){
  if(payment[0].amount>=(groove.target-(groove.target*app[0].grooveRate/groove.requiredMembers.length))){
    const time = new Date(payment[0].date)
    
   if(date>=time.setHours(time.getHours()+app[0].grooveTime)){
    return res.status(200).json({resp:{amount:amount,grooveId:grooveId,type:type,payee:req.user.email,date:new Date()}})   
   }else{
    return res.status(401).json({err:`Your payment will be due for withdrawal on ${time.setHours(time.getHours()+app[0].grooveTime)}`})
   }
  }else{
    return res.status(401).json({err:`Pay ${(groove.target-(groove.target*app[0].grooveRate/groove.requiredMembers.length))} to qualify to withdraw.`})
  }
}
      
    } else{
      //Admin has already withdrawn
    return res.status(401).json({err:'You have already. Please contact support.'})        
    }  
    }else if(groove.members.filter(filt=>filt.member.toString().includes(req.user._id.toString())).length>0){
      if(!groove.haveWithdrawn.includes(req.user)){
        //Member wants to withdraw
const payment = groove.payments.filter(filt=>filt.member.toString()===req.user._id.toString())
if(payment.length>0){
  if(payment[0].amount>=(groove.target-(groove.target*app[0].grooveRate/groove.requiredMembers.length))){
    const time = new Date(payment[0].date)
    
   if(date>=time.setHours(time.getHours()+app[0].grooveTime)){
    return res.status(200).json({resp:{amount:amount,grooveId:grooveId,type:type,payee:req.user.email,date:new Date()}})   
   }else{
    return res.status(401).json({err:`Your payment will be due for withdrawal on ${time.setHours(time.getHours()+app[0].grooveTime)}`})
   }
  }else{
    return res.status(401).json({err:`Pay ${(groove.target-(groove.target*app[0].grooveRate/groove.requiredMembers.length))} to qualify to withdraw.`})
  }
}
      
   
      }else{
        //Member has already withdrawn
        return res.status(401).json({err:'You have already. Please contact support.'})     
      } 
    }else{
      return res.status(401).json({err:`Something went wrong. Please contact help at ${app[0].help}.`}) 
    }
}
}
 }catch(err){
   return res.status(500).json({err:err.message})
  }
},
async confirmWithdrawal(req,res){
  try{
    const{withdrawalStatus,type,amount,grooveId,paymentId} = req.body;
    
    if(withdrawalStatus==='success'){
      if(type=='save'){
        const user = await User.findById(req.user);
    const savings = user.savings;
    let withdrawables = [];
    let dates = []
  
    savings.forEach(element => {
      if(element.dueDate<=new Date()){
        withdrawables.push(element)
        dates.push(element.dueDate)
      }
    });

        Withdrawal.create({
          amount,payee:req.user,type,paymentId:paymentId
        }).then(withdrawal=>{
          if(withdrawal){
            withdrawables.forEach(ele=>{
              User.findOneAndUpdate({_id:req.user._id,'savings.dueDate':ele.dueDate},{$set:{
                'savings.$.amount':0
              }},{new:true})
              .exec((err,resp)=>{
                if(err){
                  return res.status(500).json({err:err.message})
                }else if(resp){
                  User.findOneAndUpdate({_id:req.user._id},{$set:{received:parseInt(user.received)+parseInt(amount)}},{new:true})
                  .exec((err,resp)=>{
                    if(err){
                      return res.status(500).json({err:err.message})
                    }else if(resp){
                      return res.status(200).json({resp:{amount:amount,payee:req.user.email,account:'Savings',date:new Date()}})
                    }
                  })
                }
              })
            })
          }else{
              return res.status(500).json({err:`Something went wrong. Please contact ${app[0].help}.`})
            }
        })
      }else if(type=='referral'){
       
  const user = await User.findById(req.user)
  const users = await User.find();
  const referrers = users.filter(filt=>filt.referrer.user===user.email);
  const payments = await Payment.find();
  let refPayments = []
  function refFunc(){
    let refs = [];
    referrers.forEach(el=>{
      if(el.referrer.used===false&&el.referrer.expired===false){
        const ref = payments.filter(filt=>filt.payee.toString()===el.email.toString()&&filt.canWithdraw&&filt.paid)
        refs.push(ref)
      }
    });
    refs.forEach(element=>{
      if(element.length>0){
        refPayments.push(element[0])
      }
    })
  }
  refFunc()
  const reducer = (a,v)=>{
    return v.amount+a
  }
  const withdrawable = refPayments.reduce(reducer,0)
if(amount<=withdrawable*app[0].referralBonus){
  if(withdrawable*app[0].referralBonus>=app[0].withdrawableReBonus){
    Withdrawal.create({
      amount,payee:req.user.email,type,paymentId:paymentId
    }).then(withdrawal=>{
      if(withdrawal){
        referrers.forEach(element => {
          User.findOneAndUpdate({_id:element._id},{
            $set:{referrer:{user:user.email,used:true,expired:false,date:new Date()}}
          },{new:true})
          .exec((err,resp)=>{
            if(err){
              return res.status(500).json({err:err.message})
            }else if(resp){
              User.findByIdAndUpdate(user,{$set:{received:parseInt(user.received)+parseInt(amount)}},{new:true})
              .exec((err,resp)=>{
                if(err){
                  return res.status(500).json({err:err.message})
                }else if(resp){
                  return res.status(200).json({resp:{amount:amount,payee:withdrawal.payee,date:new Date()}})
                }
              })
            }
          })
        });
      }
    }).catch(err=>res.status(500).json({err:err.message}))

  }else{
    return res.status(401).json({err:`Insuffient fund, withdrawable referral bonus is ${app[0].withdrawableReBonus}`})
  }

}else{
  return res.status(401).json({err:`Insuffient fund, referral bonus is ${withdrawable*app[0].referralBonus}`})
}

      }else{
        const payment = await Payment.findById(paymentId)
        const queryPayee = await User.findOne({email:payment.payee});
    
        if(type=='personal'){
          const orbits = queryPayee.orbits
          const currentOrbit = orbits.filter(filt=>filt.paymentId.toString()===payment._id.toString())
          Withdrawal.create({
            amount,payee:req.user.email,type,paymentId:paymentId
          })
      .then(resp=>{
        if(!resp){
          return res.status(500).json({resp:`${amount} resp was not confirmed.`})
        }else if(resp){
          User.findOneAndUpdate({_id:queryPayee._id,'orbits.paymentId':paymentId.toString()},{$set:{
            'orbits.$.save':parseInt(currentOrbit[0].save)-parseInt(resp.amount)
          }},{new:true})
          .exec((err,resp)=>{
            if(err){
              return res.status(500).json({err:err.message})
            }else if(resp){
              return res.status(200).json({resp:`${resp.amount} withdrawal confirmed.`})
            }
          })
        }
      })
        }else if(type=='groove'){
          //groove withdrawal
          Withdrawal.create({
            amount,payee:req.user.email,type,paymentId:paymentId
          }).then(withdrawal=>{
            if(withdrawal){
              Groove.findOneAndUpdate({_id:grooveId},{$push:{haveWithdrawn:req.user.email}},{new:true})
              .exec((err,resp)=>{
                if(err){
                  return res.status(500).json({err:err.message})
                }else if(resp){
                  return res.status(200).json({resp:{amount:amount,type:type,payee:req.user.email,date:new Date()}})   
                }else{
                  return res.status(500).json({err:'Something went wrong.'})        
                }
              })
            }else{
              return res.status(500).json({err:'Something went wrong.'})        
            }
          }).catch(err=> res.status(500).json({err:err.message}))
        }
      }
      
    }else{
      return res.status(403).json({err:"Something went wrong. Try again."})
    }
   }catch(err){
 return res.status(500).json({err:err.message})
}
},
async salaryWithdrawal(req,res){
  try{
    const app = await AppSetting.find()
    const users = await User.find()
        const referrers = users.filter(filt=>filt.referrer!==null)
        referrers.forEach(element => {
            if(element.referrer.user===req.user.userName&&new Date(element.date)<=new Date()){
              AppSetting.findByIdAndUpdate(app[0]._id,{$push:{salaryPaymentRequests:{payee:req.user.email,date:new Date(),status:'pending'}}},{new:true})
              .exec((err,resp)=>{
                if(err){
                  return res.status(500).json({err:err.message})
                }else if(resp){
                  return res.status(200).json({resp:'Payment request successful.'})
                }
              })
            }
        });
   }catch(err){
 return res.status(500).json({err:err.message})
}
},
async salaryApproval(req,res){
  try{
    const app = await AppSetting.find()
    const salaryPaymentRequests = app[0].salaryPaymentRequests;
    let eligibles = [];
    let alreadyPaid = [];
    salaryPaymentRequests.forEach(element=>{
      if(element.status==='pending'){
    User.findOne({email:element.payee})
          .then(user=>{
            if(user&&user.health<100){
              return res.status(401).json({err:'Sorry, your account is not healthy to receive payments. Contact ${app[0].help}.'})
            }else if(user&&user.health===100){
                   return eligibles.push(user.email)
  }
          }).catch(err=>res.status(500).json({err:err.message}))
      }else if(element.status!=='pending'){
          return alreadyPaid.push(element)
  }
    });
    if(eligibles.length>0){
      eligibles.forEach(ele=>{
        AppSetting.findOneAndUpdate({_id:app[0]._id,'salaryPaymentRequests.payee':ele},{$set:{
          'salaryPaymentRequests.$.status':'paid'
        }},{new:true})
        .exec((err,resp)=>{
          if(err){
            return res.status(500).json({err:err.message})
          }else if(resp){
            return res.status(200).json({resp:`${eligibles.length} just paid and ${alreadyPaid.length} paid before.`})
          }else{
            return res.status(500).json({err:'Something went wrong.'})
          }
        })
      })
    }else if(eligibles.length<1){
    return res.status(404).json({err:'No eligible request was found.'})
    }
   }catch(err){
 return res.status(500).json({err:err.message})
}
},
async payments (req,res){
  try {
    Payment.find().then(payments=>{
      if(!payments){
        return res.status(422).json({err:"Sorry, there is an error."})
      }else{
        if(payments.length>0){
          return res.status(200).json({resp:payments})
        }else{
          return res.status(422).json({err:"Sorry, there is payment made."})
        }
      }
    })
  } catch (error) {
    return res.status(500).json({err:error.mesaage})
  }
},
async save(req,res){
  try {
    const {amount,nextWithdrawal} = req.body;
    const aDate = new Date();
    const sDate = new Date();
    const app = await AppSetting.find()
    const aSchedule = aDate.setHours(aDate.getHours()+app[0].savingsTime+1)
    const sSchedule = sDate.setHours(sDate.getHours()+nextWithdrawal+1)
    const user = await User.findById(req.user)
    const lastOrbit = user.orbits[user.orbits.length-1]
    const paymentId = lastOrbit.paymentId;
    const payment = await Payment.findById(paymentId)
    const pSchedule = payment.nextWithdrawal

    let availableFund = 0;
    if(payment){
      if(payment.canWithdraw&&pSchedule>new Date()){
        availableFund = lastOrbit.save*app[0].personalRate+lastOrbit.save
      }
    }
        // const save = (user.orbits[user.orbits.length-1].save)+(app[0].personalRate*user.orbits[user.orbits.length-1].save)
    
    const level = lastOrbit.level
    const save = lastOrbit.save
    const oldNextWithdrawal = lastOrbit.nextWithdrawal
    
   if(availableFund>0&&amount<=availableFund){
    User.findOneAndUpdate({email:req.user.email},{$push:{savings:{amount:parseInt(save),level:parseInt(level),dueDate:sSchedule>=aSchedule?sSchedule:aSchedule}}},{new:true})
    .exec((err,resp)=>{
      if(err){
        return res.status(500).json({err:err.message})
      }else if(resp){
        User.findOneAndUpdate({email:req.user.email,'orbits.level':level},{
          $set:{'orbits.$.save':0}
        },{new:true})
        .exec((err,resp)=>{
          if(err){
            return res.status(500).json({err:err.message})
          }else if(resp){
            Payment.findOneAndUpdate({_id:payment._id},{$set:{canWithdraw:false}},{new:true})
            .exec((err,resp)=>{
              if(err){
                return res.status(500).json({err:err.message})
              }else if(resp){
                return res.status(200).json({resp:`${save} was saved.`})
              }
            })
          }else{
            return res.status(500).json({err:`Something went wrong. Contact ${app[0].help}`})
          }
        })
      }else{
        return res.status(500).json({err:'Something went wrong, contact support.'})
      }
    })
   }else if(availableFund<amount&&availableFund>0){
    return res.status(401).json({err:`You cant\'t save more than ${availableFund}.`})
   }else if(availableFund===0){
    return res.status(401).json({err:`Fund the orbit\'s level and retry.`})
   }else{
    return res.status(401).json({err:`Something went wrong. Contact ${app[0].help}.`})
   }
  } catch (e) {
    return res.status(500).json({err:e.message})
    }
  },
async makeManualPayment(req,res){
  try{
    const{id,amount,phone,name,nextWithdrawal,cashier,payee,type,duration,period,description,requiredMembers,grooveId} = req.body;
    const tools = {amount,phone,name,cashier,nextWithdrawal,payee,type,duration,period,description,requiredMembers,grooveId}
    const data = {id,confirmed:false,tools,date:new Date()}
    
    const queryPayer = User.findOne({email:cashier})
    const queryPayment = queryPayer.manualPayments?.filter(filt=>filt.id===id);

    if(queryPayment?.length>0 && queryPayment.confirmed===false){
      return res.status(401).json({err:'Please wait for confirmation.'})
    }else{
      User.findOneAndUpdate({email:cashier},{$push:{manualPayments:data}},{new:true})
      .exec((err,resp)=>{
        if(err){
          return res.status(500).json({err:err.message})
        }else if(resp){
          return res.status(200).json({resp:'Request received, please wait for confirmation.'})
        }
      })
    }

  }catch(err){
    return res.status(500).json({err:err.message})
  }
},
async reConfirmManualPayment(req,res){
  try{
    const{id} = req.params;
      User.findOneAndUpdate({email:req.user.email,'manualPayments.id':id},{$set:{'manualPayments.$.confirmed':true}},{new:true})
      .exec((err,resp)=>{
        if(err){
          return res.status(500).json({err:err.message})
        }else if(resp){
          return res.status(200).json({resp:'Payment confirmed successfully.'})
        }
      })

  }catch(err){
    return res.status(500).json({err:err.message})
  }
},
withdrawals(req,res){
  try{
    Withdrawal.find().then(data=>{
      if(data){
        return res.status(200).json({resp:data})
      }else{
        return res.status(500).json({err:[]})
      }
    })  
  }catch(err){
    return res.status(500).json({err:err.message})
  }
},async personalManaulWithdrawal(req,res){
  try{
    const{amount,paymentId} = req.body
    const app =  await AppSetting.find()
    const payments = await Payment.find();
    const payment = await Payment.findById(paymentId);
    const payer = await User.findOne({email:payment.payer})
    const queryPayee = await User.findOne({email:payment.payee});
    const myPayments = payments?.filter(filt=>filt.payee===queryPayee.email&&filt.canWithdraw);
    const date = new Date();
  const withdrawal = await Withdrawal.findOne({paymentId:myPayments[myPayments.length-2]._id});
  const withdrawalFirst = await Withdrawal.findOne({paymentId:myPayments[myPayments.length-1]._id});
  const withdrawn = withdrawal?.withdrawn;
  const orbits = queryPayee?.orbits
  const lastOrbit = orbits[orbits.length-1];
  const lastWithdrwal = await Withdrawal.findOne({paymentId:lastOrbit._id});

 if(myPayments.length>=2&&!lastWithdrwal&&!withdrawalFirst){
  const personalWithdrawable = lastOrbit.orbit===1&&lastOrbit.level===2?payment.amount/2+(app[0]?.personalRate*payment.amount)/2:payment.amount+(payment.amount*app[0]?.personalRate)
  if(payment.canWithdraw===true&&payment.payee.toString()===queryPayee.email.toString()&&!withdrawn){
    if(date<payment?.nextWithdrawal){
      return res.status(422).json({err:`You can withdraw on ${payment.nextWithdrawal}.`})
    }else if(date>=payment.nextWithdrawal){
    if(amount<=personalWithdrawable){
      Withdrawal.create({
        amount,payee:req.user.email,type:'personal',paymentId:paymentId,payer:payer.email
      }).then(withdrawal=>{
        if(withdrawal){
          res.status(200).json({resp:`Kindly contact ${payer.userName} on ${payer.phone}`})
        }else{
          return 
        }
      }).catch(err=> res.status(500).json({err:err.message}))
     }else{
      return res.status(401).json({err:`Insufficient fund. Your max is ${personalWithdrawable}`})
     }
    }
    
        }else if(payment.canWithdraw===false||withdrawn){
          return res.status(401).json({err:"Sorry, you cannot withdraw one payment twice."})
      }else if(payment.payee.toString()!=queryPayee.email.toString()){
        return res.status(401).json({err:"Sorry, third-party withdrawal is not allowed."})
      }else{
        return res.status(403).json({err:"Something went wrong. Try again."})
      }
 }else{
  return res.status(403).json({err:"Kindly reinvest first before withdrawing."})
 }
            
  }catch(err){
    return res.status(500).json({err:err.message})
  }
},async confirmPersonalManualWithdrawal(req,res){
  try{
    const{paymentId} = req.body;
    const withdrawal = await Withdrawal.findOne({paymentId:paymentId})
    const queryPayee = await User.findOne({email:withdrawal.payee})
    
    if(req.user.isAdmin||req.user.email===queryPayee.email){
      Withdrawal.findOneAndUpdate({paymentId:paymentId},{$set:{withdrawn:true}},{new:true})
      .exec((err,resp)=>{
        if(err){
          return res.status(500).json({err:err.message})
        }else if(resp){
          Payment.findOneAndUpdate({_id:paymentId},{$set:{canWithdraw:false}},{new:true})
          .exec((err,resp)=>{
            if(err){
              return res.status(500).json({err:err.message})
            }else if(resp){
              User.findOneAndUpdate({email:queryPayee.email},{$set:{received:parseInt(queryPayee.received)+parseInt(withdrawal.amount)}},{new:true})
              .exec((err,resp)=>{
                if(err){
                  return res.status(500).json({err:err.message})
                }else if(resp){
                  return res.status(200).json({resp:`${withdrawal.amount} was successfully withdrawn.`})
                }else{
                  return res.status(500).json({err:'Something went wrong.'})        
                }
              })
            }else{
              return res.status(500).json({err:'Sorry, something went wrong.'})                }
          })
    }})
    }else{
      return res.status(401).json({err:'You are not permitted to perform this action.'})
    }

  }catch(err){
    return res.status(500).json({err:err.message})
  }
},async removePayment(req,res){
  try{
    const{id} = req.params;
    User.findOneAndDelete({_id:req.user._id,'manualPayments.id':id},{new:true})
    .exec((err,resp)=>{
      if(err){
        return res.status(500).json({err:err.message})
      }else if(resp){
        return res.status(200).json({resp:`${id} was removed successfully.`})
       }})
  }catch(err){
    return res.status(500).json({err:err.message})
  }
}
}