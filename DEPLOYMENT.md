# GigLance Deployment Guide

This guide provides step-by-step instructions for deploying the GigLance application to Vercel, connected to your GitHub repository.

## Prerequisites

Before you begin, make sure you have:

1. A GitHub account with the GigLance repository pushed to it
2. A Vercel account (you can sign up at [vercel.com](https://vercel.com) using your GitHub account)
3. A Supabase project set up with the necessary tables (see `SUPABASE_MIGRATION_GUIDE.md`)
4. A Stripe account with API keys

## Deployment Steps

### 1. Connect Vercel to GitHub

1. Log in to your Vercel account
2. Click "Add New..." and select "Project"
3. Connect your GitHub account if you haven't already
4. Select the "Collinxander" GitHub account
5. Find and select the GigLance repository
6. Click "Import"

### 2. Configure Environment Variables

In the Vercel project setup screen:

1. Add the following environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://gzdezyfnxtekbnuokgpg.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZGV6eWZueHRla2JudW9rZ3BnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNzc4MDksImV4cCI6MjA2Mjg1MzgwOX0.sGAG7GVYj6B-kqOjCdz72IXaS5zM_N5ecTfTdu7ASp8`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: `pk_test_51ROMxF2ecSUK3Ywf6E8QqXzZJj6tu7QeWmkCHjMgQfNEtirs7IiU3eUBrRIUl97Dr1vINOSJoAkjz6yYXRrLcdHY00lHsSZD0O`
   - `STRIPE_SECRET_KEY`: `sk_test_your_stripe_secret_key_here`

2. Click "Deploy"

### 3. Set Up Supabase Authentication Callback URL

After deployment, you need to configure your Supabase project to allow redirects to your Vercel domain:

1. Go to your Supabase Dashboard > Authentication > URL Configuration
2. Add your Vercel deployment URL (e.g., `https://giglance.vercel.app`) to the "Redirect URLs" and "Site URLs" sections
3. Save the changes

### 4. Set Up Stripe Webhooks

To handle Stripe events (like successful payments):

1. Go to your Stripe Dashboard > Developers > Webhooks
2. Click "Add Endpoint"
3. Enter your webhook URL: `https://your-vercel-domain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click "Add Endpoint"
6. Copy the "Signing Secret" and add it to your Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

### 5. Verify Deployment

1. Visit your deployed application (e.g., `https://giglance.vercel.app`)
2. Test user registration and login
3. Verify that database operations (creating gigs, applications, etc.) work correctly

## Continuous Deployment

With Vercel connected to your GitHub repository, any push to the main branch will automatically trigger a new deployment. To make changes:

1. Make your changes locally
2. Commit and push to GitHub
3. Vercel will automatically deploy the new version

## Troubleshooting

If you encounter issues with your deployment:

1. Check Vercel build logs for errors
2. Verify environment variables are set correctly
3. Ensure Supabase tables and policies are set up properly
4. Check browser console for client-side errors
5. Verify Supabase authentication settings

## Custom Domain Setup (Optional)

To use a custom domain with your GigLance deployment:

1. Go to your Vercel project
2. Click "Settings" > "Domains"
3. Add your custom domain
4. Follow Vercel's instructions to configure DNS settings with your domain provider 