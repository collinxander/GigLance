# Supabase Migration Guide for GigLance

This guide provides instructions on how to run the SQL migrations for your GigLance project on your Supabase instance.

## Your Supabase Project Details

- **Project URL**: https://gzdezyfnxtekbnuokgpg.supabase.co
- **API Key**: Your anonymous key is configured in the application

## Running Migrations

### Option 1: Using Supabase SQL Editor (Recommended for Quick Setup)

1. Log in to your Supabase Dashboard at https://app.supabase.com
2. Select your GigLance project
3. Go to the SQL Editor section
4. Run each of the following migration files in sequence:

```sql
-- Run these in order:
1. supabase/migrations/20240321000000_create_profiles.sql
2. supabase/migrations/20240320000000_create_saved_gigs.sql
3. supabase/migrations/20240501000000_create_gigs_table.sql
4. supabase/migrations/20240502000000_create_applications_table.sql
5. supabase/migrations/20240325000000_create_messaging_system.sql
6. supabase/migrations/20240322000000_create_portfolio_projects.sql
7. supabase/migrations/20240323000000_enable_leaked_password_protection.sql
8. supabase/migrations/20240324000000_create_reviews_and_enhanced_portfolio.sql
9. supabase/migrations/20240320000000_add_subscriptions.sql
10. supabase/migrations/20240326000000_create_payment_system.sql
11. supabase/migrations/20240401000000_add_user_type_and_interests.sql
```

### Option 2: Using Supabase CLI

1. Install the Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project (replace with your project reference):
   ```bash
   supabase link --project-ref gzdezyfnxtekbnuokgpg
   ```

4. Push all migrations:
   ```bash
   supabase db push
   ```

## Setting Up Storage Buckets

After running migrations, create the following storage buckets in your Supabase project:

1. Go to Storage in your Supabase Dashboard
2. Create these buckets:
   - `avatars`: For user profile images
   - `attachments`: For message attachments
   - `portfolio`: For portfolio project files

## Setting Up Authentication

1. Go to Authentication > Settings in your Supabase Dashboard
2. Configure the following:
   - Enable Email/Password sign-in
   - Set up email templates for verification
   - Add your application's URL to allowed redirect URLs

## Verify Your Setup

1. Run your application with `npm run dev`
2. Try to create a new user account
3. Check in Supabase Dashboard if the user is created in Auth
4. Verify that a profile is created in the `profiles` table

## Troubleshooting

If you encounter any issues while running migrations:

1. Check for error messages in the SQL Editor
2. Ensure you're running migrations in the correct order
3. Verify that your Supabase project is properly configured
4. If a table already exists, you may need to drop it before recreating it

## Next Steps

After successfully setting up your database:

1. Configure Stripe webhooks to connect to your backend
2. Set up proper Row Level Security policies for your data
3. Implement user authentication flows in your application 