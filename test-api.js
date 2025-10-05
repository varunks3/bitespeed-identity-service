const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing Bitespeed Identity Service API\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    console.log('');

    // Test 2: Create new contact
    console.log('2. Creating new contact with email and phone...');
    const newContactResponse = await axios.post(`${BASE_URL}/identify`, {
      email: 'lorraine@hillvalley.edu',
      phoneNumber: '123456'
    });
    console.log('✅ New contact created:', JSON.stringify(newContactResponse.data, null, 2));
    console.log('');

    // Test 3: Create secondary contact with same phone, different email
    console.log('3. Creating secondary contact with same phone, different email...');
    const secondaryContactResponse = await axios.post(`${BASE_URL}/identify`, {
      email: 'mcfly@hillvalley.edu',
      phoneNumber: '123456'
    });
    console.log('✅ Secondary contact created:', JSON.stringify(secondaryContactResponse.data, null, 2));
    console.log('');

    // Test 4: Query by email only
    console.log('4. Querying by email only...');
    const emailQueryResponse = await axios.post(`${BASE_URL}/identify`, {
      email: 'lorraine@hillvalley.edu'
    });
    console.log('✅ Email query result:', JSON.stringify(emailQueryResponse.data, null, 2));
    console.log('');

    // Test 5: Query by phone only
    console.log('5. Querying by phone only...');
    const phoneQueryResponse = await axios.post(`${BASE_URL}/identify`, {
      phoneNumber: '123456'
    });
    console.log('✅ Phone query result:', JSON.stringify(phoneQueryResponse.data, null, 2));
    console.log('');

    // Test 6: Create another primary contact and link them
    console.log('6. Creating another primary contact...');
    const anotherPrimaryResponse = await axios.post(`${BASE_URL}/identify`, {
      email: 'george@hillvalley.edu',
      phoneNumber: '919191'
    });
    console.log('✅ Another primary contact created:', JSON.stringify(anotherPrimaryResponse.data, null, 2));
    console.log('');

    // Test 7: Link two primary contacts
    console.log('7. Linking two primary contacts...');
    const linkResponse = await axios.post(`${BASE_URL}/identify`, {
      email: 'george@hillvalley.edu',
      phoneNumber: '123456'
    });
    console.log('✅ Primary contacts linked:', JSON.stringify(linkResponse.data, null, 2));
    console.log('');

    console.log('🎉 All tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Check if axios is available, if not provide instructions
try {
  require('axios');
  testAPI();
} catch (error) {
  console.log('❌ axios is not installed. Please run: npm install axios');
  console.log('Then run: node test-api.js');
}
