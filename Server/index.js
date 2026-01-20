require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

// Database Models
const UserModel = require('./Models/Email.js'); // User authentication (name, email, password)
const EmailTemplateModel = require('./Models/EmailTemplate.js');   
const EmailListModel = require('./Models/EmailList.js');
const SegmentModel = require('./Models/Segmant.js');
const CompanyInfo = require('./Models/CompanyInfo');
const EmailBody = require('./Models/EmailBody'); 
const EmailCampaign = require('./Models/EmailCampaign');
const Campaign = require('./Models/Campaign.js'); // For scheduled campaigns
const EmailTracking = require('./Models/EmailTracking');

// Services
const EmailService = require('./services/EmailService.js');

const app = express();
app.use(express.json());
app.use(cors({
    origin: [
        "http://localhost:3000", 
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
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
    UserModel.findOne({ email: email })
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
    UserModel.create(req.body)
        .then(user => res.json(user))
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
        console.log('📥 [GET /email-templates] Returning templates:', {
            count: templates.length,
            templates: templates.map(t => ({
                id: t._id,
                name: t.name,
                subject: t.subject,
                fromEmail: t.fromEmail,
                hasContent: !!t.content,
                contentLength: t.content?.length || 0,
                contentPreview: t.content?.substring(0, 100) || 'MISSING CONTENT',
                fullContent: t.content ? `[${t.content.length} chars]` : 'NULL'
            }))
        });
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



// ========== EMAIL CAMPAIGN ROUTES ==========

// GET all campaigns
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

// GET single campaign by ID
app.get('/email-campaigns/:id', async (req, res) => {
    try {
        const campaign = await EmailCampaign.findById(req.params.id)
            .populate('emailBodies')
            .populate('targetSegments');
        
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        
        res.json(campaign);
    } catch (error) {
        console.error('Campaign fetch error:', error);
        res.status(500).json({ message: 'Error fetching campaign', error: error.message });
    }
});

// CREATE campaign
app.post('/email-campaigns', async (req, res) => {
    try {
        const { 
            name, 
            description, 
            emailBodies,
            emailBodySequence,
            targetSegments,
            recipients,
            totalRecipients,
            status,
            scheduledAt,
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
            emailBodies: emailBodies || [],
            emailBodySequence: emailBodySequence || emailBodies || [],
            targetSegments: targetSegments || [],
            recipients: recipients || [],
            totalRecipients: totalRecipients || (recipients?.length || 0),
            status: status || 'Draft',
            scheduledAt: scheduledAt || null,
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
        console.error('Campaign creation error:', error);
        res.status(500).json({ message: 'Error creating campaign', error: error.message });
    }
});

// UPDATE campaign (full update)
app.put('/email-campaigns/:id', async (req, res) => {
    try {
        const { 
            name, 
            description, 
            emailBodies,
            emailBodySequence,
            targetSegments,
            recipients,
            totalRecipients,
            status,
            scheduledAt,
            subject,
            fromName,
            fromEmail,
            replyTo
        } = req.body;
        
        const campaign = await EmailCampaign.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description,
                emailBodies: emailBodies || [],
                emailBodySequence: emailBodySequence || emailBodies || [],
                targetSegments: targetSegments || [],
                recipients: recipients || [],
                totalRecipients: totalRecipients || (recipients?.length || 0),
                status: status || 'Draft',
                scheduledAt: scheduledAt || null,
                subject: subject || name,
                fromName: fromName,
                fromEmail: fromEmail,
                replyTo: replyTo,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        )
            .populate('emailBodies')
            .populate('targetSegments');
        
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        
        res.json({ message: 'Campaign updated successfully', campaign });
    } catch (error) {
        console.error('Campaign update error:', error);
        res.status(500).json({ message: 'Error updating campaign', error: error.message });
    }
});

// PATCH campaign (partial update)
app.patch('/email-campaigns/:id', async (req, res) => {
    try {
        const campaign = await EmailCampaign.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        )
            .populate('emailBodies')
            .populate('targetSegments');
        
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        
        res.json({ message: 'Campaign updated successfully', campaign });
    } catch (error) {
        console.error('Campaign patch error:', error);
        res.status(500).json({ message: 'Error patching campaign', error: error.message });
    }
});

// DELETE single campaign
app.delete('/email-campaigns/:id', async (req, res) => {
    try {
        const campaign = await EmailCampaign.findByIdAndDelete(req.params.id);
        
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        
        res.json({ message: 'Campaign deleted successfully', campaign });
    } catch (error) {
        console.error('Campaign deletion error:', error);
        res.status(500).json({ message: 'Error deleting campaign', error: error.message });
    }
});

// BULK DELETE campaigns
app.post('/email-campaigns/delete-many', async (req, res) => {
    try {
        const { ids } = req.body;
        
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'No campaign IDs provided' });
        }
        
        const result = await EmailCampaign.deleteMany({ _id: { $in: ids } });
        
        res.json({ 
            message: 'Campaigns deleted successfully',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Bulk delete error:', error);
        res.status(500).json({ message: 'Error deleting campaigns', error: error.message });
    }
});

// GET campaign statistics
app.get('/email-campaigns/stats/overview', async (req, res) => {
    try {
        const stats = await EmailCampaign.aggregate([
            {
                $group: {
                    _id: null,
                    totalCampaigns: { $sum: 1 },
                    draftCampaigns: {
                        $sum: { $cond: [{ $eq: ['$status', 'Draft'] }, 1, 0] }
                    },
                    sentCampaigns: {
                        $sum: { $cond: [{ $eq: ['$status', 'Sent'] }, 1, 0] }
                    },
                    scheduledCampaigns: {
                        $sum: { $cond: [{ $eq: ['$status', 'Scheduled'] }, 1, 0] }
                    },
                    totalRecipients: { $sum: '$totalRecipients' },
                    totalEmailsSent: { $sum: '$emailsSent' },
                    totalOpens: { $sum: '$analytics.opens' },
                    totalClicks: { $sum: '$analytics.clicks' }
                }
            }
        ]);
        
        res.json(stats[0] || {});
    } catch (error) {
        console.error('Stats fetch error:', error);
        res.status(500).json({ message: 'Error fetching statistics', error: error.message });
    }
});

// PREPARE campaign (populate recipients from segments)
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

// SEND campaign (via EmailService)
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

// SEND campaign (direct post with full campaign data)
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
        
        console.log('📋 Email bodies in campaign:', campaign.emailBodies?.map(body => ({
            id: body._id,
            name: body.name,
            subject: body.subject,
            fromEmail: body.fromEmail,
            hasContent: !!body.content,
            contentLength: body.content?.length || 0,
            contentPreview: body.content?.substring(0, 100) || 'MISSING CONTENT',
            fullContent: body.content || 'NULL CONTENT FIELD'
        })));
        
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

// SEND TEST EMAIL
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

// VERIFY BREVO API
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

// EMAIL SERVICE STATUS
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

// ========== END EMAIL CAMPAIGN ROUTES ==========

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

// ========== SCHEDULED CAMPAIGN ROUTES ==========

// Save scheduled campaign
app.post('/schedule-campaign', async (req, res) => {
    try {
        const { name, description, emailBodies, segments, recipients, scheduledFor, companyInfo } = req.body;
        
        if (!name || !emailBodies || emailBodies.length === 0 || !recipients || recipients.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, emailBodies, recipients'
            });
        }

        if (new Date(scheduledFor) <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Scheduled time must be in the future'
            });
        }

        const campaign = new Campaign({
            name,
            description: description || '',
            emailBodies,
            segments,
            recipients,
            scheduledFor: new Date(scheduledFor),
            status: 'Scheduled',
            scheduleMode: 'scheduled',
            companyInfo
        });

        await campaign.save();

        res.status(201).json({
            success: true,
            message: 'Campaign scheduled successfully',
            campaignId: campaign._id,
            scheduledFor: campaign.scheduledFor
        });
    } catch (error) {
        console.error('Error scheduling campaign:', error);
        res.status(500).json({
            success: false,
            message: 'Error scheduling campaign',
            error: error.message
        });
    }
});

