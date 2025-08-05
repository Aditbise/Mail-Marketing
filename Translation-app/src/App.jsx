import { BrowserRouter, Routes, Route, createBrowserRouter } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Campaigns from './components/Campaigns';
import EmailLists from './components/EmailLists';
import EmailTemplates from './components/EmailTemplates';
import Reports from './components/Reports';
import Sidebar from './components/Sidebar';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import Front from './components/Front.jsx';
import ContactsLists from './components/ContactsList.jsx';
import CreateContact from './components/Models/CreateContact.jsx';

function App() {
  const router=createBrowserRouter([{
    path:"/",
    element:<><Front></Front></>
  }])
  return (
    <>
    <BrowserRouter>
      <Routes>
      
        <Route path="/" element={<Front />} />
        <Route path="/Signup" element={<Signup />} />
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
          path="/campaigns/create-campaign"
          element={
            <div style={{ display: 'flex', minHeight: '100vh' }}>
              <Sidebar />
              <main style={{ flexGrow: 1, padding: '20px' }}>
                <Campaigns />
              </main>
            </div>
          }
          />
        {/* <Route
          path="/email-lists"
          element={
            <div style={{ display: 'flex', minHeight: '100vh' }}>
              <Sidebar />
              <main style={{ flexGrow: 1, padding: '20px' }}>
                <EmailLists />
              </main>
            </div>
          }
          /> */}
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
        <Route
          path="/reports"
          element={
            <div style={{ display: 'flex', minHeight: '100vh' }}>
              <Sidebar />
              <main style={{ flexGrow: 1, padding: '20px' }}>
                <Reports />
              </main>
            </div>
          }
          />
        <Route
          path="/contact-lists"
          element={
            <div style={{ display: 'flex', minHeight: '100vh' }}>
              <Sidebar />
              <main style={{ flexGrow: 1, padding: '20px' }}>
                <ContactsLists />
              </main>
            </div>
          }
        />
        <Route path="/contact-lists/new-contact" 
        element={
          <div style={{ display: 'flex', minHeight: '100vh' }}>
              <Sidebar />
              <main style={{ flexGrow: 1, padding: '20px' }}>
                <CreateContact />
              </main>
            </div>
            }/>
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
