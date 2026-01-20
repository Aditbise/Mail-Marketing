const mongoose = require('mongoose');
const EmailTemplate = require('./Models/EmailTemplate.js');

mongoose.connect('mongodb://localhost:27017/email').then(async () => {
  console.log('\n=== CHECKING TEMPLATES IN DATABASE ===\n');
  
  const templates = await EmailTemplate.find().select('name subject content fromEmail');
  
  if (templates.length === 0) {
    console.log('❌ No templates found in database');
    process.exit(0);
  }
  
  templates.forEach((t, idx) => {
    console.log(`\n📄 Template #${idx + 1}:`);
    console.log(`   Name: ${t.name}`);
    console.log(`   Subject: ${t.subject}`);
    console.log(`   From Email: ${t.fromEmail}`);
    console.log(`   Has Content: ${!!t.content}`);
    console.log(`   Content Length: ${t.content?.length || 0}`);
    console.log(`   Content Preview: ${t.content?.substring(0, 150) || 'MISSING CONTENT FIELD'}`);
  });
  
  console.log('\n=== END ===\n');
  process.exit(0);
}).catch(e => {
  console.error('❌ Error connecting to database:', e.message);
  process.exit(1);
});
