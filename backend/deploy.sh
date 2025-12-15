#!/bin/bash

# Deployment script for video-course-platform backend
echo "Starting deployment process..."

# Ensure environment is set to production
export NODE_ENV=production

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Run drive validation
echo "Validating Google Drive access..."
npm run validate:drive

# If validation failed, stop deployment
if [ $? -ne 0 ]; then
  echo "❌ Google Drive validation failed. Deployment aborted."
  exit 1
fi

# Build the project
echo "Building project..."
npm run build

# Start the application with increased memory limits
echo "Starting application..."
npm run start:prod

# Note: In an actual deployment environment, you would likely
# use process managers like PM2 or containerization with Docker