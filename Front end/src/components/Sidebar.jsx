import { Link } from 'react-router-dom';
function Sidebar() {
  return (
    <div className='sidebarjsx' >
      <h3 style={{fontSize:'30px'}}>Menu</h3>
      <ul style={{ listStyle: 'none', padding: 10 }}>
        <div style={{display: 'grid', 
          gap: '15px', 
          justifyContent: 'space-between',
          marginTop: '20px'}}>
            <div>
              <h2 style={{color:'white',fontSize:'25px'}}>Starter Shelf :</h2>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/Campaigns">Campaigns</Link></li>

            </div>
            <div>
              <h2 style={{color:'white',fontSize:'25px'}}>Builder Shelf :</h2>
              <li><Link to="/email-lists">Email Lists</Link></li>
              <li><Link to="/email-templates">Email Templates</Link></li>
              <li><Link to="/segments">Email Segments</Link></li>
              {/* <li><Link to="/email-builder">Email Builder</Link></li> */}
              <li><Link to="/email-body-editor">Email Body Editor</Link></li>

            </div>
            <div>
              <h2 style={{color:'white',fontSize:'25px'}}>Information Shelf :</h2>
              <li><Link to="/company-info">Personal Info</Link></li>
              <li><Link to="/reports">Reports</Link></li>

            </div>

        </div>
      </ul>
    </div>
  );
}

export default Sidebar;
