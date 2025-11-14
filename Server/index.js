require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

const EmployeeModel = require('./Models/Email.js');
const EmailListModel = require('./Models/EmailList.js');
const EmailTemplateModel = require('./Models/EmailTemplate.js');   
const SegmentModel = require('./Models/Segmant.js');
const CompanyInfo = require('./Models/CompanyInfo');
const EmailBody = require('./Models/EmailBody'); 
const EmailCampaign = require('./Models/EmailCampaign');
const EmailTracking = require('./Models/EmailTracking');
const EmailService = require('./services/EmailService.js');

const app = express();
app.use(express.json());
app.use(cors({
    origin: [
        "http://localhost:3000", 
        "http://localhost:5173",  
        "http://127.0.0.1:5173"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// Create uploads directory if it doesn't exist
const emailBodiesDir = './uploads/email-bodies';
if (!fs.existsSync(emailBodiesDir)) {
    fs.mkdirSync(emailBodiesDir, { recursive: true });
}

// Configure multer for file uploads
const emailBodyStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, emailBodiesDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Allow PDFs, images, text files, Word docs, etc.
    const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'text/plain',
        'text/html',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Please upload PDF, image, text, or Office documents.'), false);
    }
};

const uploadEmailBodyFiles = multer({ 
    storage: emailBodyStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Use environment variables
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mail-marketing";
const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret";

// Update MongoDB connection to use environment variable
mongoose.connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

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
app.post('/email-bodies', uploadEmailBodyFiles.array('attachments', 10), async (req, res) => {
    try {
        const { Name, bodyContent } = req.body;
        
        if (!Name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        // Handle attachments
        const attachments = req.files ? req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path
        })) : [];

        // Determine content type
        let contentType = 'text';
        if (attachments.length > 0 && bodyContent) {
            contentType = 'mixed';
        } else if (attachments.length > 0) {
            contentType = 'file';
        }

        const emailBody = new EmailBody({ 
            Name,
            bodyContent: bodyContent || '',
            contentType: contentType,
            attachments: attachments,
            updatedAt: Date.now()
        });
        
        await emailBody.save();
        
        res.json({ 
            message: 'Email body created successfully', 
            emailBody 
        });
    } catch (error) {
        console.error('Error creating email body:', error);
        res.status(500).json({ message: 'Error creating email body', error: error.message });
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
app.put('/email-bodies/:id', uploadEmailBodyFiles.array('attachments', 10), async (req, res) => {
    try {
        const { Name, bodyContent, keepExistingFiles } = req.body;
        
        const existingBody = await EmailBody.findById(req.params.id);
        if (!existingBody) {
            return res.status(404).json({ message: 'Email body not found' });
        }

        // Handle new attachments
        const newAttachments = req.files ? req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path
        })) : [];

        // Decide which attachments to keep
        let finalAttachments = [];
        if (keepExistingFiles === 'true') {
            finalAttachments = [...existingBody.attachments, ...newAttachments];
        } else {
            // Delete old files
            existingBody.attachments.forEach(attachment => {
                if (fs.existsSync(attachment.path)) {
                    fs.unlinkSync(attachment.path);
                }
            });
            finalAttachments = newAttachments;
        }

        // Determine content type
        const finalBodyContent = bodyContent !== undefined ? bodyContent : existingBody.bodyContent;
        let contentType = 'text';
        if (finalAttachments.length > 0 && finalBodyContent) {
            contentType = 'mixed';
        } else if (finalAttachments.length > 0) {
            contentType = 'file';
        }

        const emailBody = await EmailBody.findByIdAndUpdate(
            req.params.id,
            { 
                Name: Name || existingBody.Name,
                bodyContent: finalBodyContent,
                contentType: contentType,
                attachments: finalAttachments,
                updatedAt: Date.now()
            },
            { new: true }
        );
        
        res.json({ 
            message: 'Email body updated successfully', 
            emailBody 
        });
    } catch (error) {
        console.error('Error updating email body:', error);
        res.status(500).json({ message: 'Error updating email body', error: error.message });
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

// Serve uploaded files
app.get('/uploads/email-bodies/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, 'uploads', 'email-bodies', filename);
    
    if (fs.existsSync(filepath)) {
        res.sendFile(path.resolve(filepath));
    } else {
        res.status(404).json({ message: 'File not found' });
    }
});

// Delete specific attachment
app.delete('/email-bodies/:id/attachments/:attachmentId', async (req, res) => {
    try {
        const emailBody = await EmailBody.findById(req.params.id);
        if (!emailBody) {
            return res.status(404).json({ message: 'Email body not found' });
        }

        const attachment = emailBody.attachments.id(req.params.attachmentId);
        if (!attachment) {
            return res.status(404).json({ message: 'Attachment not found' });
        }

        // Delete physical file
        if (fs.existsSync(attachment.path)) {
            fs.unlinkSync(attachment.path);
        }

        // Remove from database
        emailBody.attachments.pull(req.params.attachmentId);
        
        // Update content type
        const hasContent = emailBody.bodyContent && emailBody.bodyContent.trim();
        if (emailBody.attachments.length === 0) {
            emailBody.contentType = 'text';
        } else if (hasContent) {
            emailBody.contentType = 'mixed';
        } else {
            emailBody.contentType = 'file';
        }
        
        await emailBody.save();

        res.json({ message: 'Attachment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting attachment', error: error.message });
    }
});

// ===== EMAIL CAMPAIGN ROUTES =====

// Get all email campaigns
app.get('/email-campaigns', async (req, res) => {
  try {
    const campaigns = await EmailCampaign.find()
      .populate('emailBodies')
      .populate('targetSegments')
      .sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching campaigns', error: error.message });
  }
});

// Create new email campaign
app.post('/email-campaigns', async (req, res) => {
  try {
    const { 
      name, 
      description, 
      emailBodies, 
      targetSegments,
      subject,
      fromName,
      fromEmail,
      replyTo
    } = req.body;

    // Get company info for default from email
    const companyInfo = await CompanyInfo.findOne();
    
    const campaign = new EmailCampaign({
      name,
      description,
      emailBodies,
      targetSegments,
      subject: subject || name,
      fromName: fromName || companyInfo?.companyName || 'Mail Marketing',
      fromEmail: fromEmail || companyInfo?.email || 'noreply@example.com',
      replyTo: replyTo || fromEmail || companyInfo?.email
    });

    await campaign.save();
    
    const populatedCampaign = await EmailCampaign.findById(campaign._id)
      .populate('emailBodies')
      .populate('targetSegments');

    res.json({ message: 'Campaign created successfully', campaign: populatedCampaign });
  } catch (error) {
    res.status(500).json({ message: 'Error creating campaign', error: error.message });
  }
});

// Prepare campaign recipients (get deduplicated emails from segments)
app.post('/email-campaigns/:id/prepare', async (req, res) => {
  try {
    const campaign = await EmailCampaign.findById(req.params.id)
      .populate('targetSegments');

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Get deduplicated emails from segments
    const segmentIds = campaign.targetSegments.map(segment => segment._id);
    
    const response = await fetch('http://localhost:3001/segments/get-emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ segmentIds })
    });
    
    const emailData = await response.json();
    
    // Prepare recipients array
    const recipients = emailData.uniqueEmails.map(email => ({
      email: email.email,
      name: email.name,
      position: email.position,
      company: email.company,
      segmentId: email.sourceSegments?.[0]?.id || '',
      segmentName: email.sourceSegments?.[0]?.name || '',
      status: 'pending'
    }));

    // Update campaign with recipients
    await EmailCampaign.findByIdAndUpdate(req.params.id, {
      recipients,
      totalRecipients: recipients.length,
      duplicatesRemoved: emailData.duplicatesRemoved || 0,
      updatedAt: new Date()
    });

    res.json({ 
      message: 'Campaign prepared successfully',
      totalRecipients: recipients.length,
      duplicatesRemoved: emailData.duplicatesRemoved || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error preparing campaign', error: error.message });
  }
});

// Send campaign
app.post('/email-campaigns/:id/send', async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    const result = await EmailService.sendCampaign(req.params.id, baseUrl);
    
    res.json({ 
      message: 'Campaign sent successfully',
      ...result
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending campaign', error: error.message });
  }
});

// Send campaign emails
app.post('/send-campaign', async (req, res) => {
  try {
    const { campaign } = req.body;
    
    console.log('📧 Received campaign send request:', campaign.name);
    
    if (!campaign || !campaign.recipients || campaign.recipients.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid campaign data - no recipients found' 
      });
    }

    if (!campaign.emailBodies || campaign.emailBodies.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid campaign data - no email bodies found' 
      });
    }

    // Send the campaign
    const results = await EmailService.sendCampaignEmails(campaign);
    
    res.json({
      success: true,
      message: `Campaign "${campaign.name}" sent successfully!`,
      data: results
    });
    
  } catch (error) {
    console.error('❌ Campaign send error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to send campaign', 
      message: error.message 
    });
  }
});

