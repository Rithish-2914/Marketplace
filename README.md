# SwapHands - VIT Marketplace

SwapHands is a full-featured marketplace platform designed for students at VIT Vellore. It allows users to buy, sell, and swap second-hand items, report lost & found items, and interact within a moderated, student-only environment. This project is built with React, TypeScript, and Tailwind CSS, and it uses Firebase for all backend services.

## Features

- **Student & Admin Roles**: Separate interfaces and permissions for regular students and administrators.
- **Firebase Integration**: Real-time backend powered by Firebase.
    - **Authentication**: Email/Password and Google Sign-In.
    - **Firestore**: Live database for users, items, claims, and complaints.
    - **Storage**: For hosting user-uploaded images for listings and claims.
- **Full CRUD Functionality**: Create, read, update, and delete items.
- **Wishlist**: Users can save items they are interested in.
- **User Profiles & Ratings**: Edit profiles and rate sellers after transactions.
- **Lost & Found**: A dedicated section for reporting found items and allowing students to claim them with proof.
- **Admin Panel**:
    - Manage users (suspend/unsuspend).
    - Moderate listings.
    - Review and resolve item complaints and lost & found claims.
- **Responsive Design**: A clean, modern UI that works on all screen sizes.
- **Dark Mode**: Toggle between light and dark themes.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **AI (via Backend)**: Google Gemini API for AI-powered features.

---

## Getting Started: Setting Up Your Firebase Backend

To run this application with real data, you need to create and configure your own Firebase project. Follow these steps carefully.

### 1. Create a Firebase Project

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"** and give your project a name (e.g., "SwapHands-Marketplace").
3.  Follow the on-screen instructions to create the project. You can disable Google Analytics for this demo if you wish.

### 2. Enable Firebase Services

You need to enable Authentication, Firestore, and Storage.

#### A. Authentication

1.  In the Firebase Console, go to the **Authentication** section (under "Build").
2.  Click **"Get started"**.
3.  Under the "Sign-in method" tab, enable the following providers:
    *   **Email/Password**: Just toggle the switch to "Enabled".
    *   **Google**: Toggle the switch to "Enabled" and provide a project support email when prompted.

#### B. Firestore Database

1.  Go to the **Firestore Database** section (under "Build").
2.  Click **"Create database"**.
3.  For development, select **Start in test mode**. This allows open access to your database.
    > **Note for Production**: For a real-world application, you must configure [Security Rules](https://firebase.google.com/docs/firestore/security/get-started) to protect your data.
4.  Choose a location for your database and click **"Enable"**.

#### C. Storage

1.  Go to the **Storage** section (under "Build").
2.  Click **"Get started"**.
3.  Follow the prompts. Use the default security rules for now.
    > **Note for Production**: Like Firestore, you should tighten your [Storage Security Rules](https://firebase.google.com/docs/storage/security) before launching.

### 3. Get Your Firebase Configuration

1.  In the Firebase console, go to **Project Settings** (click the gear icon ⚙️ next to "Project Overview").
2.  In the "General" tab, scroll down to the "Your apps" section.
3.  Click on the **Web icon (`</>`)** to register a new web app.
4.  Give your app a nickname (e.g., "SwapHands Web") and click **"Register app"**.
5.  Firebase will provide you with a `firebaseConfig` object. **Copy this entire object.**

---

## Local Project Setup

Now that your Firebase backend is ready, you can connect it to the application code.

### 1. Configure the Application

1.  Open the `firebase.ts` file in the project's root directory.
2.  You will see a placeholder `firebaseConfig` object. **Replace this entire object with the one you copied from your Firebase project settings.**

    ```typescript
    // firebase.ts

    // BEFORE:
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      // ... other placeholder keys
    };

    // AFTER (example):
    const firebaseConfig = {
      apiKey: "AIzaSyB...xyz",
      authDomain: "swaphand-marketplace.firebaseapp.com",
      projectId: "swaphand-marketplace",
      storageBucket: "swaphand-marketplace.appspot.com",
      messagingSenderId: "1234567890",
      appId: "1:1234567890:web:abcde12345"
    };
    ```
3. Save the `firebase.ts` file.

### 2. Run the App

1.  If you haven't already, install the project dependencies (you'll need Node.js installed):
    ```bash
    npm install
    ```
2.  Start the development server:
    ```bash
    npm run dev
    ```
    (Note: If this command doesn't work, check your `package.json` for the correct start script, e.g., `npm start`.)

3.  Open your browser to the local address provided (usually `http://localhost:5173`). Your app is now running and connected to your live Firebase backend! You can create accounts, list items, and see the data appear in your Firebase console in real-time.

---

## (IMPORTANT) Securing the AI "Generate Description" Feature

The `geminiService.ts` file was removed because calling the Google Gemini API directly from the frontend would expose your `API_KEY`. This is a major security risk. The correct way to implement this is with a secure backend proxy, like a **Firebase Cloud Function**.

### High-Level Steps to Implement Securely:

1.  **Set up Firebase Cloud Functions:**
    *   Install the Firebase CLI: `npm install -g firebase-tools`
    *   Log in: `firebase login`
    *   In your project root, initialize functions: `firebase init functions` (choose TypeScript).

2.  **Create an HTTP Cloud Function:**
    *   In the `functions/src/index.ts` file, create a new function called `generateDescription`.
    *   This function will use the `@google/genai` Node.js SDK to call the Gemini API.

3.  **Securely Store Your API Key:**
    *   Do **NOT** hardcode the API key. Store it in the Firebase environment configuration:
        ```bash
        firebase functions:config:set gemini.key="YOUR_GOOGLE_AI_API_KEY"
        ```
    *   Access it in your function code via `functions.config().gemini.key`.

4.  **Call the Function from Your App:**
    *   In `StudentApp.tsx`, inside the `handleGenerateDescription` function, use the Firebase Functions SDK or `fetch` to call your new cloud function's endpoint.
    *   The function will securely call the Gemini API on the server and return the generated text to your app.

This backend approach ensures your API key is never exposed to the public.
