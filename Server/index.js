const express=require("express")
const mongoose=require("mongoose")
const cors=require("cors")
const EmployeeModel=require('./Models/Email.js')

const app=express()
app.use(express.json())
app.use(cors())

mongoose.connect("mongodb://localhost:27017/email");

app.post('/login',(req,res)=>{
    const {email,password}=req.body;
    EmployeeModel.findOne({email:email})
    .then(user=>{
        if(user){
            if(user.password===password){
                res.json("Success")
            }
            else{
                res.json("Incorrect Password")
            }
        }else{
            res.json("User does not exist please register :D")
        }
    })
})

app.post('/signup',(req,res)=>{
    EmployeeModel.create(req.body)
    .then(employees=>res.json(employees))
    .catch(err=>res.json(err))
})

app.listen(3001,()=>{
    console.log("server is running")
})


//Capmaign backend
// const Campaign=require('./Translation-app/Models/Campaign.jsx')
// app.post('/campaign',async(req,res)=>{
//     const campaign=await Campaign.create(req.body);
//     res.json(campaign);
// });