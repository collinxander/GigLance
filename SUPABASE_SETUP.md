# Supabase Setup for GigLance

This document outlines the steps to set up Supabase for the GigLance project.

## Prerequisites

- [Supabase account](https://supabase.io)
- Node.js and npm installed

## Setup Steps

### 1. Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.io)
2. Click "New Project"
3. Fill in the project details:
   - Name: GigLance
   - Database Password: Create a strong password
   - Region: Choose the region closest to your users
4. Click "Create new project"

### 2. Set Up Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

Replace the placeholders with your actual values from:
- Supabase: Project Settings > API
- Stripe: Developers > API Keys

### 3. Run Migrations

The Supabase migrations in the `supabase/migrations` directory will create all necessary tables and security policies. You can apply them using the Supabase CLI or by copying and executing them in the Supabase SQL Editor.

#### Using Supabase CLI

1. Install Supabase CLI:
   ```
   npm install -g supabase
   ```

2. Login to Supabase:
   ```
   supabase login
   ```

3. Link your project:
   ```
   supabase link --project-ref your-project-ref
   ```

4. Apply migrations:
   ```
   supabase db push
   ```

#### Using SQL Editor

1. Go to the SQL Editor in your Supabase Dashboard
2. Copy the content of each migration file from the `supabase/migrations` directory
3. Paste and execute them in order (filename date order)

### 4. Set Up Authentication

1. Go to Authentication > Settings in your Supabase Dashboard
2. Configure the following:
   - Enable Email/Password sign-in
   - Set up Email templates for verification
   - Configure redirect URLs to include your application domain

### 5. Set Up Storage

1. Go to Storage in your Supabase Dashboard
2. Create buckets for:
   - `avatars`: For user profile images
   - `attachments`: For message attachments
   - `portfolio`: For portfolio project files
   - `post-media`: For social media post content (images, videos)

3. Configure bucket policies:
   - For `post-media`:
     ```sql
     -- Allow public access to read files
     CREATE POLICY "Public Access"
     ON storage.objects FOR SELECT
     USING (bucket_id = 'post-media');

     -- Allow authenticated users to upload files
     CREATE POLICY "Authenticated users can upload files"
     ON storage.objects FOR INSERT
     WITH CHECK (
       bucket_id = 'post-media' AND
       auth.role() = 'authenticated'
     );

     -- Allow users to delete their own files
     CREATE POLICY "Users can delete their own files"
     ON storage.objects FOR DELETE
     USING (
       bucket_id = 'post-media' AND
       auth.uid() = owner
     );
     ```

### 6. Verify Setup

To verify your setup:

1. Run your application locally using `npm run dev`
2. Try to register a new user
3. Check if the user is created in Auth and a profile is created in the `profiles` table

## Database Structure

The GigLance database includes the following key tables:

- `profiles`: User profiles extending auth.users
- `gigs`: Job listings posted by clients
- `applications`: Job applications submitted by creatives
- `conversations`: Messaging threads between users
- `messages`: Individual messages within conversations
- `subscriptions`: User subscription data for premium features

## Security Policies

All tables have Row Level Security (RLS) policies to ensure data is only accessible by authorized users:

- Public data (open gigs, public profiles) is viewable by everyone
- Private data is only accessible by the owner or other authorized users
- All inserts, updates, and deletes are restricted based on user roles and ownership

## Next Steps

After setting up Supabase, integrate it with your Next.js application by:

1. Using the Supabase client in your components/pages
2. Implementing user authentication flows
3. Creating API routes for secure server-side operations
4. Setting up Stripe for payment processing 