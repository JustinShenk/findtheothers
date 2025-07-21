#!/bin/bash

echo "🚀 Deploying Find the Others to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm i -g vercel
fi

echo "⚡ Starting deployment..."
echo ""
echo "When prompted:"
echo "1. Set up and deploy: Yes"
echo "2. Which scope: Choose your account"
echo "3. Link to existing project: No"
echo "4. Project name: findtheothers (or press enter)"
echo "5. Directory: ./"
echo "6. Build settings: Accept defaults"
echo ""
echo "After deployment, add these environment variables in Vercel dashboard:"
echo "- DATABASE_URL: postgresql://postgres:[YOUR-PASSWORD]@db.yjbdyhwfympbezsvawxb.supabase.co:5432/postgres"
echo ""

vercel --prod