# Bitespeed Identity Service

A web service for identifying and tracking customer identity across multiple purchases using email and phone number consolidation.

## Features

- **Contact Identification**: Consolidate customer contacts based on email and phone number
- **Primary/Secondary Linking**: Automatically link related contacts with primary/secondary precedence
- **RESTful API**: Clean HTTP API with proper error handling
- **Database Integration**: PostgreSQL with Knex ORM
- **TypeScript**: Full type safety and modern JavaScript features

## API Endpoints

### POST /identify

Identifies and consolidates customer contact information.

**Request Body:**
```json
{
  "email": "customer@example.com",
  "phoneNumber": "1234567890"
}
```

**Response:**
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["customer@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": []
  }
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2023-12-01T10:00:00.000Z",
  "service": "Bitespeed Identity Service"
}
```

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   Update the `.env` file with your database credentials.

3. **Database Setup**
   - Create a PostgreSQL database
   - Run migrations: `npm run migrate`

4. **Start the Server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

## Database Schema

The `contacts` table stores customer contact information:

```sql
{
  id                   Int                   
  phoneNumber          String?
  email                String?
  linkedId             Int? // ID of primary contact
  linkPrecedence       "secondary"|"primary"
  createdAt            DateTime              
  updatedAt            DateTime              
  deletedAt            DateTime?
}
```

## Business Logic

1. **New Contact**: If no existing contact matches the provided email or phone, a new primary contact is created.

2. **Contact Linking**: If a contact matches an existing one by email or phone, they are linked with the oldest contact as primary.

3. **Secondary Creation**: If new information (different email or phone) is provided for an existing contact, a secondary contact is created.

4. **Primary Merging**: When two primary contacts are linked, the newer one becomes secondary to the older one.

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Environment Variables

- `DB_HOST`: Database host (default: localhost)
- `DB_PORT`: Database port (default: 5432)
- `DB_NAME`: Database name (default: bitespeed)
- `DB_USER`: Database username (default: postgres)
- `DB_PASSWORD`: Database password (default: password)
- `PORT`: Server port (default: 8000)
- `NODE_ENV`: Environment (development/production)
- `LOG_LEVEL`: Logging level (default: info)
