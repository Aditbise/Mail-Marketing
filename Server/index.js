const express=require("express")
const mongoose=require("mongoose")
const cors=require("cors")
const EmployeeModel=require('./Models/Email.js')
const EmailListModel=require('./Models/EmailList.js')


const app=express()
app.use(express.json())
app.use(cors())

mongoose.connect("mongodb://localhost:27017/email");

//routes for emaillist
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

app.post('/signup', (req, res) => {
    EmployeeModel.create(req.body)
        .then(employee => res.json(employee))
        .catch(err => {
            if (err.code === 11000) {
                res.status(400).json({ message: 'Email already exists!' });
            } else {
                res.status(500).json({ message: 'Error signing up', error: err });
            }
        });
});

app.listen(3001, () => {
    console.log("server is running")
})

app.post('/add-email', async (req, res) => {
    const { email, name, position, company, dateAdded } = req.body;
    try {
        const newEmail = await EmailListModel.create({
            email,
            name,
            position,
            company,
            dateAdded
        });
        res.json({ message: 'Email added successfully', email: newEmail });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Email already exists!' });
        } else {
            res.status(500).json({ message: 'Error adding email', error });
        }
    }
});
app.get('/email-list', async (req, res) => {
    try {
        const emails = await EmailListModel.find();
        res.json(emails);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching emails', error });
    }
});
app.delete('/email-list/:id', async (req, res) => {
    try {
        await EmailListModel.findByIdAndDelete(req.params.id);
        res.json({ message: 'Email deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting email', error });
    }
});
app.post('/email-list/delete-many', async (req, res) => {
    try {
        await EmailListModel.deleteMany({ _id: { $in: req.body.ids } });
        res.json({ message: 'Selected emails deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting emails', error });
    }
});
app.put('/email-list/:id', async (req, res) => {
    try {
        const updated = await EmailListModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        res.json({ message: 'Email updated successfully', updated });
    } catch (error) {
        res.status(500).json({ message: 'Error updating email', error });
    }
});


//routes for segment
const SegmentModel = require('./Models/Segmant.js');

app.post('/segments', async (req, res) => {
    try {
        const segment = await SegmentModel.create(req.body);
        res.json(segment);
    } catch (error) {
        res.status(500).json({ message: 'Error creating segment', error });
    }
});
app.get('/segments', async (req, res) => {
    try {
        const segments = await SegmentModel.find().populate('contacts');
        res.json(segments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching segments', error });
    }
});
app.get('/segments/:id/contacts', async (req, res) => {
    try {
        const segment = await SegmentModel.findById(req.params.id).populate('contacts');
        res.json(segment.contacts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching contacts', error });
    }
});
app.get('/segments/:id', async (req, res) => {
    try {
        const segment = await SegmentModel.findById(req.params.id).populate('contacts');
        res.json(segment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching segment', error });
    }
});
app.put('/segments/:id', async (req, res) => {
    try {
        const updatedSegment = await SegmentModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedSegment);
    } catch (error) {
        res.status(500).json({ message: 'Error updating segment', error });
    }
});