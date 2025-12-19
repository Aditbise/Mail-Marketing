require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
<<<<<<< HEAD
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
=======
const path = require('path');
const fs = require('fs');
require('dotenv').config(); // Load environment variables from .env
>>>>>>> 416159759af96fd6470c8fb1dd31e6faa0577531

const EmployeeModel = require('./Models/Email.js');
const EmailListModel = require('./Models/EmailList.js');
const EmailTemplateModel = require('./Models/EmailTemplate.js');   
const SegmentModel = require('./Models/Segmant.js');
const CompanyInfo = require('./Models/CompanyInfo');
<<<<<<< HEAD
const EmailBody = require('./Models/EmailBody'); 
const EmailCampaign = require('./Models/EmailCampaign');
const EmailTracking = require('./Models/EmailTracking');
const EmailService = require('./services/EmailService.js');
=======
const EmailBody = require('./Models/EmailBody');
const Campaign = require('./Models/Campaign.js');
const emailService = require('./services/emailService'); // Initialize email service
>>>>>>> 416159759af96fd6470c8fb1dd31e6faa0577531

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
                // Return user data instead of just "Success"
                res.json({
                    success: true,
                    message: "Login successful",
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email
                    }
                });
            } else {
                res.json({
                    success: false,
                    message: "Incorrect Password"
                });
            }
        } else {
            res.json({
                success: false,
                message: "User does not exist please register :D"
            });
        }
    })
    .catch(err => res.status(500).json({ message: 'Login error', error: err }));
});

// Get user profile by ID
app.get('/user/:id', async (req, res) => {
    try {
        const user = await EmployeeModel.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            id: user._id,
            name: user.name,
            email: user.email
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user profile', error });
    }
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

// Email list routes
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

// Segment routes
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

// Email template routes
// Create a new email template
app.post('/email-templates', async (req, res) => {
    try {
        const { name, subject, fromName, fromEmail, content, signature, layout, preview, heroImage, description, category, tags, replyTo, isDefault } = req.body;
        
        // Validate required fields
        if (!name || !subject || !fromName || !fromEmail || !content) {
            return res.status(400).json({ message: 'Missing required fields: name, subject, fromName, fromEmail, content' });
        }
        
        const template = await EmailTemplateModel.create({
            name,
            subject,
            fromName,
            fromEmail,
            content,
            signature: signature || '',
            layout: layout || 'modern',
            preview: preview || '',
            heroImage: heroImage || null,
            description: description || '',
            category: category || 'promotional',
            tags: tags || [],
            replyTo: replyTo || '',
            isDefault: isDefault || false
        });
        
        res.status(201).json({ 
            message: 'Template created successfully', 
            template 
        });
    } catch (err) {
        res.status(500).json({ message: 'Error creating template', error: err.message });
    }
});

// Get all email templates
app.get('/email-templates', async (req, res) => {
    try {
        const templates = await EmailTemplateModel.find().sort({ createdAt: -1 });
        res.json(templates);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching templates', error: error.message });
    }
});

// Get a single email template by ID
app.get('/email-templates/:id', async (req, res) => {
    try {
        const template = await EmailTemplateModel.findById(req.params.id);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }
        res.json(template);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching template', error: error.message });
    }
});

// Update an email template
app.put('/email-templates/:id', async (req, res) => {
    try {
        const { name, subject, fromName, content, signature, layout, preview, heroImage, description, isDefault } = req.body;
        
        const template = await EmailTemplateModel.findByIdAndUpdate(
            req.params.id,
            {
                name,
                subject,
                fromName,
                content,
                signature: signature || '',
                layout: layout || 'modern',
                preview: preview || '',
                heroImage: heroImage || null,
                description: description || '',
                isDefault: isDefault || false,
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        );
        
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }
        
        res.json({ 
            message: 'Template updated successfully', 
            template 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating template', error: error.message });
    }
});

// Delete an email template
app.delete('/email-templates/:id', async (req, res) => {
    try {
        const template = await EmailTemplateModel.findByIdAndDelete(req.params.id);
        
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }
        
        res.json({ message: 'Template deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting template', error: error.message });
    }
});



// Email campaign routes
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

app.post('/send-campaign', async (req, res) => {
    try {
        const { campaign } = req.body;
        
        console.log('📧 Received campaign send request:', campaign.name);
        console.log('Campaign structure:', {
            name: campaign.name,
            recipientsCount: campaign.recipients?.length || 0,
            emailBodiesCount: campaign.emailBodies?.length || 0,
            segmentsCount: campaign.segments?.length || 0
        });
        
        if (!campaign || !campaign.recipients || campaign.recipients.length === 0) {
            console.log('❌ No recipients found');
            return res.status(400).json({ 
                success: false,
                error: 'Invalid campaign data - no recipients found',
                debug: {
                    campaign: !!campaign,
                    recipients: campaign?.recipients || [],
                    recipientsLength: campaign?.recipients?.length || 0
                }
            });
        }
        
        if (!campaign.emailBodies || campaign.emailBodies.length === 0) {
            console.log('❌ No email bodies found');
            return res.status(400).json({ 
                success: false,
                error: 'Invalid campaign data - no email bodies found',
                debug: {
                    emailBodies: campaign?.emailBodies || [],
                    emailBodiesLength: campaign?.emailBodies?.length || 0
                }
            });
        }
        
        console.log('✅ Campaign validation passed, sending emails...');
        
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
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

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
            error: 'Test email sending failed',
            message: error.message 
        });
    }
});

