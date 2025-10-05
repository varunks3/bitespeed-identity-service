# 🐳 Docker Setup for Bitespeed Identity Service

This document explains how to run the Bitespeed Identity Service using Docker.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Git (to clone the repository)

## 🚀 Quick Start

### Production Mode (Recommended)
```bash
# Build and start all services
docker-compose up -d

# Check logs
docker-compose logs -f app

# Test the application
curl http://localhost:8000/health
```

### Development Mode
```bash
# Start in development mode with hot reload
docker-compose -f docker-compose.dev.yml up

# Or run in background
docker-compose -f docker-compose.dev.yml up -d
```

## 🛠️ Available Commands

### Using npm scripts:
```bash
# Production
npm run docker:build    # Build Docker images
npm run docker:up      # Start services in background
npm run docker:down    # Stop all services
npm run docker:logs    # View application logs

# Development
npm run docker:dev     # Start in development mode
```

### Using Docker Compose directly:
```bash
# Production
docker-compose build          # Build images
docker-compose up -d          # Start services
docker-compose down           # Stop services
docker-compose logs -f app    # View logs

# Development
docker-compose -f docker-compose.dev.yml up    # Start dev mode
docker-compose -f docker-compose.dev.yml down  # Stop dev mode
```

## 🏗️ Architecture

The Docker setup includes:

1. **PostgreSQL Database** (`postgres` service)
   - Port: 5433 (mapped to avoid conflicts)
   - Database: bitespeed
   - User: postgres
   - Password: password

2. **Node.js Application** (`app` service)
   - Port: 8000
   - Environment: production/development
   - Auto-restart on failure

## 🔧 Configuration

### Environment Variables

**Production** (docker-compose.yml):
```yaml
environment:
  - NODE_ENV=production
  - DB_HOST=postgres
  - DB_PORT=5432
  - DB_NAME=bitespeed
  - DB_USER=postgres
  - DB_PASSWORD=password
```

**Development** (docker-compose.dev.yml):
```yaml
environment:
  - NODE_ENV=development
  - DB_HOST=postgres
  - DB_PORT=5432
  - DB_NAME=bitespeed
  - DB_USER=postgres
  - DB_PASSWORD=password
```

## 🧪 Testing

### Health Check
```bash
curl http://localhost:8000/health
```

### API Test
```bash
curl -X POST http://localhost:8000/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "phoneNumber": "1234567890"}'
```

## 📊 Monitoring

### View Logs
```bash
# All services
docker-compose logs

# Application only
docker-compose logs app

# Follow logs in real-time
docker-compose logs -f app
```

### Check Status
```bash
# Running containers
docker-compose ps

# Resource usage
docker stats
```

## 🗄️ Database Management

### Access Database
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d bitespeed

# Run migrations
docker-compose exec app npm run migrate

# Rollback migrations
docker-compose exec app npm run migrate:rollback
```

### Backup Database
```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres bitespeed > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U postgres bitespeed < backup.sql
```

## 🧹 Cleanup

### Stop and Remove
```bash
# Stop services
docker-compose down

# Remove volumes (WARNING: This deletes all data)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

### Reset Everything
```bash
# Stop, remove containers, networks, and volumes
docker-compose down -v --rmi all

# Remove unused Docker resources
docker system prune -a
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using port 8000
   lsof -i :8000
   
   # Kill the process
   kill -9 <PID>
   ```

2. **Database Connection Issues**
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps postgres
   
   # View database logs
   docker-compose logs postgres
   ```

3. **Application Won't Start**
   ```bash
   # Check application logs
   docker-compose logs app
   
   # Rebuild the image
   docker-compose build --no-cache app
   ```

### Debug Mode
```bash
# Start with debug logging
docker-compose up --build

# Access container shell
docker-compose exec app sh
```

## 📈 Performance

### Resource Limits
Add to docker-compose.yml:
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

### Scaling
```bash
# Scale application (requires load balancer)
docker-compose up --scale app=3
```

## 🔒 Security

### Production Considerations
1. Change default passwords
2. Use secrets management
3. Enable SSL/TLS
4. Configure firewall rules
5. Regular security updates

### Environment Variables
Create `.env` file:
```env
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
