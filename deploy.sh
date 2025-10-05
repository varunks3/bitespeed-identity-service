#!/bin/bash

# Docker Hub Deployment Script for Bitespeed Identity Service
# Usage: ./deploy.sh [version] [username]

set -e

# Default values
VERSION=${1:-latest}
USERNAME=${2:-varunks3}
REPOSITORY="bitespeed-identity-service"

echo "🐳 Deploying to Docker Hub..."
echo "Username: $USERNAME"
echo "Repository: $REPOSITORY"
echo "Version: $VERSION"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if user is logged in to Docker Hub
if ! docker info | grep -q "Username:"; then
    echo "🔐 Please login to Docker Hub first:"
    echo "docker login"
    read -p "Press Enter after logging in..."
fi

# Build the image
echo "🔨 Building Docker image..."
docker-compose build app

# Tag the image
echo "🏷️  Tagging image..."
docker tag bitespeed-app:latest $USERNAME/$REPOSITORY:$VERSION
docker tag bitespeed-app:latest $USERNAME/$REPOSITORY:latest

# Push to Docker Hub
echo "📤 Pushing to Docker Hub..."
docker push $USERNAME/$REPOSITORY:$VERSION
docker push $USERNAME/$REPOSITORY:latest

echo ""
echo "✅ Successfully deployed to Docker Hub!"
echo "Image: $USERNAME/$REPOSITORY:$VERSION"
echo "Image: $USERNAME/$REPOSITORY:latest"
echo ""
echo "🚀 You can now pull and run the image:"
echo "docker run -p 8000:8000 $USERNAME/$REPOSITORY:latest"