app.get('/verify-brevo-api', async (req, res) => {
    try {
        const apiKey = process.env.BREVO_API_KEY;
        const brevoEmail = process.env.BREVO_EMAIL;
        
        if (!apiKey) {
            return res.status(400).json({
                success: false,
                error: 'BREVO_API_KEY not found in environment variables'
            });
        }
        
        if (!brevoEmail) {
            return res.status(400).json({
                success: false,
                error: 'BREVO_EMAIL not found in environment variables'
            });
        }
        
        console.log('🔍 Verifying Brevo API configuration...');
        console.log(`API Key (masked): ${apiKey.substring(0, 20)}...`);
        console.log(`Brevo Email: ${brevoEmail}`);
        
        res.json({
            success: true,
            message: 'Brevo API configuration found',
            configured: {
                apiKeyPresent: !!apiKey,
                brevoEmailPresent: !!brevoEmail,
                apiKeyLength: apiKey.length,
                brevoEmail: brevoEmail
            }
        });
    } catch (error) {
        console.error('❌ Brevo API verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify Brevo API',
            message: error.message
        });
    }
});

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

// Analytics route
app.get('/analytics', async (req, res) => {
    try {
        const contacts = await EmailListModel.find();
        const segments = await SegmentModel.find();
        const campaigns = await EmailCampaign.find();
        
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





// Company info routes
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

<<<<<<< HEAD
// Email body routes
=======
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

// ===== CAMPAIGN ROUTES =====

// CREATE - Create new campaign
app.post('/campaigns', async (req, res) => {
    try {
        const { 
            name, 
            description, 
            emailBodies, 
            createdBy,
            scheduledAt 
        } = req.body;
        
        if (!name || !emailBodies || emailBodies.length === 0) {
            return res.status(400).json({ 
                message: 'Campaign name and at least one email body are required' 
            });
        }

        // Validate email bodies exist
        const emailBodyIds = emailBodies.map(body => body.emailBodyId || body._id);
        const existingBodies = await EmailBody.find({ _id: { $in: emailBodyIds } });
        
        if (existingBodies.length !== emailBodyIds.length) {
            return res.status(400).json({ 
                message: 'One or more email bodies not found' 
            });
        }

        // Format email bodies for storage
        const formattedEmailBodies = emailBodies.map(body => ({
            emailBodyId: body.emailBodyId || body._id,
            name: body.Name || body.name,
            bodyContent: body.bodyContent
        }));

        const campaign = new Campaign({
            name: name.trim(),
            description: description ? description.trim() : '',
            emailBodies: formattedEmailBodies,
            createdBy: createdBy || 'system',
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
            status: scheduledAt ? 'Scheduled' : 'Draft'
        });

        await campaign.save();
        
        res.status(201).json({ 
            message: 'Campaign created successfully', 
            campaign 
        });
    } catch (error) {
        console.error('Error creating campaign:', error);
        res.status(500).json({ 
            message: 'Error creating campaign', 
            error: error.message 
        });
    }
});

// READ - Get all campaigns
app.get('/campaigns', async (req, res) => {
    try {
        const campaigns = await Campaign.find()
            .populate('emailBodies.emailBodyId', 'Name bodyContent')
            .sort({ createdAt: -1 });
        
        res.json(campaigns);
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        res.status(500).json({ 
            message: 'Error fetching campaigns', 
            error: error.message 
        });
    }
});

// READ - Get single campaign
app.get('/campaigns/:id', async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id)
            .populate('emailBodies.emailBodyId', 'Name bodyContent')
            .populate('sentTo.recipientId', 'name email company position');
        
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        
        res.json(campaign);
    } catch (error) {
        console.error('Error fetching campaign:', error);
        res.status(500).json({ 
            message: 'Error fetching campaign', 
            error: error.message 
        });
    }
});

