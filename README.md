# Mail Marketing - Email Marketing Platform

A full-stack email marketing platform with a modern React (Vite) dashboard and a Node.js/Express backend for managing contacts, segments, templates, and campaigns with analytics, scheduling, and AI-powered email generation.

## 🎯 Project Overview

Mail Marketing is a comprehensive email marketing solution designed for managing email campaigns at scale. It includes contact segmentation, email template management, campaign scheduling, AI-assisted email generation, and detailed analytics tracking.

---

## 📊 Language Composition

| Language | Bytes | Percentage |
|----------|-------|------------|
| **JavaScript** | 406,919 | **61.2%** |
| **CSS** | 36,660 | **5.5%** |
| **TeX** | 37,881 | **5.7%** |
| **HTML** | 4,107 | **0.6%** |
| **Shell** | 303 | **0.05%** |
| **Batchfile** | 308 | **0.05%** |

---

## 🛠️ Technology Stack

### Frontend
- **React 19.1.0** – UI framework with hooks
- **Vite 6.3.5** – Build tool with HMR
- **Tailwind CSS 4.1.14** – Utility-first styling with dark mode
- **React Router DOM 7.6.3** – Client-side routing
- **Axios 1.10.0** – HTTP client for API communication
- **Lucide React 0.563.0** – Icon library
- **React Email Editor 1.7.11** – Rich email template editor
- **React Icons 5.5.0** – Additional icon set
- **@dnd-kit** – Drag-and-drop utilities for UI
- **PDF.js 5.4.149** – PDF handling
- **XLSX 0.18.5** – Excel file parsing for bulk imports
- **ESLint 9.25.0** – Code quality and linting

### Backend
- **Node.js 16+** – Runtime environment
- **Express 5.1.0** – REST API framework
- **MongoDB + Mongoose 8.19.2** – Database and ODM
- **JWT (jsonwebtoken 9.0.2)** – Authentication tokens
- **Groq SDK 0.37.0** – AI email generation
- **Google Generative AI 0.11.5** – Alternative AI provider
- **Axios 1.13.1** – HTTP requests to external APIs
- **Bcryptjs 3.0.3** – Password hashing
- **Multer 2.0.2** – File upload handling
- **Nodemailer 7.0.10** – Email sending (SMTP)
- **Node-cron 4.2.1** – Campaign scheduling
- **UUID 13.0.0** – Unique ID generation
- **Nodemon 3.1.10** – Development server with auto-reload
- **CORS 2.8.5** – Cross-origin resource sharing
- **dotenv 17.2.3** – Environment variable management

### External Services
- **Brevo API** – Email delivery provider (previously Sendinblue)
- **Groq API** – AI email generation
- **MailHog** – Local email testing (runs on port 8025)

---

## 📁 Project Structure

```
Mail-Marketing/
├── Front end/                    - React Vite frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── App.jsx          - Main app component with routing
│   │   │   ├── Front.jsx        - Landing/home page
│   │   │   ├── Login.jsx        - User authentication
│   │   │   ├── Signup.jsx       - User registration
│   │   │   ├── Dashboard.jsx    - Analytics dashboard
│   │   │   ├── Campaigns.jsx    - Campaign management
│   │   │   ├── EmailBodyEditor.jsx    - Email template editor
│   │   │   ├── EmailLists.jsx   - Contact management
│   │   │   ├── Segments.jsx     - Audience segmentation
│   │   │   ├── CompanyInfo.jsx  - Company settings & branding
│   │   │   ├── Features.jsx     - Feature showcase
│   │   │   └── Sidebar.jsx      - Navigation sidebar
│   │   ├── index.css            - Tailwind CSS configuration
│   │   └── main.jsx             - React entry point
│   ├── public/                  - Static assets
│   ├── index.html               - HTML template
│   ├── vite.config.js           - Vite build configuration
│   ├── eslint.config.js         - Linting rules
│   ├── package.json             - Frontend dependencies
│   └── README.md                - Frontend documentation
│
├── Server/                      - Node.js Express backend
│   ├── Models/
│   │   ├── Email.js             - Email message schema
│   │   ├── EmailTemplate.js     - Email template schema
│   │   ├── EmailBody.js         - Email body content schema
│   │   ├── EmailList.js         - Contact list schema
│   │   ├── Segment.js           - Audience segment schema
│   │   ├── CompanyInfo.js       - Company profile schema
│   │   ├── EmailCampaign.js     - Campaign schema
│   │   ├── Campaign.js          - Campaign execution schema
│   │   └── EmailTracking.js     - Delivery tracking schema
│   ├── Services/
│   │   └── EmailService.js      - Email delivery and scheduling
│   ├── config/                  - Configuration files
│   ├── uploads/                 - User-uploaded files (logos, etc.)
│   ├── index.js                 - Main server file with all routes
│   ├── check-data.js            - Data verification utility
│   ├── checkDB.js               - Database connection checker
│   ├── testFlow.js              - Campaign flow tester
│   ├── test-brevo.js            - Brevo API integration tests
│   ├── test-brevo-api.js        - Brevo API endpoint tests
│   ├── test-brevo-http.js       - Brevo HTTP integration tests
│   ├── .env.example             - Environment variables template
│   ├── package.json             - Backend dependencies
│   └── README.md                - Backend documentation
│
├── Email_Marketing_Paper.tex    - Research/documentation paper
├── start-dev.sh                 - Unix/Linux development start script
├── start-dev.bat                - Windows development start script
├── .gitignore                   - Git ignore rules
└── README.md                    - This file
```

