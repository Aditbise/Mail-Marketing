const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require('path');
const fs = require('fs');

const EmployeeModel = require('./Models/Email.js');
const EmailListModel = require('./Models/EmailList.js');
const EmailTemplateModel = require('./Models/EmailTemplate.js');   
const SegmentModel = require('./Models/Segmant.js');
const CompanyInfo = require('./Models/CompanyInfo');
const EmailBody = require('./Models/EmailBody'); // Add this line

const app = express();
app.use(express.json());
app.use(cors());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'logo') {
      // Only allow images for logo
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for logo'));
      }
    } else {
      cb(null, true);
    }
  }
});

// For templates (memory storage)
const memoryUpload = multer({ storage: multer.memoryStorage() });

mongoose.connect("mongodb://localhost:27017/email");

// ===== AUTH ROUTES =====
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    EmployeeModel.findOne({ email: email })
    .then(user => {
        if (user) {
            if (user.password === password) {
                res.json("Success");
            } else {
                res.json("Incorrect Password");
            }
        } else {
            res.json("User does not exist please register :D");
        }
    })
    .catch(err => res.status(500).json({ message: 'Login error', error: err }));
});

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

// ===== EMAIL LIST ROUTES =====
app.post('/add-email', async (req, res) => {
    const { email, name, position, company, dateAdded } = req.body;
    try {
        const newEmail = await EmailListModel.create({
            email, name, position, company, dateAdded
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
            req.params.id, req.body, { new: true, runValidators: true }
        );
        res.json({ message: 'Email updated successfully', updated });
    } catch (error) {
        res.status(500).json({ message: 'Error updating email', error });
    }
});

// ===== SEGMENT ROUTES =====
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

app.delete('/segments/:id', async (req, res) => {
    try {
        await SegmentModel.findByIdAndDelete(req.params.id);
        res.json({ message: "Segment deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting segment", error });
    }
});

app.post('/segments/delete-many', async (req, res) => {
    try {
        await SegmentModel.deleteMany({ _id: { $in: req.body.ids } });
        res.json({ message: 'Selected segments deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting segments', error });
    }
});

// ===== EMAIL TEMPLATE ROUTES =====
app.post('/email-templates', memoryUpload.fields([{ name: 'csvData' }, { name: 'pdfData' }]), async (req, res) => {
    try {
        const { FileType, FileName } = req.body;
        const csvData = req.files['csvData'] ? req.files['csvData'].map(f => f.buffer.toString('utf-8')) : [];
        const pdfData = req.files['pdfData'] ? req.files['pdfData'].map(f => f.buffer) : [];
        const template = await EmailTemplateModel.create({
            FileType, FileName, csvData, pdfData
        });
        res.json(template);
    } catch (err) {
        res.status(500).json({ message: 'Error creating template', error: err });
    }
});

app.get('/email-templates', async (req, res) => {
    try {
        const templates = await EmailTemplateModel.find();
        res.json(templates);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching templates', error });
    }
});

app.get('/email-templates/:id', async (req, res) => {
    try {
        const template = await EmailTemplateModel.findById(req.params.id);
        res.json(template);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching template', error });
    }
});

app.put('/email-templates/:id', memoryUpload.fields([{ name: 'csvData' }, { name: 'pdfData' }]), async (req, res) => {
    try {
        const { FileType, FileName } = req.body;
        const csvData = req.files['csvData'] ? req.files['csvData'].map(f => f.buffer.toString('utf-8')) : [];
        const pdfData = req.files['pdfData'] ? req.files['pdfData'].map(f => f.buffer) : [];
        const updated = await EmailTemplateModel.findByIdAndUpdate(
            req.params.id,
            { FileType, FileName, csvData, pdfData },
            { new: true }
        );
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Error updating template', error });
    }
});

app.delete('/email-templates/:id', async (req, res) => {
    try {
        await EmailTemplateModel.findByIdAndDelete(req.params.id);
        res.json({ message: 'Template deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting template', error });
    }
});

// ===== COMPANY INFO ROUTES =====
app.get('/company-info', async (req, res) => {
    try {
        let company = await CompanyInfo.findOne().lean();
        if (!company) {
            company = new CompanyInfo({
                companyName: 'Your Company Name',
                email: 'contact@yourcompany.com'
            });
            await company.save();
            company = company.toObject();
        }
        res.json(company);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching company info', error });
    }
});

app.put('/company-info', async (req, res) => {
    try {
        let company = await CompanyInfo.findOne();
        if (!company) {
            company = new CompanyInfo(req.body);
        } else {
            Object.assign(company, req.body);
            company.updatedAt = new Date();
        }
        await company.save();
        res.json(company);
    } catch (error) {
        res.status(400).json({ message: 'Error updating company info', error });
    }
});

// Upload company logo (saves to file system, stores path in database)
app.post('/company-info/logo', upload.single('logo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No logo file uploaded' });
        }

        const logoPath = `/uploads/${req.file.filename}`;
        
        let company = await CompanyInfo.findOne();
        if (!company) {
            company = new CompanyInfo({
                companyName: 'Your Company Name',
                email: 'contact@yourcompany.com',
                logo: logoPath
            });
        } else {
            // Delete old logo file if it exists
            if (company.logo && company.logo.startsWith('/uploads/')) {
                const oldPath = path.join(__dirname, company.logo);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            company.logo = logoPath;
            company.updatedAt = new Date();
        }
        
        await company.save();
        res.json({ 
            message: 'Logo uploaded successfully', 
            logoPath: logoPath,
            logoUrl: `http://localhost:3001${logoPath}`
        });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading logo', error });
    }
});

