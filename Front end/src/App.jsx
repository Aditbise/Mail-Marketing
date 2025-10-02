import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Campaigns from './components/Campaigns.jsx';
import Sidebar from './components/Sidebar';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import Front from './components/Front.jsx';
import EmailLists from './components/EmailLists.jsx';
import Segmants from './components/segmants.jsx';
import EmailTemplates from './components/EmailTemplates.jsx';
import EmailBuilder from './components/EmailBuilder.jsx';

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

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Front />} />
        {showSignup && <Route path="/Signup" element={<Signup />} />}
        <Route path="/Login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <div style={{ display: 'flex', minHeight: '100vh' }}>
              <Sidebar />
              <main style={{ flexGrow: 1, padding: '20px' }}>
                <Dashboard />
              </main>
            </div>
          }
        />
        <Route
          path="/campaigns"
          element={
            <div style={{ display: 'flex', minHeight: '100vh' }}>
              <Sidebar />
              <main style={{ flexGrow: 1, padding: '20px' }}>
                <Campaigns />
              </main>
            </div>
          }
        />
        <Route
          path="/email-builder"
          element={
            <div style={{ display: 'flex', minHeight: '100vh' }}>
              <Sidebar />
              <main style={{ flexGrow: 1, padding: '20px' }}>
                <EmailBuilder />
              </main>
            </div>
          }
        />
        <Route
          path="/email-lists"
          element={
            <div style={{ display: 'flex', minHeight: '100vh' }}>
              <Sidebar />
              <main style={{ flexGrow: 1, padding: '20px' }}>
                <EmailLists />
              </main>
            </div>
          }
        />
        <Route
          path="/segments"
          element={
            <div style={{ display: 'flex', minHeight: '100vh' }}>
              <Sidebar />
              <main style={{ flexGrow: 1, padding: '20px' }}>
                <Segmants />
              </main>
            </div>
          }
        />
        <Route
          path="/email-templates"
          element={
            <div style={{ display: 'flex', minHeight: '100vh' }}>
              <Sidebar />
              <main style={{ flexGrow: 1, padding: '20px' }}>
                <EmailTemplates />
              </main>
            </div>
          }
        />
  
      </Routes>
    </BrowserRouter>
  );
}

export default App;