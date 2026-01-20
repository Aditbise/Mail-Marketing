const axios = require('axios');

async function testFlow() {
  console.log('\n=== TESTING EMAIL FLOW ===\n');
  
  try {
    // Step 1: Fetch templates
    console.log('1️⃣  Fetching templates from GET /email-templates...\n');
    const templatesRes = await axios.get('http://localhost:3001/email-templates');
    
    const newTemplate = templatesRes.data.find(t => t.name === 'new');
    if (!newTemplate) {
      console.log('❌ Template "new" not found');
      process.exit(1);
    }
    
    console.log(`✅ Found template: ${newTemplate.name}`);
    console.log(`   Subject: ${newTemplate.subject}`);
    console.log(`   Content Length: ${newTemplate.content?.length || 0}`);
    console.log(`   Content Preview: ${newTemplate.content?.substring(0, 100) || 'MISSING'}\n`);
    
    // Step 2: Build and send campaign (without actually sending to Brevo)
    console.log('2️⃣  Building campaign with template...\n');
    
    const campaign = {
      name: 'Test Campaign',
      emailBodies: [newTemplate],
      recipients: [{email: 'test@example.com', name: 'Test User'}],
      companyInfo: {name: 'Test Company'}
    };
    
    console.log(`✅ Campaign built with ${campaign.emailBodies.length} email body`);
    console.log(`   Email body content length: ${campaign.emailBodies[0].content?.length || 0}`);
    console.log(`   Email body content: ${campaign.emailBodies[0].content?.substring(0, 100) || 'MISSING'}\n`);
    
    // Step 3: Send to server
    console.log('3️⃣  Sending campaign to POST /send-campaign...\n');
    
    try {
      const sendRes = await axios.post('http://localhost:3001/send-campaign', { campaign });
      console.log('✅ Campaign response:', sendRes.status);
    } catch (error) {
      console.log('⚠️  Campaign send error (expected):', error.response?.status);
      console.log('   This is expected if Brevo API fails, but check the server logs for our debug output');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

testFlow();
