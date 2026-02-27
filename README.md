# Mail Marketing (Email Marketing Platform)

A full-stack email marketing platform with a modern React dashboard and a Node.js/Express backend for managing contacts, segments, templates, and campaigns (including analytics, scheduling, and AI-assisted email generation).

---

## Technologies Used

### Frontend
- **React (Vite)** – Single-page application UI
- **React Router** – Client-side routing
- **Tailwind CSS** – Styling (dark mode, utility-first)
- **Axios** – HTTP client for backend API calls
- **Lucide React** – Icons
- **Node.js / npm** – Tooling and package management

### Backend
- **Node.js + Express** – REST API server
- **MongoDB + Mongoose** – Database and models
- **JWT Authentication** – Secure auth (`JWT_SECRET`)
- **Brevo API** – Email delivery provider (`BREVO_API_KEY`, `BREVO_EMAIL`)
- **Groq API** – AI email generation (`GROQ_API_KEY`)
- **Uploads** – Company logo upload support (`Server/uploads/`)
- **MailHog** – Local email testing UI (`http://localhost:8025`)

---

## Resume Highlights

- Built a full-stack email marketing platform using **React (Vite)** on the frontend and **Node.js/Express + MongoDB** on the backend.
- Implemented authentication, contact list management, segmentation, and campaign workflows (templates, email bodies, recipients).
- Integrated **Brevo** for email delivery and implemented endpoints for campaign analytics and tracking.
- Added **AI-assisted email generation** using the **Groq API** to speed up marketing copy creation.
- Implemented scheduled campaign sending (auto-checking and dispatching scheduled campaigns).

---

## Repository Structure

```text
Mail-Marketing/
  Front end/
    src/
      components/
        App.jsx
        Front.jsx
        Login.jsx
        Signup.jsx
        Dashboard.jsx
        Campaigns.jsx
        EmailBodyEditor.jsx
        EmailLists.jsx
        Segments.jsx
        CompanyInfo.jsx
        Features.jsx
        Sidebar.jsx
      index.css
      main.jsx
    public/
    eslint.config.js
    index.html
    package.json
    package-lock.json
    vite.config.js
    README.md
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
    index.js
    package.json
    package-lock.json
    README.md
```

---

## Setup (Local Development)

### Requirements
- **Node.js 16+**
- **npm 8+**
- **MongoDB** (local or cloud)

### 1) Backend Setup (Server)
```bash
cd "Server"
npm install
```

Create a `.env` file (see `.env.example`) and set:

- `MONGODB_URI` – MongoDB connection string  
- `JWT_SECRET` – JWT signing secret  
- `PORT` – server port (default `3001`)  
- `BREVO_API_KEY` – Brevo API key  
- `BREVO_EMAIL` – sender email address  
- `GROQ_API_KEY` – Groq API key  

Run the server:
```bash
node index.js
```

Backend runs on:
- `http://localhost:3001`

MailHog (for testing) runs on:
- `http://localhost:8025`

---

### 2) Frontend Setup (Front end)
```bash
cd "Front end"
npm install
npm run dev
```

Frontend dev server runs on:
- `http://localhost:5173` or `http://localhost:5174`

Backend API expected at:
- `http://localhost:3001`

---

## Backend Routes (API Overview)

### Authentication
- `POST /login` – User login
- `POST /signup` – User registration

### Email Templates
- `GET /email-templates` – List templates
- `POST /email-templates` – Create template
- `PUT /email-templates/:id` – Update template
- `DELETE /email-templates/:id` – Delete template

### Contacts
- `GET /email-list` – List contacts
- `POST /add-email` – Add contact
- `DELETE /email-list/:id` – Delete contact
- `PUT /email-list/:id` – Update contact

### Segments
- `GET /segments` – List segments
- `POST /segments` – Create segment
- `PUT /segments/:id` – Update segment
- `DELETE /segments/:id` – Delete segment

### Campaigns / Analytics
- `GET /email-campaigns` – List campaigns
- `POST /email-campaigns` – Create campaign
- `POST /send-campaign` – Send campaign
- `GET /analytics` – Analytics reporting

### Company Settings
- `GET /company-info` – Get company settings
- `PUT /company-info` – Update company settings
- `POST /company-info/logo` – Upload company logo

### AI Generation
- `POST /ai-generate-email` – Generate email content with AI

---

## Notes

- Start the **backend first**, then run the frontend.
- Most frontend functionality requires being logged in.
- All frontend API calls target `http://localhost:3001`.