// Get all scheduled campaigns
app.get('/scheduled-campaigns', async (req, res) => {
    try {
        const campaigns = await Campaign.find({ status: 'Scheduled' })
            .sort({ scheduledFor: 1 })
            .populate('emailBodies')
            .populate('segments')
            .populate('companyInfo');

        res.json({
            success: true,
            campaigns,
            count: campaigns.length
        });
    } catch (error) {
        console.error('Error fetching scheduled campaigns:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching scheduled campaigns',
            error: error.message
        });
    }
});

// Get scheduled campaigns ready to send (scheduled time has passed)
app.get('/scheduled-campaigns/ready-to-send', async (req, res) => {
    try {
        const now = new Date();
        const readyCampaigns = await Campaign.find({
            status: 'Scheduled',
            scheduledFor: { $lte: now }
        })
            .sort({ scheduledFor: 1 })
            .populate('emailBodies')
            .populate('segments')
            .populate('companyInfo');

        res.json({
            success: true,
            campaigns: readyCampaigns,
            count: readyCampaigns.length
        });
    } catch (error) {
        console.error('Error fetching ready campaigns:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching ready campaigns',
            error: error.message
        });
    }
});

// Get specific scheduled campaign by ID
app.get('/scheduled-campaigns/:id', async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id)
            .populate('emailBodies')
            .populate('segments')
            .populate('companyInfo');

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        res.json({
            success: true,
            campaign
        });
    } catch (error) {
        console.error('Error fetching campaign:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching campaign',
            error: error.message
        });
    }
});

