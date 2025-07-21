#!/bin/bash

echo "🗄️  Setting up Supabase database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set. Loading from .env.local..."
    export $(cat .env.local | grep DATABASE_URL | xargs)
fi

echo "📊 Pushing Prisma schema to database..."
npx prisma db push

echo "✅ Database setup complete!"
echo ""
echo "Optional: Run 'npm run db:seed' to add sample data"