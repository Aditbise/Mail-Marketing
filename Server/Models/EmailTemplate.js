const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  FileType:[{type:String,required:true}],
  FileName:[{type:String,required:true}],
  csvData:[{type:String}],
  pdfData:[{type:Buffer}] ,
  createdAt:{type:Date,default:Date.now},
  updatedAt:{type:Date,default:Date.now}
});

const EmailTemplateModel = mongoose.model('EmailTemplate', emailTemplateSchema);

module.exports = EmailTemplateModel;
