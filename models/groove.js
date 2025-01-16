const mongoose = require('mongoose');
const groove = new mongoose.Schema({
  name:String,
  description:String,
  duration:Number,
  period:Number,
  requiredMembers:Number,
  target:Number,
  balance: Number,
  nextPayment:Date,
  orbit:Number,
  image:{
    type:String,
    default:'image'
},
  members:[],
  haveWithdrawn:[],
  readyToWithdraw:[],
  active:{type:Boolean,default:false},
  payments:[{member:String,amount:Number,paymentId:String,paid:{type:Boolean,default:false},nextPayment:Number,date:Date}],
  admin: {type: mongoose.Schema.Types.ObjectId,ref: 'User'},
  date:{type:Date,default:Date.now()}
})

module.exports = mongoose.model('Groove', groove)