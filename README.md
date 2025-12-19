# 📧 Mail Marketing Application

A comprehensive email marketing platform built with **React + Vite** (frontend) and **Express.js + MongoDB** (backend).

---

## 🎯 Features

### Email Management
- ✉️ Create and manage email templates with multiple layout styles
- 🎨 Drag-and-drop email builder with live preview
- 📋 Email body customization (subject, content, signature)
- 🖼️ Hero image and company logo support
- 📌 Draft saving and auto-save functionality

### Segments & Audiences
- 👥 Create and manage email segments
- 🔍 Search and filter contacts by multiple criteria
- ✅ Bulk segment operations (create, update, delete)
- 📊 Segment analytics and contact count

### Email Campaigns
- 📬 Create campaigns from templates and segments
- ⏰ Schedule email delivery
- 🎯 Target specific audience segments
- 📈 Campaign performance tracking

### Tracking & Analytics
- 👁️ Email open tracking
- 🔗 Link click tracking
- 📊 Campaign performance metrics
- 📉 Detailed analytics dashboard

### File Management
- 📤 Upload images, logos, and documents
- 🗂️ Centralized file storage
- 🔗 Direct file access via URLs

---

## 📁 Project Structure

```
Mail Marketing/
├── Front end/                    # React + Vite Frontend
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── EmailBodyEditor.jsx
│   │   │   ├── Segments.jsx
│   │   │   └── ...
│   │   ├── Models/              # Modal components
│   │   ├── styles/              # CSS stylesheets
│   │   │   └── index.css
│   │   ├── config/              # Configuration files
│   │   │   └── api.js           # Centralized API endpoints
│   │   └── App.jsx              # Main App component
│   ├── package.json
│   ├── .env.example             # Example environment variables
│   └── vite.config.js
│
├── Server/                       # Express.js + MongoDB Backend
│   ├── Models/                  # Database models
│   │   ├── Email.js
│   │   ├── Segment.js
│   │   ├── EmailTemplate.js
│   │   └── ...
│   ├── Services/                # Business logic services
│   │   └── EmailService.js
│   ├── index.js                 # Express server setup
│   ├── package.json
│   ├── .env                     # Environment variables
│   └── uploads/                 # File upload directory
│
├── start-dev.bat                # Windows dev start script
├── start-dev.sh                 # Mac/Linux dev start script
├── SETUP.md                     # Setup guide
├── CONNECTION.md                # Connection guide
└── README.md                    # This file
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14+)
- **MongoDB** (local or Atlas)
- **Git** (optional)

### Installation & Running

#### Option 1: Using Start Script (Easiest)

**Windows:**
```bash
start-dev.bat
```

**Mac/Linux:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

#### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd Server
npm install
npm start
```

