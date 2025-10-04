# SwapHands - VIT Marketplace

## Overview
SwapHands is a full-featured marketplace platform designed for students at VIT Vellore. It allows users to buy, sell, and swap second-hand items, report lost & found items, and interact within a moderated, student-only environment.

## Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **AI Features**: Google Gemini API

## Project Status
This project has been successfully configured to run on Replit. The development server runs on port 5000 and is accessible through the Webview.

## Recent Changes (October 4, 2025)
- Configured Vite to run on port 5000 (Replit requirement)
- Added `allowedHosts: true` to Vite config for Replit proxy compatibility
- Installed all project dependencies
- Set up development workflow

## Project Architecture

### Frontend Structure
- `/components` - Reusable UI components (Header, ItemCard, AnimatedButton)
- `/pages` - Main application pages (StudentApp, AdminApp, AuthPage)
- `/context` - React contexts (Auth, Data, Theme)
- `/services` - External API services (Gemini AI)
- `/assets` - Icons and static assets

### Key Features
- Student & Admin Roles with separate interfaces
- Firebase Authentication (Email/Password and Google Sign-In)
- Real-time Firestore database for items, users, claims, complaints
- Image upload via Firebase Storage
- Wishlist functionality
- User profiles and seller ratings
- Lost & Found section with claim management
- Admin panel for moderation
- Responsive design with dark mode support

## Configuration

### Environment Variables
The project uses the following environment variables (optional for Gemini API):
- `GEMINI_API_KEY` - Google Gemini API key for AI-powered description generation

### Firebase Configuration
The Firebase configuration is currently hardcoded in `firebase.ts`. For production or personal use, you should:
1. Create your own Firebase project at https://console.firebase.google.com/
2. Enable Authentication (Email/Password and Google)
3. Enable Firestore Database (start in test mode for development)
4. Enable Storage
5. Replace the config in `firebase.ts` with your project's credentials

## Running the Project

### Development
The project automatically runs via the configured workflow:
```bash
npm run dev
```
Access the application through the Webview on port 5000.

### Building for Production
```bash
npm run build
```

## Security Notes

### Gemini API Key
⚠️ **IMPORTANT**: The current implementation calls the Google Gemini API directly from the frontend, which exposes the API key. For production use, this should be moved to a secure backend (Firebase Cloud Functions) to protect the API key.

### Firebase Security
The project currently uses Firebase in test mode. Before deploying to production:
- Configure proper Firestore security rules
- Configure Storage security rules
- Review and restrict authentication settings

## User Preferences
No specific user preferences have been set yet.

## Next Steps
- Consider implementing Firebase Cloud Functions for secure Gemini API calls
- Add proper Firebase security rules before production deployment
- Test all features with real data
- Consider adding environment-based configuration management
