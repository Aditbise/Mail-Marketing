import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Campaigns from './components/Campaigns.jsx';
import CampaignTracker from './components/CampaignTracker.jsx';
import Sidebar from './components/Sidebar';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import Front from './components/Front.jsx';
import EmailLists from './components/EmailLists.jsx';
import Segmants from './components/Segmants.jsx';
import EmailTemplates from './components/EmailTemplates.jsx';
import EmailBuilder from './components/EmailBuilder.jsx';
import CompanyInfo from './components/CompanyInfo.jsx';
import EmailBodyEditor from './components/EmailBodyEditor.jsx'; 
import Features from './components/Features.jsx'; 

function shouldShowSignup() {
  const signedIn = localStorage.getItem('userSignedIn');
  const signInDate = localStorage.getItem('signInDate');
  if (!signedIn || !signInDate) return true;
  const now = new Date();
  const lastSignIn = new Date(signInDate);
  const diffDays = (now - lastSignIn) / (1000 * 60 * 60 * 24);
  return diffDays > 15;
}

function App() {
  const showSignup = shouldShowSignup();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const DashboardLayout = ({ children }) => (
    <>
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      {children}
    </>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Front />} />
        {showSignup && <Route path="/Signup" element={<Signup />} />}
        <Route path="/Login" element={<Login />} />
        
        {/* Dashboard Routes with Layout */}
        <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
        <Route path="/campaigns" element={<DashboardLayout><Campaigns /></DashboardLayout>} />
        <Route path="/campaign-tracker" element={<DashboardLayout><CampaignTracker /></DashboardLayout>} />
        <Route path="/email-builder" element={<DashboardLayout><EmailBuilder /></DashboardLayout>} />
        <Route path="/email-body-editor" element={<DashboardLayout><EmailBodyEditor /></DashboardLayout>} />
        <Route path="/email-lists" element={<DashboardLayout><EmailLists /></DashboardLayout>} />
        <Route path="/segments" element={<DashboardLayout><Segmants /></DashboardLayout>} />
        <Route path="/email-templates" element={<DashboardLayout><EmailTemplates /></DashboardLayout>} />
        <Route path="/company-info" element={<DashboardLayout><CompanyInfo /></DashboardLayout>} />
        <Route path="/features" element={<DashboardLayout><Features /></DashboardLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;