import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard(){
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage (fetched from database during login)
    const storedEmail = localStorage.getItem('userEmail');
    const storedName = localStorage.getItem('userName');
    
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      // Clear all user data from localStorage
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userId');
      localStorage.removeItem('userSignedIn');
      localStorage.removeItem('signInDate');
      
      // Navigate to login page
      navigate('/login');
    }
  };

  return(
    <div className="returndiv">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h1>DASHBOARD</h1>
        {userEmail && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '15px' 
          }}>
            <div style={{ 
              backgroundColor: '#e3f2fd', 
              padding: '10px 15px', 
              borderRadius: '6px',
              border: '1px solid #2196f3',
              color: '#1976d2',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              You signed in as: <strong>{userName || 'User'}</strong> ({userEmail})
            </div>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
      
      <h2 style={{ fontWeight: 'normal'}}>Welcome to your email marketing software dashboard</h2>
      <h3 style={{ fontWeight: 'normal' }}> 1. Send emails to your customers easily<br/>
      2. Manage lists, track clicks and opens </h3>
    </div>
  );
}
export default Dashboard;