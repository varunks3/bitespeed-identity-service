# 🚀 Docker Hub Deployment Guide

This guide explains how to deploy your Bitespeed Identity Service to Docker Hub.

## 📋 Prerequisites

1. **Docker Hub Account**: Create an account at [hub.docker.com](https://hub.docker.com)
2. **Docker Installed**: Make sure Docker is installed and running
3. **Repository Access**: Ensure you have push access to your Docker Hub repository

## 🔧 Setup

### 1. Configure Your Docker Hub Credentials

Edit the `.dockerhub` file:
```bash
# Replace with your actual Docker Hub username
DOCKER_HUB_USERNAME=your-username
DOCKER_HUB_REPOSITORY=bitespeed-identity-service
DOCKER_HUB_TAG=latest
```

### 2. Login to Docker Hub

```bash
# Login to Docker Hub
docker login

# Or use the npm script
npm run docker:login
```

## 🚀 Deployment Methods

### Method 1: Using the Deploy Script (Recommended)

```bash
# Deploy with default settings (latest tag)
./deploy.sh

# Deploy with custom version
./deploy.sh v1.0.0

# Deploy with custom username and version
./deploy.sh v1.0.0 your-username
```

### Method 2: Using npm Scripts

```bash
# Build the image
npm run docker:build

# Tag the image (update .dockerhub file first)
npm run docker:tag

# Push to Docker Hub
npm run docker:push

# Or do everything at once
npm run docker:deploy
```

### Method 3: Manual Docker Commands

```bash
# 1. Build the image
docker-compose build app

# 2. Tag the image
docker tag bitespeed-identity-service-app:latest your-username/bitespeed-identity-service:latest

# 3. Push to Docker Hub
docker push your-username/bitespeed-identity-service:latest
```

## 🏷️ Versioning Strategy

### Semantic Versioning
```bash
# Major version
./deploy.sh v2.0.0

# Minor version  
./deploy.sh v1.1.0

# Patch version
./deploy.sh v1.0.1

# Pre-release
./deploy.sh v1.0.0-beta
```

### Tagging Strategy
- `latest` - Always points to the most recent stable release
- `v1.0.0` - Specific version tags
- `dev` - Development builds
- `staging` - Pre-production builds

## 🧪 Testing Your Deployment

### Pull and Test Locally
```bash
# Pull your image
docker pull your-username/bitespeed-identity-service:latest

# Run the image
docker run -p 8000:8000 your-username/bitespeed-identity-service:latest

# Test the application
curl http://localhost:8000/health
```

### Using Docker Compose with Your Image
```bash
# Update docker-compose.prod.yml with your username
# Then run:
docker-compose -f docker-compose.prod.yml up -d
```

## 🔄 Automated Builds

### GitHub Actions (Recommended)

Create `.github/workflows/docker-publish.yml`:

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [ main, master ]
    tags: [ 'v*' ]
  pull_request:
    branches: [ main, master ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ secrets.DOCKER_USERNAME }}/bitespeed-identity-service
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=semver,pattern={{version}}
          type=semver,pattern={{major}}.{{minor}}
          type=raw,value=latest,enable={{is_default_branch}}
    
    - name: Build and push
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
```

### Docker Hub Automated Builds

1. Connect your GitHub repository to Docker Hub
2. Enable automated builds in Docker Hub
3. Configure build rules for different branches/tags

## 🔒 Security Best Practices

### 1. Use Multi-stage Builds
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 8000
CMD ["npm", "start"]
```

### 2. Use Non-root User
```dockerfile
# Add to Dockerfile
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs
```

### 3. Scan Images for Vulnerabilities
```bash
# Scan your image
docker scan your-username/bitespeed-identity-service:latest
```

## 📊 Monitoring and Maintenance

### Image Size Optimization
```bash
# Check image size
docker images your-username/bitespeed-identity-service

# Use .dockerignore to exclude unnecessary files
# Use multi-stage builds to reduce size
```

### Cleanup Old Images
```bash
# Remove old local images
docker image prune

# Remove specific image
docker rmi your-username/bitespeed-identity-service:old-tag
```

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Failed**
   ```bash
   # Re-login to Docker Hub
   docker logout
   docker login
   ```

2. **Permission Denied**
   ```bash
   # Check if you have push access to the repository
   # Verify your Docker Hub username
   ```

3. **Build Fails**
   ```bash
   # Check Dockerfile syntax
   # Verify all files are present
   # Check build context
   ```

### Debug Commands
```bash
# Check Docker Hub login status
docker info

# List local images
docker images

# Check image details
docker inspect your-username/bitespeed-identity-service:latest
```

## 📚 Additional Resources

- [Docker Hub Documentation](https://docs.docker.com/docker-hub/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [GitHub Actions for Docker](https://docs.github.com/en/actions/publishing-packages/publishing-docker-images)

## 🎯 Quick Reference

```bash
# Complete deployment workflow
./deploy.sh v1.0.0 your-username

# Test deployment
docker run -p 8000:8000 your-username/bitespeed-identity-service:v1.0.0

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```
