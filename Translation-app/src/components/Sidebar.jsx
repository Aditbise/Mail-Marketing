import { Link } from 'react-router-dom';
function Sidebar() {
  return (
    <div className='sidebarjsx' style={{overflow:"hidden",width:"auto"}}>
      <h3>Menu</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/campaigns">Campaigns</Link></li>
        {/* <li><Link to="/email-lists">Email Lists</Link></li> */}
        <li><Link to="/email-templates">Email Templates</Link></li>
        <li><Link to="/reports">Reports</Link></li>
        <li><Link to="/contact-lists">Contact Lists</Link></li>
      </ul>
    </div>
  );
}

export default Sidebar;
