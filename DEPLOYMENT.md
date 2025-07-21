# Deployment Guide for Find the Others

## Quick Deploy to Vercel (Recommended)

### 1. Database Setup (Choose one)

#### Option A: Supabase (Recommended)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy the connection string (use "Transaction" mode)

#### Option B: Neon
1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy the connection string

#### Option C: Railway PostgreSQL
1. Create account at [railway.app](https://railway.app)
2. Create new PostgreSQL service
3. Copy the connection string

### 2. Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow prompts:
   - Link to existing project? No
   - What's your project name? findtheothers
   - Which directory? ./
   - Detected Next.js, use these settings? Yes

4. Add environment variables in Vercel Dashboard:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `GITHUB_TOKEN`: Your GitHub personal access token (optional)
   - `OPENAI_API_KEY`: Your OpenAI API key (optional)

5. Run database migrations:
```bash
npx prisma db push
```

### 3. Configure Domain (Optional)
- In Vercel dashboard → Settings → Domains
- Add custom domain

## Alternative: Deploy to Railway (All-in-one)

Railway handles both app and database:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and initialize
railway login
railway init

# Add PostgreSQL
railway add

# Deploy
railway up
```

## Alternative: Deploy to Heroku

1. Install Heroku CLI
2. Create app and PostgreSQL addon:
```bash
heroku create findtheothers
heroku addons:create heroku-postgresql:mini
heroku config:set NPM_CONFIG_PRODUCTION=false
```

3. Deploy:
```bash
git push heroku develop:main
heroku run npx prisma db push
```

## Environment Variables

Required:
- `DATABASE_URL`: PostgreSQL connection string

Optional (for full features):
- `GITHUB_TOKEN`: For scraping GitHub data
- `OPENAI_API_KEY`: For AI cause classification

## Post-Deployment

1. Run database migrations:
```bash
npx prisma db push
```

2. (Optional) Seed initial data:
```bash
npm run db:seed
```

3. Test the deployment:
- Visit your app URL
- Select a cause filter
- Verify visualization loads

## Monitoring

- Vercel: Check Functions tab for API logs
- Database: Use Prisma Studio locally:
```bash
DATABASE_URL=your_prod_url npx prisma studio
```