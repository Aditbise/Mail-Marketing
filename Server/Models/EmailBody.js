const mongoose=require('mongoose');
const EmailBodySchema=new mongoose.Schema({
    Name:{type:String,required:true},
    bodyContent:{type:String,required:true},
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now}
});
module.exports=mongoose.model('EmailBody',EmailBodySchema);