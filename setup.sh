#!/bin/bash

echo "🚀 Setting up Bitespeed Identity Service..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or later."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "✅ .env file created. Please update it with your database credentials."
fi

# Check if PostgreSQL is running (optional)
if command -v psql &> /dev/null; then
    echo "🐘 Checking PostgreSQL connection..."
    if psql -h localhost -U postgres -d postgres -c '\q' 2>/dev/null; then
        echo "✅ PostgreSQL is running"
    else
        echo "⚠️  PostgreSQL might not be running. Please start PostgreSQL before running the service."
    fi
else
    echo "⚠️  PostgreSQL client not found. Please ensure PostgreSQL is installed and running."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your database credentials"
echo "2. Start PostgreSQL database"
echo "3. Run the service:"
echo "   - Development: npm run dev"
echo "   - Production: npm run build && npm start"
echo "4. Test the API: node test-api.js"
echo ""
echo "Docker option:"
echo "   - Run with Docker: docker-compose up"
