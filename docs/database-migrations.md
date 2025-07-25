# Database Migrations

## Making Schema Changes

1. **Edit the schema**: Modify `prisma/schema.prisma`
2. **Push to database**: `npm run db:push` or `npx prisma db push`
3. **Regenerate client**: `npx prisma generate` (usually runs automatically)

## Deploying to Supabase

The `db:push` command will automatically deploy changes to your connected Supabase database. Make sure your `.env` file has the correct `DATABASE_URL` pointing to your Supabase instance.

## Example: Adding a New Table

```prisma
model NewTable {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
}
```

Then run:
```bash
npm run db:push
```

That's it! The table will be created in Supabase.