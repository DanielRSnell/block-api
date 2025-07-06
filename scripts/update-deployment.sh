#!/bin/bash

# Update deployment script for Block Convert API
# This script pulls the latest changes and restarts the service

set -e

echo "🔄 Updating Block Convert API..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Default values
COMPOSE_FILE="docker-compose.deploy.yml"
SERVICE_NAME="block-convert-api"
GITHUB_REPO="https://github.com/DanielRSnell/block-api.git"
GITHUB_BRANCH="main"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --branch|-b)
            GITHUB_BRANCH="$2"
            shift 2
            ;;
        --service|-s)
            SERVICE_NAME="$2"
            shift 2
            ;;
        --compose-file|-f)
            COMPOSE_FILE="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -b, --branch BRANCH       Git branch to deploy (default: main)"
            echo "  -s, --service SERVICE     Service name (default: block-convert-api)"
            echo "  -f, --compose-file FILE   Docker compose file (default: docker-compose.deploy.yml)"
            echo "  -h, --help                Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

print_status "Deployment Configuration:"
print_status "  Repository: $GITHUB_REPO"
print_status "  Branch: $GITHUB_BRANCH"
print_status "  Service: $SERVICE_NAME"
print_status "  Compose File: $COMPOSE_FILE"
echo

# Check if compose file exists
if [[ ! -f "$COMPOSE_FILE" ]]; then
    print_error "Docker compose file '$COMPOSE_FILE' not found!"
    exit 1
fi

# Stop the current service
print_status "Stopping current service..."
if docker-compose -f "$COMPOSE_FILE" ps "$SERVICE_NAME" | grep -q "Up"; then
    docker-compose -f "$COMPOSE_FILE" stop "$SERVICE_NAME"
    print_success "Service stopped"
else
    print_warning "Service was not running"
fi

# Remove the old container
print_status "Removing old container..."
docker-compose -f "$COMPOSE_FILE" rm -f "$SERVICE_NAME" 2>/dev/null || true

# Remove old images (optional - uncomment if you want to force rebuild)
# print_status "Removing old images..."
# docker-compose -f "$COMPOSE_FILE" down --rmi all

# Build and start the new container
print_status "Building new image with latest code..."
docker-compose -f "$COMPOSE_FILE" build \
    --build-arg GITHUB_REPO="$GITHUB_REPO" \
    --build-arg GITHUB_BRANCH="$GITHUB_BRANCH" \
    --no-cache "$SERVICE_NAME"

print_status "Starting updated service..."
docker-compose -f "$COMPOSE_FILE" up -d "$SERVICE_NAME"

# Wait for service to be healthy
print_status "Waiting for service to be healthy..."
HEALTH_CHECK_URL="http://localhost:3000/health"
MAX_ATTEMPTS=30
ATTEMPT=1

while [[ $ATTEMPT -le $MAX_ATTEMPTS ]]; do
    if curl -f -s "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
        print_success "Service is healthy!"
        break
    else
        if [[ $ATTEMPT -eq $MAX_ATTEMPTS ]]; then
            print_error "Service failed to become healthy after $MAX_ATTEMPTS attempts"
            print_status "Checking service logs..."
            docker-compose -f "$COMPOSE_FILE" logs --tail=20 "$SERVICE_NAME"
            exit 1
        fi
        print_status "Attempt $ATTEMPT/$MAX_ATTEMPTS - waiting for service..."
        sleep 2
        ((ATTEMPT++))
    fi
done

# Show final status
print_status "Deployment completed successfully!"
print_status "Service status:"
docker-compose -f "$COMPOSE_FILE" ps "$SERVICE_NAME"

echo
print_success "🎉 Block Convert API has been updated and is running!"
print_status "API Documentation: http://localhost:3000/api-docs"
print_status "Health Check: http://localhost:3000/health"

# Optional: Show recent logs
print_status "Recent logs:"
docker-compose -f "$COMPOSE_FILE" logs --tail=10 "$SERVICE_NAME"