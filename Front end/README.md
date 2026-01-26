# Email Marketing Platform - Frontend

## PROGRAM STRUCTURE

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
  .gitignore
  eslint.config.js
  index.html
  package.json
  package-lock.json
  vite.config.js
  README.md

## SETUP

1. Navigate to Front end directory
2. Install dependencies: npm install
3. Start development server: npm run dev
4. Access at http://localhost:5174

## REQUIREMENTS

Node.js 16 or higher
npm 8 or higher

## ENVIRONMENT

Backend API runs on http://localhost:3001
Frontend development server runs on http://localhost:5173 or http://localhost:5174

## STRUCTURE

src/components - All React components
src/index.css - Global styles using Tailwind CSS

## COMPONENTS

App.jsx - Main routing component
Front.jsx - Landing page
Login.jsx - User authentication
Signup.jsx - User registration
Dashboard.jsx - Analytics dashboard
Campaigns.jsx - Email campaign management
EmailBodyEditor.jsx - Email template editor
EmailLists.jsx - Contact list management
Segments.jsx - Audience segmentation
CompanyInfo.jsx - Company profile settings
Features.jsx - Platform features display

## DEPENDENCIES

React 19.1.0
axios - HTTP requests
lucide-react - Icons
Tailwind CSS 4.1.14 - Styling
react-router-dom - Navigation

## STYLING

All components use Tailwind CSS utilities.
Color scheme: Lime-500 accents with Zinc-950 base.
Dark mode enabled by default.

## BUILD

Production build: npm run build
Preview build: npm run preview

## NOTES

Backend server must be running for full functionality.
All API calls go to http://localhost:3001
Login credentials required to access dashboard.
