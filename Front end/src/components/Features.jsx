export default function Features() {
  const features = [
    {
      icon: '👥',
      title: 'Contact Management',
      description: 'Advanced contact database with CSV import, validation, and deduplication',
      status: 'Active'
    },
    {
      icon: '🎯',
      title: 'Smart Segmentation',
      description: 'Dynamic audience segmentation based on multiple criteria and behaviors',
      status: 'Active'
    },
    {
      icon: '📧',
      title: 'Email Campaign Builder',
      description: 'Rich HTML email editor with personalization and template library',
      status: 'Active'
    },
    {
      icon: '🚀',
      title: 'Automated Delivery',
      description: 'Professional email delivery via Brevo API with 99.9% uptime',
      status: 'Active'
    },
    {
      icon: '📊',
      title: 'Analytics & Reporting',
      description: 'Comprehensive campaign analytics with delivery and engagement metrics',
      status: 'Active'
    },
    {
      icon: '⏰',
      title: 'Campaign Scheduling',
      description: 'Advanced scheduling system with cron-based automation',
      status: 'Active'
    },
    {
      icon: '🔐',
      title: 'Enterprise Security',
      description: 'API-key authentication and secure data handling',
      status: 'Active'
    },
    {
      icon: '⚡',
      title: 'Real-time Processing',
      description: 'Instant campaign deployment with background job processing',
      status: 'Active'
    }
  ];

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#f7fafc' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ 
          textAlign: 'center', 
          fontSize: '36px', 
          fontWeight: 'bold', 
          color: '#2d3748',
          marginBottom: '16px'
        }}>
          🚀 Platform Features
        </h2>
        <p style={{ 
          textAlign: 'center', 
          fontSize: '18px', 
          color: '#718096',
          marginBottom: '40px'
        }}>
          Enterprise-grade email marketing capabilities
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {features.map((feature, index) => (
            <div key={index} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
              border: '1px solid #e2e8f0',
              transition: 'transform 0.2s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ 
                  fontSize: '32px', 
                  marginRight: '12px',
                  backgroundColor: '#edf2f7',
                  padding: '8px',
                  borderRadius: '8px'
                }}>
                  {feature.icon}
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#2d3748', fontSize: '18px', fontWeight: '600' }}>
                    {feature.title}
                  </h3>
                  <span style={{
                    backgroundColor: '#c6f6d5',
                    color: '#22543d',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {feature.status}
                  </span>
                </div>
              </div>
              <p style={{ 
                color: '#4a5568', 
                lineHeight: '1.5',
                margin: 0,
                fontSize: '14px'
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}