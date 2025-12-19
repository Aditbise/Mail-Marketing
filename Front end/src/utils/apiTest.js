/**
 * API Connection Test
 * Tests the connection between frontend and backend
 * Run this in the browser console to verify setup
 */

// Test 1: Check if backend is reachable
async function testBackendConnection() {
  console.log('🔍 Testing Backend Connection...');
  try {
    const response = await fetch('http://localhost:3001/company-info');
    if (response.ok) {
      console.log('✅ Backend is reachable');
      const data = await response.json();
      console.log('📊 Company Info:', data);
      return true;
    } else {
      console.log('❌ Backend returned error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot reach backend:', error.message);
    return false;
  }
}

// Test 2: Check if segments endpoint works
async function testSegmentsEndpoint() {
  console.log('🔍 Testing Segments Endpoint...');
  try {
    const response = await fetch('http://localhost:3001/segments');
    if (response.ok) {
      console.log('✅ Segments endpoint is working');
      const data = await response.json();
      console.log(`📊 Found ${data.length} segments:`, data);
      return true;
    } else {
      console.log('❌ Segments endpoint error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot access segments:', error.message);
    return false;
  }
}

// Test 3: Check if email bodies endpoint works
async function testEmailBodiesEndpoint() {
  console.log('🔍 Testing Email Bodies Endpoint...');
  try {
    const response = await fetch('http://localhost:3001/email-bodies');
    if (response.ok) {
      console.log('✅ Email bodies endpoint is working');
      const data = await response.json();
      console.log(`📊 Found ${data.length} email bodies:`, data);
      return true;
    } else {
      console.log('❌ Email bodies endpoint error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot access email bodies:', error.message);
    return false;
  }
}

// Test 4: Check if templates endpoint works
async function testTemplatesEndpoint() {
  console.log('🔍 Testing Templates Endpoint...');
  try {
    const response = await fetch('http://localhost:3001/email-templates');
    if (response.ok) {
      console.log('✅ Templates endpoint is working');
      const data = await response.json();
      console.log(`📊 Found ${data.length} templates:`, data);
      return true;
    } else {
      console.log('❌ Templates endpoint error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot access templates:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.clear();
  console.log('═════════════════════════════════════════');
  console.log('   Mail Marketing API Connection Tests');
  console.log('═════════════════════════════════════════');
  console.log('');

  const results = [];
  
  results.push(await testBackendConnection());
  console.log('');
  
  results.push(await testSegmentsEndpoint());
  console.log('');
  
  results.push(await testEmailBodiesEndpoint());
  console.log('');
  
  results.push(await testTemplatesEndpoint());
  console.log('');
  
  console.log('═════════════════════════════════════════');
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  if (passed === total) {
    console.log(`✅ All ${total} tests PASSED!`);
    console.log('Frontend-Backend connection is working!');
  } else {
    console.log(`⚠️  ${passed}/${total} tests passed`);
    console.log('Some endpoints are not responding.');
    console.log('Please check:');
    console.log('1. Backend server is running (npm start in Server directory)');
    console.log('2. MongoDB is running');
    console.log('3. Port 3001 is not blocked');
  }
  console.log('═════════════════════════════════════════');
}

// Export for use as module
export {
  testBackendConnection,
  testSegmentsEndpoint,
  testEmailBodiesEndpoint,
  testTemplatesEndpoint,
  runAllTests
};

// Run tests when this script is loaded
runAllTests();
