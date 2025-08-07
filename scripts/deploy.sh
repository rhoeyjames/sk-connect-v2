#!/bin/bash

# SKConnect Vercel Deployment Script
echo "🚀 Starting SKConnect deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run this script from the project root."
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run type check
echo "🔍 Running type check..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed. Please fix errors before deploying."
  exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "🎉 Deployment complete!"
echo "📋 Next steps:"
echo "1. Configure environment variables in Vercel dashboard"
echo "2. Set up custom domain (optional)"
echo "3. Configure backend integration"
