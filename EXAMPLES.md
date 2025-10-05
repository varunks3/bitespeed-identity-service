# Bitespeed Identity Service - Usage Examples

This document provides practical examples of how to use the Bitespeed Identity Service API.

## Prerequisites

1. Start the service: `npm run dev` or `docker-compose up`
2. Ensure PostgreSQL is running and configured

## Example Scenarios

### Scenario 1: New Customer Registration

**Request:**
```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lorraine@hillvalley.edu",
    "phoneNumber": "123456"
  }'
```

**Response:**
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["lorraine@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": []
  }
}
```

### Scenario 2: Customer Returns with Different Email

**Request:**
```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mcfly@hillvalley.edu",
    "phoneNumber": "123456"
  }'
```

**Response:**
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [2]
  }
}
```

### Scenario 3: Query by Email Only

**Request:**
```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lorraine@hillvalley.edu"
  }'
```

**Response:**
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [2]
  }
}
```

### Scenario 4: Query by Phone Only

**Request:**
```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "123456"
  }'
```

**Response:**
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [2]
  }
}
```

### Scenario 5: Linking Two Primary Contacts

**Initial State:** Two separate primary contacts exist
- Contact 1: `george@hillvalley.edu` + `919191`
- Contact 2: `biffsucks@hillvalley.edu` + `717171`

**Request:**
```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "george@hillvalley.edu",
    "phoneNumber": "717171"
  }'
```

**Response:**
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["george@hillvalley.edu", "biffsucks@hillvalley.edu"],
    "phoneNumbers": ["919191", "717171"],
    "secondaryContactIds": [2]
  }
}
```

## Error Handling Examples

### Invalid Request - No Identifiers

**Request:**
```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response:**
```json
{
  "error": "Validation failed",
  "details": ["Either email or phoneNumber must be provided and not empty"]
}
```

### Invalid Request - Empty Identifiers

**Request:**
```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "",
    "phoneNumber": ""
  }'
```

**Response:**
```json
{
  "error": "Validation failed",
  "details": ["Either email or phoneNumber must be provided and not empty"]
}
```

## JavaScript/Node.js Integration

```javascript
const axios = require('axios');

class BitespeedClient {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  async identify(email, phoneNumber) {
    try {
      const response = await axios.post(`${this.baseURL}/identify`, {
        email,
        phoneNumber
      });
      return response.data;
    } catch (error) {
      throw new Error(`API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  async health() {
    const response = await axios.get(`${this.baseURL}/health`);
    return response.data;
  }
}

// Usage
const client = new BitespeedClient();

async function example() {
  try {
    // Check service health
    const health = await client.health();
    console.log('Service status:', health);

    // Identify customer
    const contact = await client.identify('customer@example.com', '1234567890');
    console.log('Contact identified:', contact);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

example();
```

## Python Integration

```python
import requests
import json

class BitespeedClient:
    def __init__(self, base_url='http://localhost:3000'):
        self.base_url = base_url

    def identify(self, email=None, phone_number=None):
        payload = {}
        if email:
            payload['email'] = email
        if phone_number:
            payload['phoneNumber'] = phone_number
        
        response = requests.post(f'{self.base_url}/identify', json=payload)
        response.raise_for_status()
        return response.json()

    def health(self):
        response = requests.get(f'{self.base_url}/health')
        response.raise_for_status()
        return response.json()

# Usage
client = BitespeedClient()

try:
    # Check service health
    health = client.health()
    print('Service status:', health)

    # Identify customer
    contact = client.identify(email='customer@example.com', phone_number='1234567890')
    print('Contact identified:', json.dumps(contact, indent=2))
except requests.exceptions.RequestException as e:
    print('Error:', e)
```

## Testing with the Provided Test Script

Run the comprehensive test script:

```bash
node test-api.js
```

This will test all the scenarios mentioned above and verify the service is working correctly.
