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
    padding: '16px',
    transition: 'all 0.2s ease'
  };

  return (
    <div className="email-builder-column">
      <div className="column-header">
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
          <div className="empty-state">
            <p>Drop items here</p>
            <span>Drag templates and segments from the left columns</span>
          </div>
        ) : (
          emailBuilder.map((item) => (
            <div 
              key={item.id}
              style={{
                padding: "12px",
                margin: "8px 0",
                backgroundColor: item.type === 'template' ? "#e3f2fd" : "#f3e5f5",
                border: `2px solid ${item.type === 'template' ? "#2196f3" : "#9c27b0"}`,
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
        <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
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
  const [emailBuilder, setEmailBuilder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {

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

    
    const findColumn = (id) => {
      if (emailTemplates.find(item => item.id === id)) return 'templates';
      if (emailSegments.find(item => item.id === id)) return 'segments';
      if (emailBuilder.find(item => item.id === id)) return 'builder';
      return null;
    };

    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);

    if (!activeColumn) return;

 
    if (activeColumn === overColumn && activeColumn !== 'builder') {
      const setFunction = 
        activeColumn === 'templates' ? setEmailTemplates :
        setEmailSegments;

      const items = 
        activeColumn === 'templates' ? emailTemplates :
        emailSegments;

      setFunction((prev) => {
        const oldIndex = prev.findIndex(item => item.id === activeId);
        const newIndex = prev.findIndex(item => item.id === overId);
        return arrayMove(prev, oldIndex, newIndex);
      });
    } 
 
    else if (overId === 'campaign-builder-droppable' || overColumn === 'builder') {
      const activeItem = 
        emailTemplates.find(item => item.id === activeId) ||
        emailSegments.find(item => item.id === activeId);

      if (activeItem && activeColumn !== 'builder') {
        
        const newItem = {
          ...activeItem,
          id: `${activeItem.id}-${Date.now()}`, 
        };

        setEmailBuilder(prev => [...prev, newItem]);
      }
    }
    
    else if (activeColumn === 'builder' && overColumn === 'builder') {
      setEmailBuilder((prev) => {
        const oldIndex = prev.findIndex(item => item.id === activeId);
        const newIndex = prev.findIndex(item => item.id === overId);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  
  const removeFromBuilder = (itemId) => {
    setEmailBuilder(prev => prev.filter(item => item.id !== itemId));
  };

  
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
    <div style={{ padding: '20px' }}>
      <h1>Email Campaign Builder</h1>
      <p>Drag templates and segments to the builder to create your email campaign</p>
      
      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          justifyContent: 'space-between',
          marginTop: '20px'
        }}>
          
          <div style={{ flex: 1 }}>
            <EmailBuilderColumn 
              task={emailTemplates} 
              title="Email Templates"
            />
          </div>

          
          <div style={{ flex: 1 }}>
            <EmailBuilderColumn 
              task={emailSegments} 
              title="Email Segments"
            />
          </div>

          
          <div style={{ flex: 1 }}>
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