**Terminal 2 - Frontend:**
```bash
cd "Front end"
npm install
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Documentation**: See `CONNECTION.md`

---

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI library
- **Vite 6** - Build tool & dev server
- **Tailwind CSS** - Styling framework
- **Axios** - HTTP client
- **React Router** - Routing
- **React Icons** - Icon library
- **PDF.js** - PDF handling
- **XLSX** - Spreadsheet parsing

### Backend
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Multer** - File uploads
- **JWT** - Authentication
- **BCrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Brevo API** - Email service

### DevTools
- **Nodemon** - Development auto-reload
- **ESLint** - Code linting

---

## 📖 Documentation

- **[SETUP.md](./SETUP.md)** - Detailed setup and deployment guide
- **[CONNECTION.md](./CONNECTION.md)** - Frontend-backend connection guide
- **[API Endpoints](#-api-endpoints)** - Complete endpoint reference

---

## 🔌 API Endpoints

### Company Information
```
GET    /company-info              # Get company details
POST   /company-info              # Create/update company info
POST   /company-info/upload       # Upload company logo
```

### Email Segments
```
GET    /segments                  # List all segments
POST   /segments                  # Create segment
GET    /segments/:id              # Get segment details
PUT    /segments/:id              # Update segment
DELETE /segments/:id              # Delete segment
POST   /segments/delete-many      # Delete multiple segments
```

### Email Bodies
```
GET    /email-bodies              # List all email bodies
POST   /email-bodies              # Create email body
GET    /email-bodies/:id          # Get email body details
PUT    /email-bodies/:id          # Update email body
DELETE /email-bodies/:id          # Delete email body
```

### Email Templates
```
GET    /email-templates           # List all templates
POST   /email-templates           # Create template
GET    /email-templates/:id       # Get template details
PUT    /email-templates/:id       # Update template
DELETE /email-templates/:id       # Delete template
```

### Email Campaigns
```
GET    /email-campaigns           # List all campaigns
POST   /email-campaigns           # Create campaign
GET    /email-campaigns/:id       # Get campaign details
PUT    /email-campaigns/:id       # Update campaign
DELETE /email-campaigns/:id       # Delete campaign
```

### Email Tracking
```
GET    /email-tracking            # Get tracking data
POST   /email-tracking/open       # Log email open
POST   /email-tracking/click      # Log email click
```

For detailed API usage, see [CONNECTION.md](./CONNECTION.md)

---

## 🎨 Features in Detail

### Email Template Builder
- **Multiple Layouts**: Modern, Minimal, Classic
- **Live Preview**: Real-time preview of email
- **Image Support**: Upload hero images and logos
- **Auto-save**: Automatically saves drafts
- **Template Gallery**: Browse and select from default templates
- **Custom Templates**: Create and save custom templates

### Segment Management
- **Create Segments**: Add new audience segments
- **Search & Filter**: Find contacts by email, name, properties
- **Bulk Operations**: Update or delete multiple segments at once
- **Contact View**: See all contacts in each segment
- **Edit Segments**: Modify segment details

### Email Campaigns
- **Campaign Builder**: Create campaigns from templates
- **Segment Selection**: Choose target audience
- **Scheduling**: Schedule delivery time
- **Preview**: Preview emails before sending
- **Analytics**: Track opens and clicks

---

## 🔐 Security Features

- **CORS Protection**: Configured for specific origins
- **Password Hashing**: BCrypt for secure password storage
- **JWT Authentication**: Token-based session management
- **File Upload Validation**: Type and size restrictions
- **Input Validation**: Server-side data validation
- **Environment Variables**: Sensitive data in .env files

---

## 📊 Database Schema

### Company Info
```javascript
{
  companyName: String,
  logo: String (file path),
  website: String,
  description: String,
  email: String,
  phone: String,
  address: String
}
```

### Segment
```javascript
{
  name: String,
  description: String,
  contacts: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Email Body
```javascript
{
  name: String,
  subject: String,
  content: String,
  signature: String,
  heroImage: String,
  isDraft: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Email Template
```javascript
{
  name: String,
  description: String,
  icon: String,
  layout: String,
  preview: String,
  isDefault: Boolean,
  customData: Mixed,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🐛 Troubleshooting

### Common Issues

**Backend not connecting**
- Ensure backend is running on port 3001
- Check CORS settings in `Server/index.js`
- Verify MongoDB connection

**MongoDB connection error**
- Verify MongoDB is running
- Check connection string in `Server/.env`
- For Atlas: ensure IP is whitelisted

**Port already in use**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3001
kill -9 <PID>
```

**Nodemon not restarting**
- Check file path syntax in .env
- Ensure write permissions on upload directory

For more troubleshooting, see [CONNECTION.md](./CONNECTION.md#-troubleshooting)

---

## 📈 Performance Tips

1. **Database Indexing**: Add indexes on frequently queried fields
2. **Pagination**: Implement pagination for large data sets
3. **Caching**: Use Redis for session and API response caching
4. **Image Optimization**: Compress images before upload
5. **Code Splitting**: Use React.lazy() for route-based code splitting
6. **Minification**: Run `npm run build` for production

---

## 🔄 Workflow Examples

### Creating an Email Campaign

1. **Prepare Contacts**: Ensure contacts are in a segment
2. **Create Email Body**: Draft email content with template
3. **Create Campaign**: Associate email body with segment
4. **Schedule/Send**: Set delivery time and send
5. **Track Results**: Monitor opens and clicks

### Managing Templates

1. **Browse Gallery**: View available templates
2. **Select Template**: Choose a layout style
3. **Customize**: Edit email body and styling
4. **Save Draft**: Auto-saves changes
5. **Publish**: Save as custom template

### Uploading Files

1. **Select File**: Choose image or document
2. **Upload**: File is uploaded to server
3. **Get URL**: Access file at `/uploads/{filename}`
4. **Use in Email**: Insert in email body

---

## 🚀 Deployment

### Frontend Deployment
```bash
npm run build
# Deploy 'dist' folder to Vercel, Netlify, or your hosting
```

### Backend Deployment
```bash
# Set environment variables on server
npm install
npm start
# Or use PM2 for process management
```

### Environment Setup
1. Update `.env` with production values
2. Configure MongoDB Atlas connection
3. Set email service credentials
4. Update API URLs in frontend config

See [SETUP.md](./SETUP.md) for detailed deployment steps

---

## 📝 Environment Variables

### Frontend (`.env.local`)
```env
VITE_API_URL=http://localhost:3001
```

### Backend (`.env`)
```env
MONGODB_URI=mongodb://localhost:27017/email
PORT=3001
NODE_ENV=development
BREVO_API_KEY=your_api_key
BREVO_EMAIL=sender@example.com
JWT_SECRET=your_secret
MAX_FILE_SIZE=10485760
```

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 📄 License

ISC License - See LICENSE file for details

---

## 📞 Support

For issues, questions, or suggestions:
1. Check the documentation (SETUP.md, CONNECTION.md)
2. Review error messages in console/logs
3. Verify API endpoints and data format
4. Check database connection and permissions

---

## 🎉 Ready to Get Started?

1. **Clone/Download** the project
2. **Run** `start-dev.bat` (Windows) or `start-dev.sh` (Mac/Linux)
3. **Open** http://localhost:5173 in your browser
4. **Start** creating email campaigns!

For detailed setup instructions, see [SETUP.md](./SETUP.md)

---

**Happy Email Marketing! 🚀📧**
