# SwapHands Setup Guide

## Important: Supabase Setup Required

This app now uses **Firebase for Authentication** and **Supabase for Database & Storage**. Follow these steps to get everything working:

## Step 1: Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to be ready (this takes about 2 minutes)

## Step 2: Set Up the Database

1. In your Supabase project, go to the **SQL Editor**
2. Copy the entire contents of the `supabase-schema.sql` file in this project
3. Paste it into the SQL Editor and click **Run**
4. This will create all the necessary tables, indexes, and security policies

## Step 3: Set Up Storage Buckets

1. In your Supabase project, go to **Storage**
2. Create a new bucket named `items`
   - Make it **public**
3. Create another bucket named `claims`
   - Make it **public**

## Step 4: Get Your Supabase Credentials

1. In your Supabase project dashboard, click on the **Settings** icon (gear icon)
2. Go to **API** settings
3. Copy these two values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (the long string under "Project API keys")

## Step 5: Add Environment Variables to Replit

1. In Replit, click on the **Tools** button in the left sidebar
2. Click on **Secrets**
3. Add these two secrets:
   - Key: `VITE_SUPABASE_URL`, Value: Your Supabase Project URL
   - Key: `VITE_SUPABASE_ANON_KEY`, Value: Your Supabase anon key
4. Save the secrets

## Step 6: Restart the Application

1. Stop the current running server (if any)
2. Restart the workflow by clicking the **Run** button
3. The app should now connect to your Supabase database!

## Firebase Authentication (Already Configured)

Firebase Authentication is already set up in this project. The existing Firebase credentials are configured for authentication only. If you want to use your own Firebase project for auth:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable **Email/Password** and **Google** authentication
4. Get your Firebase config from Project Settings
5. Replace the config in `firebase.ts`

## Testing the App

1. Create an account using a `@vitstudent.ac.in` or `@vit.ac.in` email
2. Try listing an item
3. Test the wishlist feature
4. Browse items and test all the buttons

## Optional: Gemini AI Integration

If you want AI-powered item descriptions:

1. Get a Gemini API key from [Google AI Studio](https://ai.google.dev/)
2. Add it as a secret: `GEMINI_API_KEY`
3. Note: The current implementation exposes the API key on the frontend. For production, move this to a backend function.

## Need Help?

- Check the browser console for any error messages
- Make sure all Supabase tables are created correctly
- Verify your storage buckets are public
- Ensure environment variables are set correctly in Replit Secrets