// Test email endpoint for demonstrations
app.post('/send-test-email', async (req, res) => {
  try {
    const { email, subject } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false,
        error: 'Email address required' 
      });
    }
    
    const result = await EmailService.sendTestEmail(email, subject);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully!',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send test email',
        message: result.error
      });
    }
    
  } catch (error) {
    console.error('❌ Test email error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error', 
      message: error.message 
    });
  }
});

// Get email service status
app.get('/email-service-status', (req, res) => {
  res.json({
    success: true,
    status: 'Email service ready',
    features: [
      'Campaign email sending',
      'Contact personalization', 
      'Segment-based targeting',
      'Delivery tracking',
      'Test email functionality'
    ]
  });
});

// Add this route to get real analytics data

app.get('/analytics', async (req, res) => {
  try {
    const contacts = await Contact.find();
    const segments = await Segment.find();
    const campaigns = await Campaign.find(); // NOW FROM DATABASE!
    
    const emailStats = {
      totalContacts: contacts.length,
      totalSegments: segments.length, 
      totalCampaigns: campaigns.length,
      emailsSent: campaigns.reduce((total, campaign) => total + (campaign.sentCount || 0), 0),
      
      // Real contact growth over time
      contactGrowth: calculateContactGrowth(contacts),
      
      // Real segment distribution
      segmentDistribution: calculateSegmentDistribution(segments, contacts),
      
      // Recent activity from actual data
      recentActivity: getRecentActivity(contacts, segments, campaigns)
    };
    
    res.json({
      success: true,
      data: emailStats
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics'
    });
  }
});