---

## ✨ Core Features

### 📧 Email Management
- **Templates** – Create and manage reusable email templates
- **Contact Lists** – Manage contacts with import/export (CSV, XLSX)
- **Email Bodies** – Rich text email content with editor
- **Email Tracking** – Track opens, clicks, and delivery status

### 🎯 Campaign Features
- **Segmentation** – Create audience segments for targeted campaigns
- **Campaign Builder** – Create campaigns with templates and recipients
- **Scheduling** – Schedule campaigns for future sending (auto-dispatch every minute)
- **Batch Sending** – Send to multiple segments simultaneously
- **Delivery Tracking** – Real-time campaign analytics

### 🤖 AI Features
- **AI Email Generation** – Generate email copy using Groq API
- **Smart Content** – Context-aware email suggestions
- **Brevo Integration** – Email delivery through professional provider

### 📊 Analytics
- **Campaign Analytics** – View campaign performance metrics
- **Delivery Reports** – Track email opens and clicks
- **Segment Performance** – Compare segment engagement

### 🏢 Company Settings
- **Logo Upload** – Upload and manage company branding
- **Profile Management** – Store company information
- **SMTP Configuration** – Custom email sending configuration

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 16+** (for both frontend and backend)
- **npm 8+** (or yarn)
- **MongoDB** (local or cloud instance – MongoDB Atlas)
- **Gmail Account** (for SMTP, or use Brevo)
- **Brevo Account** (optional, for professional email delivery)
- **Groq API Key** (for AI email generation)

### Environment Setup

#### Backend (.env file in Server/ directory)

Create `Server/.env` based on `.env.example`:

```bash
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mail-marketing

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# Server Port
PORT=3001

# Gmail SMTP (for MailHog testing)
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password

# Brevo API (for production email delivery)
BREVO_API_KEY=your-brevo-api-key
BREVO_EMAIL=your-sender-email@domain.com

# Groq API (for AI email generation)
GROQ_API_KEY=your-groq-api-key
```

#### Frontend Configuration

Frontend connects to backend at `http://localhost:3001` (configured in components via axios)

### Installation & Development

#### 1. Backend Setup

```bash
cd Server
npm install
```

Start the backend server:

```bash
npm start
# or
node index.js
```

Backend runs on: **http://localhost:3001**

MailHog testing interface: **http://localhost:8025**

#### 2. Frontend Setup

```bash
cd "Front end"
npm install
npm run dev
```

Frontend dev server runs on: **http://localhost:5173** or **http://localhost:5174**

#### 3. Quick Start (All-in-One)

Use provided scripts to start both servers:

**Windows:**
```bash
start-dev.bat
```

**Mac/Linux:**
```bash
bash start-dev.sh
```

---

## 📡 API Routes

### Authentication
- `POST /login` – User login (returns JWT token)
- `POST /signup` – User registration

