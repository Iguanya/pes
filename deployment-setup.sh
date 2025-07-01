#!/bin/bash

# PES Tournament Platform - Deployment Setup Script
# This script helps you set up environment variables for deployment

echo "🚀 PES Tournament Platform - Deployment Setup"
echo "=============================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install it first:"
    echo "npm i -g vercel"
    exit 1
fi

echo "📝 Setting up environment variables..."

# Required environment variables
echo "Setting required environment variables..."

vercel env add DB_HOST production
vercel env add DB_USER production  
vercel env add DB_PASSWORD production
vercel env add DB_NAME production
vercel env add DB_PORT production
vercel env add JWT_SECRET production

echo "✅ Required environment variables set!"

# Optional environment variables
echo "Setting optional environment variables (press Enter to skip)..."

echo "📧 Email Service (Resend):"
vercel env add RESEND_API_KEY production
vercel env add FROM_EMAIL production

echo "📱 SMS Service (Africa's Talking):"
vercel env add AFRICASTALKING_USERNAME production
vercel env add AFRICASTALKING_API_KEY production

echo "🖼️ Image Upload (Cloudinary):"
vercel env add CLOUDINARY_CLOUD_NAME production
vercel env add CLOUDINARY_API_KEY production
vercel env add CLOUDINARY_API_SECRET production

echo "🌍 Public Environment Variables:"
vercel env add NEXT_PUBLIC_APP_NAME production
vercel env add NEXT_PUBLIC_COMPANY_NAME production
vercel env add NEXT_PUBLIC_APP_URL production

echo "✅ Environment setup complete!"
echo ""
echo "🚀 Ready to deploy! Run:"
echo "vercel --prod"
echo ""
echo "📊 After deployment, check health status at:"
echo "https://your-domain.com/api/health"
