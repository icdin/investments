const mongoose = require('mongoose');

const paymentaSchema = new mongoose.Schema({
              payer:String,
              payee:String,
  type:String,
  date:{type:Date,
    default:Date.now()
    },
    teller:String,
  amount:Number,
  nextWithdrawal:Date,
  canWithdraw:{type:Boolean,default:true}
});
module.exports = mongoose.model('Payment', paymentaSchema);