// Helper functions for real calculations
function calculateContactGrowth(contacts) {
  const monthlyGrowth = {};
  const now = new Date();
  
  // Group contacts by month they were added
  contacts.forEach(contact => {
    const createdDate = contact.createdAt || contact.dateAdded || now;
    const monthKey = `${createdDate.getFullYear()}-${createdDate.getMonth()}`;
    monthlyGrowth[monthKey] = (monthlyGrowth[monthKey] || 0) + 1;
  });
  
  // Convert to array format for charts
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    last6Months.push({
      month: date.toLocaleDateString('en', { month: 'short' }),
      count: monthlyGrowth[monthKey] || 0
    });
  }
  
  return last6Months;
}

function calculateSegmentDistribution(segments, contacts) {
  return segments.map(segment => ({
    name: segment.name,
    contactCount: segment.contacts ? segment.contacts.length : 0,
    percentage: contacts.length > 0 ? 
      Math.round(((segment.contacts?.length || 0) / contacts.length) * 100) : 0
  }));
}

function getRecentActivity(contacts, segments, campaigns) {
  const activities = [];
  
  // Recent contacts added
  const recentContacts = contacts
    .sort((a, b) => new Date(b.createdAt || b.dateAdded) - new Date(a.createdAt || a.dateAdded))
    .slice(0, 3);
    
  recentContacts.forEach(contact => {
    activities.push({
      type: 'contact_added',
      description: `New contact: ${contact.name || contact.email}`,
      timestamp: contact.createdAt || contact.dateAdded || new Date(),
      icon: '👤'
    });
  });
  
  // Recent segments created
  const recentSegments = segments
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 2);
    
  recentSegments.forEach(segment => {
    activities.push({
      type: 'segment_created',
      description: `New segment: ${segment.name}`,
      timestamp: segment.createdAt || new Date(),
      icon: '🎯'
    });
  });
  
  return activities
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

