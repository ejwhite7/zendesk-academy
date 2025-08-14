#!/bin/bash

# Zendesk Academy Setup Script
# This script helps you get started with Zendesk Academy development

set -e

echo "🎓 Welcome to Zendesk Academy Setup!"
echo "====================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. You have version $(node -v)"
    echo "   Please upgrade Node.js and try again."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo ""
    echo "🔧 Creating environment configuration..."
    cp .env.example .env.local
    echo "✅ Created .env.local from .env.example"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env.local with your actual configuration:"
    echo "   - Supabase URL and keys"
    echo "   - Anthropic Claude API key"
    echo "   - Zendesk credentials (optional)"
    echo ""
else
    echo "✅ .env.local already exists"
fi

# Run type check
echo ""
echo "🔍 Running type check..."
npm run typecheck

if [ $? -eq 0 ]; then
    echo "✅ Type check passed"
else
    echo "❌ Type check failed. Please fix TypeScript errors before continuing."
    exit 1
fi

# Check if we can build the project
echo ""
echo "🏗️  Testing build process..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your configuration"
echo "2. Set up your Supabase database (see README.md)"
echo "3. Run 'npm run dev' to start development"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Full project documentation"
echo "   - DEPLOYMENT.md - Deployment guide"
echo "   - docs/PRD.md - Product requirements"
echo ""
echo "🚀 Start development server:"
echo "   npm run dev"
echo ""
echo "Happy coding! 🎓"