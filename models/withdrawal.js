const mongoose = require('mongoose');

const withdrawal = new mongoose.Schema({
    type:String,
    payee:{},
    withdrawn:{type:Boolean,default:false},
  paymentId:{ type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'},
  amount:Number,
  date:{type:Date,
    default:Date.now()
    },
});
module.exports = mongoose.model('Withdrawal', withdrawal);