// Get company logo
app.get('/company-info/logo', async (req, res) => {
    try {
        const company = await CompanyInfo.findOne().select('logo');
        if (!company || !company.logo) {
            return res.status(404).json({ message: 'Logo not found' });
        }
        res.redirect(company.logo);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching logo', error });
    }
});

app.delete('/company-info/logo', async (req, res) => {
    try {
        const company = await CompanyInfo.findOne();
        if (company && company.logo) {
            if (company.logo.startsWith('/uploads/')) {
                const logoPath = path.join(__dirname, company.logo);
                if (fs.existsSync(logoPath)) {
                    fs.unlinkSync(logoPath);
                }
            }
            company.logo = '';
            company.updatedAt = new Date();
            await company.save();
        }
        res.json({ message: 'Logo deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting logo', error });
    }
});

// ===== EMAIL BODY ROUTES ===== (Updated for new schema)

// CREATE - Add new email body
app.post('/email-bodies', async (req, res) => {
    try {
        const { Name, bodyContent } = req.body;
        
        if (!Name || !bodyContent) {
            return res.status(400).json({ message: 'Name and body content are required' });
        }
        
        const emailBody = new EmailBody({ 
            Name,
            bodyContent,
            updatedAt: Date.now()
        });
        await emailBody.save();
        
        res.json({ message: 'Email body created', emailBody });
    } catch (error) {
        res.status(500).json({ message: 'Error creating email body', error });
    }
});

// READ - Get all email bodies
app.get('/email-bodies', async (req, res) => {
    try {
        const emailBodies = await EmailBody.find().sort({ createdAt: -1 });
        res.json(emailBodies);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching email bodies', error });
    }
});

// READ - Get single email body
app.get('/email-bodies/:id', async (req, res) => {
    try {
        const emailBody = await EmailBody.findById(req.params.id);
        if (!emailBody) {
            return res.status(404).json({ message: 'Email body not found' });
        }
        res.json(emailBody);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching email body', error });
    }
});

// UPDATE - Update email body
app.put('/email-bodies/:id', async (req, res) => {
    try {
        const { Name, bodyContent } = req.body;
        
        const emailBody = await EmailBody.findByIdAndUpdate(
            req.params.id,
            { 
                Name,
                bodyContent,
                updatedAt: Date.now()
            },
            { new: true }
        );
        
        if (!emailBody) {
            return res.status(404).json({ message: 'Email body not found' });
        }
        
        res.json({ message: 'Email body updated', emailBody });
    } catch (error) {
        res.status(500).json({ message: 'Error updating email body', error });
    }
});

// DELETE - Delete email body
app.delete('/email-bodies/:id', async (req, res) => {
    try {
        const emailBody = await EmailBody.findByIdAndDelete(req.params.id);
        
        if (!emailBody) {
            return res.status(404).json({ message: 'Email body not found' });
        }
        
        res.json({ message: 'Email body deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting email body', error });
    }
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});

