#!/bin/bash
# Quick Start Script for MASA Coders Website
# Run this script to setup and start development in one command

echo "🚀 MASA Coders - Premium Business Website"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Create environment file
echo ""
echo "🔧 Creating .env.local..."
cat > .env.local << EOF
MONGODB_URI=mongodb://localhost:27017/masacoders
JWT_SECRET=your_very_secure_secret_key_min_32_characters_long_please_change_this
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
EOF

echo "✅ Environment configured"
echo ""

# Seed database
echo "🌱 Seeding database..."
npm run seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Update MongoDB connection in .env.local (currently set to localhost)"
echo "2. Update JWT_SECRET to a secure random string"
echo "3. Start development: npm run dev"
echo "4. Open http://localhost:3000 in your browser"
echo "5. Admin: http://localhost:3000/admin/login"
echo "   Email: info@masacoders.tech"
echo "   Password: Admin@123"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Project overview"
echo "   - SETUP_GUIDE.md - Detailed setup guide"
echo "   - COMPLETION_SUMMARY.md - What's included"
echo ""
echo "🚀 Happy coding!"
