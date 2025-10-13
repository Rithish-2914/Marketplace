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

## Recent Changes

### Authentication Security & UX Improvements (October 13, 2025 - Latest)
- ✅ **Enhanced Email Domain Restrictions**: Strengthened security for VIT-only access
  - Google Sign-In now restricted to @vitstudent.ac.in and @vit.ac.in domains only
  - Non-VIT Google accounts are immediately rejected with clear error message
  - Email/password signup already enforced VIT domain validation
- ✅ **Profile Completion Prompts**: Better UX for incomplete Google sign-up profiles
  - Added warning banner for users with incomplete profile details (TBD/UPDATE_ME values)
  - Prompts users to complete registration number, branch, and hostel information
  - Seamless profile editing flow from notification
- ✅ **Improved Email Verification Messaging**: Clearer guidance for new users
  - Enhanced signup success message with step-by-step verification instructions
  - Better login error messages for unverified accounts with spam folder reminder
  - Users are reminded to check verification email before attempting login

### In-App Messaging System (October 10, 2025)
- ✅ **Complete Messaging Implementation**: Users can now message each other about items
  - Created `messages` table with sender, receiver, item, content, timestamp, and read status
  - Implemented real-time message subscriptions for instant updates
  - Built ChatModal component for one-on-one conversations
  - Added MessagesPage inbox showing all conversations with unread counts
  - Connected "Message Seller" buttons throughout the app
  - Supports both item-specific and general conversations
  - Proper null/undefined handling for conversation filtering
  - Real-time unread badge updates when messages are marked as read
- ✅ **Lost & Found Image Uploads**: Admin can now upload images when posting found items
  - Integrated Supabase storage for found item images
  - Added image preview and upload functionality to admin form
  - Images stored in 'items' bucket alongside marketplace items

### Data Synchronization Fixes (October 10, 2025)
- ✅ **Fixed Database Field Conversions**: Resolved snake_case/camelCase mismatch between frontend and Supabase
  - All database writes now properly convert camelCase to snake_case
  - All database reads now properly convert snake_case to camelCase
  - Fixed: Items not appearing after creation
  - Fixed: Profile picture updates not reflecting in UI
  - Fixed: User data updates not persisting correctly
- ✅ **Profile Page Enhancements**:
  - Added "My Listings" section showing user's own items
  - Users can now view and delete their listings from profile
  - Shows listing status (Available/Sold)
- ✅ **Wishlist Feature**: Already implemented and working
  - Heart icon on item cards to add/remove from wishlist
  - Dedicated Wishlist page to view saved items
  - Real-time updates when items are wishlisted

### Authentication Enhancements (October 4, 2025)
- ✅ **Email Verification**: Sign-up now sends verification emails via Firebase Auth
  - Users must verify their email before logging in
  - Login blocked for unverified accounts with clear messaging
- ✅ **Google Sign-In**: Properly configured with Firebase popup authentication
  - Auto-creates Supabase user records for new Google accounts
  - Works seamlessly with existing authentication flow
- ✅ **Profile Pictures**: 
  - New users get random default avatars using UI Avatars API
  - Camera icon overlay on profile pictures for easy uploads
  - Upload functionality with 5MB size limit and image preview
  - Profile pictures stored in Supabase Storage
  - Real-time UI updates after upload via refreshUser function
- ✅ **User Context Refresh**: Added refreshUser() to AuthContext for state synchronization

### Replit Environment Setup (GitHub Import Complete)
- ✅ Successfully imported GitHub repository to Replit
- ✅ Installed all npm dependencies (183 packages)
- ✅ Configured workflow to run on port 5000 with proper host settings
- ✅ Set up deployment configuration for Autoscale deployment
- ✅ Updated vite.config.ts to remove path dependency and fix Replit compatibility
- ✅ Enhanced security by moving Firebase credentials to environment variables
- ✅ Updated .gitignore to exclude node_modules, environment files, and Replit config
- ✅ Application successfully running and tested
- ⚠️ **Action Required**: Add Supabase credentials to Replit Secrets (see Required Environment Variables section)

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
  - `ChatModal.tsx` - In-app messaging modal for conversations
- `/pages` - Main application pages
  - `StudentApp.tsx` - Student marketplace interface
  - `AdminApp.tsx` - Admin moderation panel
  - `AuthPage.tsx` - Login/signup with modern design
  - `MessagesPage.tsx` - User inbox for all conversations
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
- **Lost & Found**: Report found items with images, submit claims with proof
- **In-App Messaging**: Real-time chat between users for item inquiries
- **Admin Panel**: User management, complaint resolution, claim approval
- **Real-time Updates**: Live data sync via Supabase subscriptions
- **Image Upload**: Supabase Storage integration for items and claims
- **Responsive Design**: Mobile-first approach with animations

## Database Schema (Supabase)

Tables:
- `users` - User profiles with ratings and wishlist
- `items` - Marketplace listings
- `lost_items` - Found items waiting to be claimed
- `complaints` - Item reports for moderation
- `claims` - Lost item claim requests with proof
- `messages` - In-app messaging between users (supports item-specific and general chats)

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
3. Run the `supabase-messages-schema.sql` script for messaging feature
4. Create storage buckets: `items` and `claims` (both public)
5. Add credentials to Replit Secrets

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
- [ ] Add push notifications for new messages
- [ ] Create admin analytics dashboard
- [ ] Add user verification badges
- [ ] Implement item sorting and advanced filters
- [ ] Add message attachments (images, files)
- [ ] Implement message deletion and editing

## User Preferences
No specific user preferences have been set yet.

## Support
Check `SETUP.md` for detailed setup instructions.
Report issues in the browser console and check Supabase dashboard for database errors.
