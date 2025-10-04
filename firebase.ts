import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAF_l2YivUIgSRxyo2Fs4FW-yI2pDOJH8g",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "swaphands-227b6.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "swaphands-227b6",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "swaphands-227b6.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "375154627702",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:375154627702:web:e35f03a097c61301843b57",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-LS1M0ZSN7C"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