### Email Templates
- `GET /email-templates` – List all email templates
- `POST /email-templates` – Create new template
- `PUT /email-templates/:id` – Update template
- `DELETE /email-templates/:id` – Delete template

### Email Management
- `GET /email-list` – List all contacts
- `POST /add-email` – Add new contact
- `DELETE /email-list/:id` – Delete contact
- `PUT /email-list/:id` – Update contact

### Segments
- `GET /segments` – List audience segments
- `POST /segments` – Create new segment
- `PUT /segments/:id` – Update segment
- `DELETE /segments/:id` – Delete segment

### Campaigns
- `GET /email-campaigns` – List all campaigns
- `POST /email-campaigns` – Create new campaign
- `POST /send-campaign` – Send campaign immediately
- `GET /analytics` – Get campaign analytics

### Company Settings
- `GET /company-info` – Get company profile
- `PUT /company-info` – Update company profile
- `POST /company-info/logo` – Upload company logo

### AI Generation
- `POST /ai-generate-email` – Generate email content using AI

---

## 🗄️ Database Collections (MongoDB)

- **users** – User accounts and authentication
- **emailtemplates** – Email template definitions
- **emailbodies** – Email content bodies
- **emaillists** – Contact lists and directories
- **segments** – Audience segmentation rules
- **companyinfos** – Company branding and settings
- **emailcampaigns** – Campaign records and metadata
- **campaigns** – Campaign execution history
- **emailtrackings** – Delivery and engagement tracking

---

## 🔧 Available Commands

### Frontend Commands (from Front end/ directory)

```bash
npm run dev           # Start development server with HMR
npm run build         # Create production build
npm run preview       # Preview production build locally
npm run lint          # Run ESLint code quality checks
```

### Backend Commands (from Server/ directory)

```bash
npm start             # Start backend with nodemon (auto-reload)
node index.js         # Run backend directly (no auto-reload)
node check-data.js    # Verify database data
node checkDB.js       # Check database connection
node testFlow.js      # Test campaign workflow
node test-brevo.js    # Test Brevo email API
```

---

## 🔐 Security Features

- **JWT Authentication** – Secure token-based authentication
- **Password Hashing** – Bcryptjs for password encryption
- **CORS Protection** – Cross-origin request validation
- **Environment Variables** – Sensitive data management
- **File Upload Security** – Multer for safe file handling

### Security Best Practices

1. Never commit `.env` files to git
2. Regenerate JWT_SECRET in production
3. Use strong MongoDB passwords
4. Rotate API keys regularly
5. Use HTTPS in production

---

## 📝 Development Workflow

### Starting Development

1. **Start MongoDB** (if local)
   ```bash
   mongod
   ```

2. **Terminal 1 - Backend**
   ```bash
   cd Server
   npm install
   npm start
   ```

3. **Terminal 2 - Frontend**
   ```bash
   cd "Front end"
   npm install
   npm run dev
   ```

4. **Login/Register** at http://localhost:5173

### Testing Email Flow

- Send test emails to MailHog: http://localhost:8025
- View sent emails in MailHog interface
- Test Brevo integration with real SMTP
- Use test utilities in Server/ directory

---

## 🧪 Testing Files

The project includes several utility scripts for testing:

- `test-brevo.js` – Brevo API connectivity test
- `test-brevo-api.js` – Brevo API endpoint tests
- `test-brevo-http.js` – HTTP integration tests
- `testFlow.js` – End-to-end campaign flow
- `check-data.js` – Database data verification
- `checkDB.js` – MongoDB connection check

Run any test file:
```bash
cd Server
node test-brevo.js
```

---

## 🎨 Frontend Architecture

- **Component-Based** – Modular React components
- **Standalone Components** – Independent, reusable components
- **React Router** – Client-side navigation
- **Axios** – Centralized API communication
- **Tailwind CSS** – Utility-first responsive design
- **Dark Mode** – Built-in dark theme support
- **Email Editor** – Rich email template editor with drag-and-drop
- **Drag & Drop** – @dnd-kit utilities for UI interactions

### Component Hierarchy

