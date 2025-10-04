# SwapHands - VIT Marketplace

## Overview
SwapHands is a full-featured marketplace platform designed for students at VIT Vellore. It allows users to buy, sell, and swap second-hand items, report lost & found items, and interact within a moderated, student-only environment.

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite
- **Authentication**: Firebase Auth (Email/Password & Google Sign-In)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **AI Features**: Google Gemini API (optional)
- **Styling**: Tailwind CSS with custom white/cream/black theme

## Project Status
This project has been fully migrated to use Supabase for database and storage while keeping Firebase for authentication only. The UI has been redesigned with a modern white/cream/black color scheme and smooth animations.

## Recent Changes (October 4, 2025)

### Replit Environment Setup (Latest)
- ✅ Successfully imported GitHub repository to Replit
- ✅ Installed all npm dependencies
- ✅ Configured workflow to run on port 5000 with proper host settings
- ✅ Set up deployment configuration for Autoscale
- ✅ Verified Vite config with allowedHosts: true for Replit proxy
- ⚠️ **Action Required**: Add Supabase credentials to Replit Secrets (see below)

### Backend Migration
- ✅ Migrated from Firebase Firestore to Supabase PostgreSQL database
- ✅ Migrated from Firebase Storage to Supabase Storage
- ✅ Kept Firebase Authentication for user auth
- ✅ Created comprehensive SQL schema with proper indexes and RLS policies
- ✅ Added real-time subscriptions for live data updates

### UI/UX Redesign
- ✅ Implemented white/cream/black color scheme throughout the app
- ✅ Added floating card animations with hover effects
- ✅ Created smooth transitions and transform animations
- ✅ Redesigned buttons with scale and shadow effects
- ✅ Updated all components with modern, minimalist design
- ✅ Improved mobile responsiveness

### Configuration
- ✅ Configured Vite to run on port 5000 (Replit requirement)
- ✅ Added `allowedHosts: true` for Replit proxy compatibility
- ✅ Set up environment variable management

## Project Architecture

### Frontend Structure
- `/components` - Reusable UI components with animations
  - `AnimatedButton.tsx` - Animated button with hover/active states
  - `ItemCard.tsx` - Product card with floating effects
  - `Header.tsx` - Navigation with search
- `/pages` - Main application pages
  - `StudentApp.tsx` - Student marketplace interface
  - `AdminApp.tsx` - Admin moderation panel
  - `AuthPage.tsx` - Login/signup with modern design
- `/context` - React contexts for state management
  - `AuthContext.tsx` - Firebase auth + Supabase user data
  - `DataContext.tsx` - Supabase database operations
  - `ThemeContext.tsx` - Theme management
- `/services` - External API services
  - `geminiService.ts` - AI description generation
- `/utils` - Utility functions
  - `storage.ts` - Supabase storage upload helper
- `/assets` - Icons and static assets

### Key Features
- **Authentication**: Firebase Email/Password & Google Sign-In
- **User Management**: Profiles, ratings, suspension (admin)
- **Marketplace**: List items, browse, search, wishlist
- **Lost & Found**: Report found items, submit claims with proof
- **Admin Panel**: User management, complaint resolution, claim approval
- **Real-time Updates**: Live data sync via Supabase subscriptions
- **Image Upload**: Supabase Storage integration
- **Responsive Design**: Mobile-first approach with animations

## Database Schema (Supabase)

Tables:
- `users` - User profiles with ratings and wishlist
- `items` - Marketplace listings
- `lost_items` - Found items waiting to be claimed
- `complaints` - Item reports for moderation
- `claims` - Lost item claim requests with proof

Storage Buckets:
- `items` - Product images
- `claims` - Claim proof images and bills

## Configuration

### Required Environment Variables
Add these in Replit Secrets:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon public key
- `GEMINI_API_KEY` (optional) - Google Gemini API key

### Firebase Configuration
Firebase is configured in `firebase.ts` for authentication only. The existing credentials work, or you can replace with your own Firebase project.

### Supabase Setup
1. Create a Supabase project
2. Run the `supabase-schema.sql` script in Supabase SQL Editor
3. Create storage buckets: `items` and `claims` (both public)
4. Add credentials to Replit Secrets

See `SETUP.md` for detailed setup instructions.

## Running the Project

### Development
The project automatically runs via the configured workflow:
```bash
npm run dev
```
Access through Webview on port 5000.

### Building for Production
```bash
npm run build
```

## Design System

### Color Palette
- **Primary Black**: `#1a1a1a` - Buttons, headers, emphasis
- **Cream Background**: `#faf7f2` - Main background, soft accent
- **White**: `#ffffff` - Cards, modals, clean surfaces
- **Gray Shades**: For text hierarchy and borders

### Animations
- **Hover Effects**: Scale transforms, shadow enhancements
- **Floating Cards**: Subtle elevation changes on hover
- **Page Transitions**: Fade-in-down animations
- **Button States**: Active scale, shadow depth changes

## Security Notes

### Supabase Security
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Basic policies allow authenticated users to read/write
- ⚠️ **For Production**: Tighten RLS policies to restrict access based on user roles

### Firebase Auth
- ✅ Email verification available
- ✅ Google OAuth configured
- ⚠️ **For Production**: Add email verification requirements

### API Keys
- ⚠️ **Gemini API**: Currently called from frontend (exposes key)
- **Recommendation**: Move to Firebase Cloud Functions for production

## Next Steps & Improvements

### High Priority
- [ ] Tighten Supabase RLS policies for production
- [ ] Add email verification for new signups
- [ ] Move Gemini API calls to secure backend
- [ ] Add loading states and error handling
- [ ] Implement pagination for large datasets

### Nice to Have
- [ ] Add image optimization before upload
- [ ] Implement chat/messaging between users
- [ ] Add push notifications for new items
- [ ] Create admin analytics dashboard
- [ ] Add user verification badges
- [ ] Implement item sorting and advanced filters

## User Preferences
No specific user preferences have been set yet.

## Support
Check `SETUP.md` for detailed setup instructions.
Report issues in the browser console and check Supabase dashboard for database errors.