// UPDATE - Update campaign
app.put('/campaigns/:id', async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        // Prevent editing sent campaigns
        if (campaign.status === 'Sent') {
            return res.status(400).json({ 
                message: 'Cannot edit a campaign that has already been sent' 
            });
        }

        const updateData = { ...req.body };
        
        // If email bodies are being updated, validate them
        if (updateData.emailBodies) {
            const emailBodyIds = updateData.emailBodies.map(body => body.emailBodyId || body._id);
            const existingBodies = await EmailBody.find({ _id: { $in: emailBodyIds } });
            
            if (existingBodies.length !== emailBodyIds.length) {
                return res.status(400).json({ 
                    message: 'One or more email bodies not found' 
                });
            }

            updateData.emailBodies = updateData.emailBodies.map(body => ({
                emailBodyId: body.emailBodyId || body._id,
                name: body.Name || body.name,
                bodyContent: body.bodyContent
            }));
        }

        const updatedCampaign = await Campaign.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('emailBodies.emailBodyId', 'Name bodyContent');

        res.json({ 
            message: 'Campaign updated successfully', 
            campaign: updatedCampaign 
        });
    } catch (error) {
        console.error('Error updating campaign:', error);
        res.status(500).json({ 
            message: 'Error updating campaign', 
            error: error.message 
        });
    }
});

// SEND - Send campaign to selected recipients
app.post('/campaigns/:id/send', async (req, res) => {
    try {
        const { recipients } = req.body; // Array of recipient objects
        
        console.log('=== CAMPAIGN SEND REQUEST ===');
        console.log('Campaign ID:', req.params.id);
        console.log('Recipients received:', recipients?.length || 0);
        console.log('Recipients data:', recipients);
        
        if (!recipients || recipients.length === 0) {
            return res.status(400).json({ 
                message: 'At least one recipient is required' 
            });
        }

        const campaign = await Campaign.findById(req.params.id);
        console.log('Campaign found:', campaign ? campaign.name : 'Not found');
        
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        if (campaign.status === 'Sent') {
            return res.status(400).json({ 
                message: 'Campaign has already been sent' 
            });
        }

        // Validate recipients exist in email list
        const recipientIds = recipients.map(r => r._id || r.recipientId);
        console.log('Recipient IDs to validate:', recipientIds);
        
        const existingRecipients = await EmailListModel.find({ 
            _id: { $in: recipientIds } 
        });
        console.log('Found recipients in database:', existingRecipients.length);

        if (existingRecipients.length !== recipientIds.length) {
            console.log('Recipient validation failed. Expected:', recipientIds.length, 'Found:', existingRecipients.length);
            return res.status(400).json({ 
                message: 'One or more recipients not found in email list' 
            });
        }

        // Format recipients for storage
        const formattedRecipients = existingRecipients.map(recipient => ({
            recipientId: recipient._id,
            name: recipient.name,
            email: recipient.email,
            company: recipient.company || '',
            position: recipient.position || '',
            sentAt: new Date()
        }));

        // SEND REAL EMAILS using Gmail SMTP
        console.log(`\n=== SENDING REAL EMAILS VIA GMAIL ===`);
        
        try {
            const emailResults = await emailService.sendCampaignToMultipleRecipients(
                formattedRecipients, 
                campaign
            );
            
            // Update campaign with email results
            campaign.status = 'Sent';
            campaign.sentAt = new Date();
            campaign.sentTo = formattedRecipients;
            campaign.sentCount = formattedRecipients.length;
            campaign.campaignMetrics.totalSent = formattedRecipients.length;
            campaign.campaignMetrics.delivered = emailResults.summary.successful;
            campaign.campaignMetrics.bounced = emailResults.summary.failed;
            
            await campaign.save();
            
            console.log(`\n📧 REAL EMAIL SENDING COMPLETED:`);
            console.log(`✅ Successfully sent: ${emailResults.summary.successful} emails`);
            console.log(`❌ Failed to send: ${emailResults.summary.failed} emails`);
            
            const responseMessage = `Campaign sent! Successfully delivered ${emailResults.summary.successful} of ${formattedRecipients.length} emails`;
            
            res.json({ 
                message: responseMessage,
                campaign,
                sentTo: formattedRecipients,
                emailResults: emailResults
            });
            
        } catch (emailError) {
            console.error('❌ Email sending failed:', emailError.message);
            console.log('⚠️  Campaign NOT marked as sent due to email error');
            
            return res.status(500).json({ 
                message: 'Failed to send emails: ' + emailError.message,
                error: emailError.message
            });
        }
    } catch (error) {
        console.error('Error sending campaign:', error);
        res.status(500).json({ 
            message: 'Error sending campaign', 
            error: error.message 
        });
    }
});

