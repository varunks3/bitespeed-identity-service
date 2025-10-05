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

# Build and push multi-arch (linux/amd64) image using Buildx
echo "🔨 Building and pushing linux/amd64 image with Buildx..."
export DOCKER_BUILDKIT=1
docker buildx create --use --name bitespeed-builder >/dev/null 2>&1 || docker buildx use bitespeed-builder
docker buildx build \
  --platform linux/amd64 \
  -t $USERNAME/$REPOSITORY:$VERSION \
  -t $USERNAME/$REPOSITORY:latest \
  --push \
  .

echo ""
echo "✅ Successfully deployed to Docker Hub!"
echo "Image: $USERNAME/$REPOSITORY:$VERSION"
echo "Image: $USERNAME/$REPOSITORY:latest"
echo ""
echo "🚀 You can now pull and run the image:"
echo "docker run -p 8000:8000 $USERNAME/$REPOSITORY:latest"