```
App (Router)
├── Front (Landing)
├── Login
├── Signup
└── Dashboard (Protected)
    ├── Sidebar (Navigation)
    ├── Campaigns
    ├── EmailLists
    ├── Segments
    ├── EmailBodyEditor
    ├── CompanyInfo
    └── Features
```

---

## 🔙 Backend Architecture

- **Monolithic Express Server** – All routes in index.js (73KB)
- **RESTful API** – Standard REST conventions
- **Mongoose ODM** – MongoDB object modeling
- **Service Layer** – EmailService for business logic
- **JWT Middleware** – Token validation
- **Error Handling** – Centralized error management
- **CORS Enabled** – Frontend/backend communication
- **Campaign Scheduler** – Node-cron for automated sending

### Architecture Layers

```
HTTP Requests
    ↓
CORS Middleware
    ↓
JWT Authentication
    ↓
Express Routes
    ↓
Service Layer (EmailService)
    ↓
Mongoose Models
    ↓
MongoDB Database
```

---

## 📦 Dependency Highlights

### Frontend Key Dependencies
- **React 19.1.0** – Latest React with concurrent features
- **Vite 6.3.5** – Ultra-fast build tool
- **Tailwind CSS 4.1.14** – Latest Tailwind with performance improvements
- **React Router 7.6.3** – Latest routing with lazy loading
- **React Email Editor 1.7.11** – Professional email template builder
- **@dnd-kit 6.3.1+** – Modern drag-and-drop library

### Backend Key Dependencies
- **Express 5.1.0** – Latest Express version
- **Mongoose 8.19.2** – Latest MongoDB ODM
- **Groq SDK 0.37.0** – AI email generation
- **Nodemailer 7.0.10** – Email sending via SMTP
- **Node-cron 4.2.1** – Background job scheduling
- **Google Generative AI 0.11.5** – Alternative AI provider

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify MONGODB_URI in .env
- Check MongoDB Atlas IP whitelist
- Ensure MongoDB is running locally

### Email Not Sending
- Check Brevo API key validity
- Verify Gmail app password format
- Test with MailHog first (http://localhost:8025)

### Frontend/Backend Communication
- Verify backend is running on port 3001
- Check CORS configuration
- Verify API endpoint in frontend components

### AI Email Generation Issues
- Verify Groq API key is valid
- Check API rate limits
- Test with direct API call in test-brevo.js

---

## 📚 Technical Resume

**Full-stack email marketing platform** demonstrating expertise in:

- **Frontend:** React 19, Vite, Tailwind CSS, modern component architecture, drag-and-drop UI
- **Backend:** Node.js, Express, MongoDB, RESTful API design, monolithic architecture
- **Database:** Mongoose ODM, MongoDB collections and indexing
- **Authentication:** JWT token management and security
- **Integration:** Brevo API, Groq AI API, SMTP/Nodemailer, Google Generative AI
- **Background Jobs:** Node-cron for campaign scheduling and automation
- **File Handling:** Multer for secure uploads
- **UI/UX:** Dark mode, responsive design, drag-and-drop, rich editors
- **DevOps:** Environment management, error handling, development scripts

**Key Achievements:**
- AI-powered email generation with Groq integration
- Automated campaign scheduling and sending
- Real-time email delivery tracking
- Segmented contact management with bulk import (CSV/XLSX)
- Enterprise-grade email platform with 400KB+ JavaScript codebase
- Professional email editor with rich text support
- Multiple AI provider support (Groq + Google Generative AI)

---

## 📄 Documentation

Additional documentation available in:
- `Front end/README.md` – Frontend-specific setup and component details
- `Server/README.md` – Backend-specific setup and API documentation
- `Email_Marketing_Paper.tex` – Research and technical documentation

---

## 🔗 Repository

**GitHub:** https://github.com/Aditbise/Mail-Marketing

**Created:** August 29, 2025  
**Last Updated:** June 3, 2026  
**Language:** JavaScript (Primary), CSS, HTML, TeX  
**License:** ISC  
**Repository Size:** 4.9 MB

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📞 Support

For issues, questions, or suggestions:
1. Check existing issues on GitHub
2. Review documentation in README files
3. Test with provided utility scripts
4. Check environment variable configuration
5. Verify MongoDB and API key configurations