// RESET - Reset campaign to draft status (for testing/resending)
app.put('/campaigns/:id/reset', async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        // Reset campaign status and clear sent data
        campaign.status = 'Draft';
        campaign.sentAt = null;
        campaign.sentTo = [];
        campaign.sentCount = 0;
        campaign.campaignMetrics.totalSent = 0;
        campaign.campaignMetrics.delivered = 0;
        campaign.campaignMetrics.opened = 0;
        campaign.campaignMetrics.clicked = 0;
        campaign.campaignMetrics.bounced = 0;

        await campaign.save();

        console.log(`Campaign "${campaign.name}" reset to draft status`);

        res.json({ 
            message: `Campaign "${campaign.name}" reset to draft status`,
            campaign
        });
    } catch (error) {
        console.error('Error resetting campaign:', error);
        res.status(500).json({ 
            message: 'Error resetting campaign', 
            error: error.message 
        });
    }
});

// DELETE - Delete campaign
app.delete('/campaigns/:id', async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        // Allow deletion but warn if campaign was sent
        if (campaign.status === 'Sent') {
            console.log(`⚠️ Deleting sent campaign: "${campaign.name}"`);
        }

        await Campaign.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
        console.error('Error deleting campaign:', error);
        res.status(500).json({ 
            message: 'Error deleting campaign', 
            error: error.message 
        });
    }
});

// GET campaign statistics
app.get('/campaigns/:id/stats', async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        const stats = {
            campaignName: campaign.name,
            status: campaign.status,
            createdAt: campaign.createdAt,
            sentAt: campaign.sentAt,
            emailBodiesCount: campaign.emailBodies.length,
            recipientsCount: campaign.sentCount,
            metrics: campaign.campaignMetrics
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching campaign stats:', error);
        res.status(500).json({ 
            message: 'Error fetching campaign statistics', 
            error: error.message 
        });
    }
});

// GET campaigns by status
app.get('/campaigns/status/:status', async (req, res) => {
    try {
        const { status } = req.params;
        const validStatuses = ['Draft', 'Sent', 'Scheduled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid status. Valid options: Draft, Sent, Scheduled' 
            });
        }

        const campaigns = await Campaign.find({ status })
            .populate('emailBodies.emailBodyId', 'Name bodyContent')
            .sort({ createdAt: -1 });
        
        res.json(campaigns);
    } catch (error) {
        console.error('Error fetching campaigns by status:', error);
        res.status(500).json({ 
            message: 'Error fetching campaigns', 
            error: error.message 
        });
    }
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});

>>>>>>> 416159759af96fd6470c8fb1dd31e6faa0577531
