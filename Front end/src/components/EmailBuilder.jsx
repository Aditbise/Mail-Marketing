import EmailEditor from 'react-email-editor';
import { useRef } from 'react';

function EmailBuilder() {
  const emailEditorRef = useRef(null);

  const saveDesign = () => {
    emailEditorRef.current.saveDesign((design) => {
      console.log('saveDesign', design);
      // Send design to your backend
    });
  };

  const exportHtml = () => {
    emailEditorRef.current.exportHtml((data) => {
      const { design, html } = data;
      console.log('exportHtml', html);
      // This is the final HTML you can send as email
    });
  };

  return (
    <div style={{ 
      height: '100vh', 
      width: '100%', // Take full available width
      background: '#fff'
    }}>
      <div style={{ 
        padding: '10px 20px', 
        background: '#575757ff', 
        borderBottom: '1px solid #666666ff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ margin: 0, color: 'white' }}>Email Builder</h2>
        <div>
          <button 
            onClick={saveDesign}
            style={{ 
              marginRight: '10px', 
              padding: '10px 20px', 
              background: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Save Template
          </button>
          <button 
            onClick={exportHtml}
            style={{ 
              padding: '10px 20px', 
              background: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Export HTML
          </button>
        </div>
      </div>
      <div style={{ 
        height: 'calc(100vh - 70px)', 
        width: '100%'
      }}>
        <EmailEditor
          ref={emailEditorRef}
          onLoad={() => console.log('Editor loaded')}
          style={{ 
            height: '100%',
            width: '100%'
          }}
        />
      </div>
    </div>
  );
}

export default EmailBuilder;