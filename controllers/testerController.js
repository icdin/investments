const Tester = require('../models/tester')
module.exports={
    async createTester(req,res){
        try{
            const{name,value}=req.body;
const dates = new Date()
const date = dates.setHours(dates.getHours()+value+1);
            Tester.create({name,date}).then(data=>{
                return res.status(200).json({resp:'Created successfully.'})
            }).catch(err=>res.status(500).json({err:err.message}))
        }catch(err){
            return res.status(500).json({err:err.message})
        }
    }
}