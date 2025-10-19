# SwapHands - VIT Marketplace

**Last Updated:** October 19, 2025

## Overview

SwapHands is a full-featured marketplace platform designed for students at VIT Vellore. It allows users to buy, sell, and swap second-hand items, report lost & found items, and interact within a moderated, student-only environment.

## Tech Stack

- **Frontend Framework:** React 19.2 + TypeScript
- **Build Tool:** Vite 6.2
- **Styling:** Tailwind CSS (via CDN for development)
- **Authentication:** Firebase Auth (Email/Password + Google Sign-In)
- **Database & Storage:** Supabase (PostgreSQL + Object Storage)
- **AI Features:** Google Gemini API (optional, for AI-powered item descriptions)

## Project Structure

```
├── assets/          # Icon components
├── components/      # Reusable React components
├── context/         # React context providers (Auth, Data, Theme)
├── pages/           # Main app pages (Admin, Auth, Student)
├── services/        # External service integrations (Gemini)
├── utils/           # Utility functions (storage helpers)
├── firebase.ts      # Firebase configuration
├── supabase.ts      # Supabase client configuration
├── types.ts         # TypeScript type definitions
└── App.tsx          # Main app component
```

## Environment Setup

### Required Environment Variables

The app requires these secrets to be configured in Replit:

1. **Supabase** (Required for database and storage):
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

2. **Firebase** (Optional - defaults are provided):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`

3. **Gemini AI** (Optional):
   - `GEMINI_API_KEY` - For AI-powered item description generation

### Supabase Setup Instructions

1. Create a Supabase account at https://supabase.com
2. Create a new project (takes ~2 minutes)
3. Run the SQL schema from `supabase-complete-setup.sql` in the SQL Editor
4. Create two public storage buckets: `items` and `claims`
5. Copy your Project URL and anon key from Settings → API
6. Add them as Replit secrets

See `SETUP.md` for detailed step-by-step instructions.

## Development

### Running the App

The app runs automatically via the configured workflow:
- **Command:** `npm run dev`
- **Port:** 5000
- **URL:** Available in the Webview panel

### Key Features

- Student and Admin roles with separate interfaces
- Full CRUD for marketplace items
- Wishlist functionality
- User profiles and ratings
- Lost & Found section
- Admin moderation panel
- Dark mode support
- Responsive design

## Architecture Notes

- **Authentication:** Firebase Auth handles user authentication
- **Database:** Supabase PostgreSQL stores all app data (users, items, claims, complaints)
- **Storage:** Supabase Storage hosts uploaded images
- **Real-time:** Supabase provides real-time subscriptions for live updates
- **Security:** Row Level Security (RLS) policies configured in Supabase

## Known Configuration

- Vite dev server configured for Replit (0.0.0.0:5000, allowedHosts: true)
- Firebase config has default fallback values for testing
- Supabase credentials must be provided by user
- Tailwind CSS loaded via CDN (not recommended for production)

## Production Deployment

Before deploying to production:
1. Install Tailwind CSS as a PostCSS plugin (currently using CDN)
2. Secure the Gemini API integration via backend proxy
3. Configure proper Firebase security rules
4. Review and tighten Supabase RLS policies
5. Set up proper environment variable management

## Recent Changes

- **2025-10-19:** Initial Replit environment setup completed
  - Installed all npm dependencies
  - Added missing TypeScript environment variable types
  - Configured workflow for port 5000 with proper host settings
  - Created project documentation
