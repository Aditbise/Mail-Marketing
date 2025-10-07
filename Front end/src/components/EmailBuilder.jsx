import { useRef } from 'react';
import { closestCorners, DndContext } from '@dnd-kit/core';
import { useState, useEffect } from 'react';
import { EmailBuilderColumn } from '../Models/EmailBuilderColumn';
import { arrayMove } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import axios from 'axios';

const CampaignBuilderColumn = ({ emailBuilder, removeFromBuilder, clearBuilder }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'campaign-builder-droppable',
    data: {
      type: 'droppable'
    }
  });

  const style = {
    backgroundColor: isOver ? '#f0f8ff' : 'transparent',
    border: isOver ? '2px dashed #2196f3' : '2px solid #ddd',
    borderRadius: '8px',
    minHeight: '400px',
    maxHeight: '80vh',
    padding: '16px',
    transition: 'all 0.2s ease',
    overflowY: 'auto'
  };

  return (
    <div className="email-builder-column" style={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
      <div className="column-header" style={{ flexShrink: 0, marginBottom: '10px' }}>
        <h3>Campaign Builder</h3>
        <div>
          <button 
            onClick={clearBuilder}
            style={{
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Clear All
          </button>
        </div>
      </div>
      
      <div ref={setNodeRef} style={style} className="tasks-container">
        {emailBuilder.length === 0 ? (
          <div className="empty-state" style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            color: '#666'
          }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Drop items here</p>
            <span style={{ fontSize: '14px' }}>Drag templates, segments, and company info from the columns</span>
          </div>
        ) : (
          emailBuilder.map((item) => (
            <div 
              key={item.id}
              style={{
                padding: "12px",
                margin: "8px 0",
                backgroundColor: 
                  item.type === 'template' ? "#e3f2fd" : 
                  item.type === 'segment' ? "#f3e5f5" : 
                  "#e8f5e8", // Green for company info
                border: `2px solid ${
                  item.type === 'template' ? "#2196f3" : 
                  item.type === 'segment' ? "#9c27b0" : 
                  "#4caf50"
                }`,
                borderRadius: "6px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <div style={{ fontWeight: "500", color: "#333" }}>
                  {item.title}
                </div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  {item.description} • {item.type}
                </div>
              </div>
              <button
                onClick={() => removeFromBuilder(item.id)}
                style={{
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {emailBuilder.length > 0 && (
        <div style={{ 
          marginTop: '16px', 
          display: 'flex', 
          gap: '8px',
          flexShrink: 0
        }}>
          <button
            style={{
              background: '#4caf50',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              flex: 1
            }}
          >
            Create Campaign
          </button>
          <button
            style={{
              background: '#2196f3',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              flex: 1
            }}
          >
            Preview
          </button>
        </div>
      )}
    </div>
  );
};

function EmailBuilder() {
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [emailSegments, setEmailSegments] = useState([]);
  const [companyInfo, setCompanyInfo] = useState([]);
  const [emailBuilder, setEmailBuilder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch email templates
        const templatesResponse = await axios.get('http://localhost:3001/email-templates');
        const templateData = templatesResponse.data.map(template => ({
          id: `template-${template._id}`,
          title: template.FileName ? 
            (Array.isArray(template.FileName) ? template.FileName.join(', ') : template.FileName) :
            `Template ${template._id}`,
          description: template.FileType ? 
            (Array.isArray(template.FileType) ? template.FileType.join(', ') : template.FileType) :
            'Email Template',
          type: 'template',
          originalId: template._id
        }));

        // Fetch segments
        try {
          const segmentsResponse = await axios.get('http://localhost:3001/segments');
          const segmentData = segmentsResponse.data.map(segment => ({
            id: `segment-${segment._id}`,
            title: segment.name || segment.segmentName || `Segment ${segment._id}`,
            description: segment.description || `${segment.emails?.length || 0} emails`,
            type: 'segment',
            originalId: segment._id
          }));
          setEmailSegments(segmentData);
        } catch (segmentError) {
          console.log('Segments endpoint not available, using empty array');
          setEmailSegments([]);
        }

        // Fetch company info
        try {
          const companyResponse = await axios.get('http://localhost:3001/company-info');
          const company = companyResponse.data;
          
          // Create draggable company info items
          const companyItems = [];
          
          if (company.companyName) {
            companyItems.push({
              id: 'company-name',
              title: 'Company Name',
              description: company.companyName,
              type: 'company-info',
              field: 'companyName',
              value: company.companyName
            });
          }
          
          if (company.email) {
            companyItems.push({
              id: 'company-email',
              title: 'Company Email',
              description: company.email,
              type: 'company-info',
              field: 'email',
              value: company.email
            });
          }
          
          if (company.phone) {
            companyItems.push({
              id: 'company-phone',
              title: 'Company Phone',
              description: company.phone,
              type: 'company-info',
              field: 'phone',
              value: company.phone
            });
          }
          
          if (company.website) {
            companyItems.push({
              id: 'company-website',
              title: 'Company Website',
              description: company.website,
              type: 'company-info',
              field: 'website',
              value: company.website
            });
          }
          
          if (company.address?.street || company.address?.city) {
            const addressParts = [];
            if (company.address.street) addressParts.push(company.address.street);
            if (company.address.city) addressParts.push(company.address.city);
            if (company.address.state) addressParts.push(company.address.state);
            
            companyItems.push({
              id: 'company-address',
              title: 'Company Address',
              description: addressParts.join(', '),
              type: 'company-info',
              field: 'address',
              value: addressParts.join(', ')
            });
          }
          
          // Social media links
          if (company.socialLinks?.facebook) {
            companyItems.push({
              id: 'company-facebook',
              title: 'Facebook',
              description: company.socialLinks.facebook,
              type: 'company-info',
              field: 'facebook',
              value: company.socialLinks.facebook
            });
          }
          
          if (company.socialLinks?.twitter) {
            companyItems.push({
              id: 'company-twitter',
              title: 'Twitter',
              description: company.socialLinks.twitter,
              type: 'company-info',
              field: 'twitter',
              value: company.socialLinks.twitter
            });
          }
          
          if (company.socialLinks?.linkedin) {
            companyItems.push({
              id: 'company-linkedin',
              title: 'LinkedIn',
              description: company.socialLinks.linkedin,
              type: 'company-info',
              field: 'linkedin',
              value: company.socialLinks.linkedin
            });
          }
          
          if (company.logo) {
            companyItems.push({
              id: 'company-logo',
              title: 'Company Logo',
              description: 'Company logo image',
              type: 'company-info',
              field: 'logo',
              value: company.logo
            });
          }
          
          setCompanyInfo(companyItems);
        } catch (companyError) {
          console.log('Company info not available, using empty array');
          setCompanyInfo([]);
        }

        setEmailTemplates(templateData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id;
    const overId = over.id;

    // Find which column the active item is in
    const findColumn = (id) => {
      if (emailTemplates.find(item => item.id === id)) return 'templates';
      if (emailSegments.find(item => item.id === id)) return 'segments';
      if (companyInfo.find(item => item.id === id)) return 'company';
      if (emailBuilder.find(item => item.id === id)) return 'builder';
      return null;
    };

    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);

    if (!activeColumn) return;

    // If dragging within the same column
    if (activeColumn === overColumn && activeColumn !== 'builder') {
      const setFunction = 
        activeColumn === 'templates' ? setEmailTemplates :
        activeColumn === 'segments' ? setEmailSegments :
        setCompanyInfo;

      const items = 
        activeColumn === 'templates' ? emailTemplates :
        activeColumn === 'segments' ? emailSegments :
        companyInfo;

      setFunction((prev) => {
        const oldIndex = prev.findIndex(item => item.id === activeId);
        const newIndex = prev.findIndex(item => item.id === overId);
        return arrayMove(prev, oldIndex, newIndex);
      });
    } 
    // If dragging to campaign builder (drop zone)
    else if (overId === 'campaign-builder-droppable' || overColumn === 'builder') {
      const activeItem = 
        emailTemplates.find(item => item.id === activeId) ||
        emailSegments.find(item => item.id === activeId) ||
        companyInfo.find(item => item.id === activeId);

      if (activeItem && activeColumn !== 'builder') {
        // Create a copy for the builder column
        const newItem = {
          ...activeItem,
          id: `${activeItem.id}-${Date.now()}`, // Create unique ID for builder
        };

        setEmailBuilder(prev => [...prev, newItem]);
      }
    }
    // If dragging within builder column
    else if (activeColumn === 'builder' && overColumn === 'builder') {
      setEmailBuilder((prev) => {
        const oldIndex = prev.findIndex(item => item.id === activeId);
        const newIndex = prev.findIndex(item => item.id === overId);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  // Remove item from builder
  const removeFromBuilder = (itemId) => {
    setEmailBuilder(prev => prev.filter(item => item.id !== itemId));
  };

  // Clear all builder items
  const clearBuilder = () => {
    setEmailBuilder([]);
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Email Campaign Builder</h1>
        <p>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Email Campaign Builder</h1>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', height: '100vh', overflow: 'hidden' }}>
      <h1>Email Campaign Builder</h1>
      <p>Drag templates, segments, and company info to the builder to create your email campaign</p>
      
      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          height: 'calc(100vh - 120px)', // Account for header space
          marginTop: '20px'
        }}>
          {/* Left side - Scrollable columns */}
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            width: '300px', // Fixed width for left columns
            height: '100%',
            overflowY: 'auto',
            paddingRight: '10px'
          }}>
            {/* Templates Section */}
            <div style={{ minHeight: '200px' }}>
              <h2>Templates</h2>
              <div  className='email-builder-scrollable'>
                <EmailBuilderColumn 
                  task={emailTemplates} 
                  title=""
                />
              </div>
            </div>

            {/* Segments Section */}
            <div style={{ minHeight: '200px' }}>
              <h2>Segments</h2>
              <div  className='email-builder-scrollable'>
                <EmailBuilderColumn 
                  task={emailSegments} 
                  title=""
                />
              </div>
            </div>

            {/* Personal Info Section */}
            <div style={{ minHeight: '200px' }}>
              <h2>Personal Info</h2>
              <div className='email-builder-scrollable'>
                <EmailBuilderColumn 
                  task={companyInfo} 
                  title=""
                />
              </div>
            </div>
          </div>

          {/* Right side - Campaign Builder */}
          <div style={{ 
            flex: 1,
            minWidth: '400px'
          }}>
            <CampaignBuilderColumn 
              emailBuilder={emailBuilder}
              removeFromBuilder={removeFromBuilder}
              clearBuilder={clearBuilder}
            />
          </div>
        </div>
      </DndContext>
    </div>
  );
}

export default EmailBuilder;