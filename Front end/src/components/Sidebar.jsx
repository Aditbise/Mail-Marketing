import { Link } from 'react-router-dom';
function Sidebar({ isOpen, onToggle }) {
  return (
    <div style={{
      width: isOpen ? '300px' : '93px'
    }} className='sidebarjsx' >
      <div className='sidebar-button-div'>
        <button onClick={onToggle} className='sidebar-button'>☰</button>
      </div>
      
      {isOpen ? (
        <div className='sidebar-content'>
          <h3>Menu</h3>
          <ul>
            <div className='sidebar-contnet-div'>
                <div>
                  <h2 >Starter Shelf :</h2>
                  <li><Link to="/dashboard">Dashboard</Link></li>
                  <li><Link to="/Campaigns">Campaigns</Link></li>
                  <li><Link to="/features">Features</Link></li>
  
                </div>
                <div>
                  <h2 >Builder Shelf :</h2>
                  <li><Link to="/email-lists">Email Lists</Link></li>
                  {/* <li><Link to="/email-templates">Email Templates</Link></li> */}
                  <li><Link to="/segments">Email Segments</Link></li>
                  {/* <li><Link to="/email-builder">Email Builder</Link></li> */}
                  <li><Link to="/email-body-editor">Email Body Editor</Link></li>

                </div>
                <div>
                  <h2 >Information Shelf :</h2>
                  <li><Link to="/company-info">Personal Info</Link></li>
                  <li><Link to="/reports">Reports</Link></li>
  
                </div>
  
            </div>
          </ul>
        </div>
      ) : (
        <div className='sidebar-collapsed'>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