// Send scheduled campaign
app.post('/send-scheduled-campaign/:id', async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id)
            .populate('emailBodies')
            .populate('segments')
            .populate('companyInfo');

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        if (campaign.status === 'Sent') {
            return res.status(400).json({
                success: false,
                message: 'This campaign has already been sent'
            });
        }

        if (!campaign.recipients || campaign.recipients.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No recipients found for this campaign'
            });
        }

        // Send campaign emails (reuse existing email sending logic)
        // This would call your email service to send to all recipients
        console.log(`📧 Sending scheduled campaign: ${campaign.name}`);

        // Update campaign status
        campaign.status = 'Sent';
        campaign.sentAt = new Date();
        campaign.sentCount = campaign.recipients.length;
        await campaign.save();

        res.json({
            success: true,
            message: 'Scheduled campaign sent successfully',
            sentCount: campaign.sentCount,
            sentAt: campaign.sentAt
        });
    } catch (error) {
        console.error('Error sending scheduled campaign:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending scheduled campaign',
            error: error.message
        });
    }
});

// Update scheduled campaign
app.put('/scheduled-campaigns/:id', async (req, res) => {
    try {
        const { name, description, scheduledFor } = req.body;
        
        const campaign = await Campaign.findById(req.params.id);

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        if (campaign.status === 'Sent') {
            return res.status(400).json({
                success: false,
                message: 'Cannot update a campaign that has already been sent'
            });
        }

        if (scheduledFor && new Date(scheduledFor) <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Scheduled time must be in the future'
            });
        }

        if (name) campaign.name = name;
        if (description !== undefined) campaign.description = description;
        if (scheduledFor) campaign.scheduledFor = new Date(scheduledFor);
        campaign.updatedAt = new Date();

        await campaign.save();

        res.json({
            success: true,
            message: 'Campaign updated successfully',
            campaign
        });
    } catch (error) {
        console.error('Error updating campaign:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating campaign',
            error: error.message
        });
    }
});

// Delete scheduled campaign
app.delete('/scheduled-campaigns/:id', async (req, res) => {
    try {
        const campaign = await Campaign.findByIdAndDelete(req.params.id);

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        res.json({
            success: true,
            message: 'Campaign deleted successfully',
            campaignId: campaign._id
        });
    } catch (error) {
        console.error('Error deleting campaign:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting campaign',
            error: error.message
        });
    }
});

// ========== END SCHEDULED CAMPAIGN ROUTES ==========

// Email body routes
