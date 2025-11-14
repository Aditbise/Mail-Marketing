const mongoose = require('mongoose');
require('dotenv').config();

// Import your models
const Contact = require('./models/Contact');
const Segment = require('./models/Segment');

async function checkAllData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/email');
    console.log('✅ Connected to MongoDB');
    
    // Check Contacts
    console.log('\n📧 CHECKING CONTACTS:');
    const contacts = await Contact.find();
    console.log(`Total contacts in database: ${contacts.length}`);
    
    if (contacts.length > 0) {
      console.log('First few contacts:');
      contacts.slice(0, 3).forEach((contact, index) => {
        console.log(`  ${index + 1}. ${contact.name || 'No Name'} - ${contact.email}`);
      });
    } else {
      console.log('❌ No contacts found in database!');
    }
    
    // Check Segments  
    console.log('\n🎯 CHECKING SEGMENTS:');
    const segments = await Segment.find();
    console.log(`Total segments in database: ${segments.length}`);
    
    if (segments.length > 0) {
      console.log('Segments found:');
      segments.forEach((segment, index) => {
        console.log(`  ${index + 1}. ${segment.name} - ${segment.contacts?.length || 0} contacts`);
      });
    } else {
      console.log('❌ No segments found in database!');
    }
    
    // Check LocalStorage data (campaigns)
    console.log('\n🚀 CHECKING CAMPAIGNS:');
    console.log('(Note: Campaigns are stored in browser LocalStorage, not database yet)');
    console.log('Check your browser console or localStorage to see campaigns');
    
    // Check all collections in the database
    console.log('\n📊 ALL DATABASE COLLECTIONS:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
    process.exit(1);
  }
}

checkAllData();