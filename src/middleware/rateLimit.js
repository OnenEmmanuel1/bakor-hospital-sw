const {rateLimit}=require('express-rate-limit');module.exports=rateLimit({windowMs:15*60*1000,limit:30,standardHeaders:true,legacyHeaders:false});
