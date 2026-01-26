# Email Marketing Platform - Server

## PROGRAM STRUCTURE

Server/
  Models/
    Email.js
    EmailTemplate.js
    EmailBody.js
    EmailList.js
    Segmant.js
    CompanyInfo.js
    EmailCampaign.js
    Campaign.js
    EmailTracking.js
  Services/
    EmailService.js
  config/
  uploads/
  .env
  .env.example
  .gitignore
  index.js
  package.json
  package-lock.json
  check-data.js
  checkDB.js
  test-brevo-api.js
  test-brevo-http.js
  test-brevo.js
  testFlow.js
  README.md

## SETUP

1. Navigate to Server directory
2. Install dependencies: npm install
3. Configure .env file with required variables
4. Start server: node index.js
5. Server runs on http://localhost:3001

## REQUIREMENTS

Node.js 16 or higher
npm 8 or higher
MongoDB (local or cloud instance)

## ENVIRONMENT VARIABLES

MONGODB_URI - MongoDB connection string
JWT_SECRET - JWT token secret key
PORT - Server port (default 3001)
BREVO_API_KEY - Email service API key
BREVO_EMAIL - Sender email address
GROQ_API_KEY - AI generation API key

## DATABASE

MongoDB collections:
- Users - User authentication
- EmailTemplates - Email templates
- EmailBodies - Email content
- EmailLists - Contact lists
- Segments - Audience segments
- CompanyInfo - Company settings
- EmailCampaigns - Campaign records
- EmailTracking - Delivery tracking

## ROUTES

Authentication
POST /login - User login
POST /signup - User registration

Email Management
GET /email-templates - Get all templates
POST /email-templates - Create template
PUT /email-templates/:id - Update template
DELETE /email-templates/:id - Delete template

Contacts
GET /email-list - Get all contacts
POST /add-email - Add contact
DELETE /email-list/:id - Delete contact
PUT /email-list/:id - Update contact

Segments
GET /segments - Get all segments
POST /segments - Create segment
PUT /segments/:id - Update segment
DELETE /segments/:id - Delete segment

Campaigns
GET /email-campaigns - Get all campaigns
POST /email-campaigns - Create campaign
POST /send-campaign - Send campaign
GET /analytics - Get analytics data

Company
GET /company-info - Get company settings
PUT /company-info - Update company settings
POST /company-info/logo - Upload logo

AI Generation
POST /ai-generate-email - Generate email with AI

## MODELS

User - name, email, password
EmailTemplate - name, subject, content, fromName, fromEmail
EmailBody - name, subject, content, tags, attachments
Segment - name, description, contacts
Campaign - name, emailBodies, targetSegments, recipients, status

## SERVICES

EmailService - Handles campaign sending and delivery
Campaign Scheduler - Auto-sends scheduled campaigns every minute

## NOTES

Mailhog runs on http://localhost:8025 for email testing
All email operations logged to console
Scheduled campaigns checked every minute
Database must be accessible before starting server
