#!/bin/bash

# Production deployment script for First Principles documentation app

set -e  # Exit immediately if a command exits with a non-zero status

echo "🚀 Starting deployment process..."

# Check for docker and docker-compose
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker and/or docker-compose are not installed. Please install them first."
    exit 1
fi

# Pull latest changes if connected to a repository
if [ -d ".git" ]; then
    echo "📦 Updating repository..."
    git pull
fi

# Build the production image
echo "🏗️ Building production Docker image..."
docker-compose -f docker-compose.prod.yml build

# Stop any existing containers
echo "🛑 Stopping existing containers if running..."
docker-compose -f docker-compose.prod.yml down || true

# Start the production containers
echo "🚀 Starting production containers..."
docker-compose -f docker-compose.prod.yml up -d

# Check if the container is running
echo "🔍 Checking container status..."
sleep 5
if [ "$(docker ps -q -f name=first-principles-prod)" ]; then
    echo "✅ Deployment completed successfully!"
    echo "📝 Application logs will be available with: docker logs first-principles-prod -f"
    echo "🌐 Application should now be accessible at http://localhost"
else
    echo "❌ Deployment failed. Container is not running."
    echo "📋 Check logs with: docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi