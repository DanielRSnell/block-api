# Simple GitHub Dockerfile - just clone, install, and run
FROM node:18-alpine

# Install git 
RUN apk add --no-cache git

# Create app directory
WORKDIR /app

# Clone the repository
ARG GITHUB_REPO=https://github.com/DanielRSnell/block-api.git
ARG GITHUB_BRANCH=main
RUN git clone --depth 1 --branch ${GITHUB_BRANCH} ${GITHUB_REPO} .

# Install dependencies
RUN npm ci --only=production

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "src/server.mjs"]