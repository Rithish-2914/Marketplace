import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: "AIzaSyAF_l2YivUIgSRxyo2Fs4FW-yI2pDOJH8g",
  authDomain: "swaphands-227b6.firebaseapp.com",
  projectId: "swaphands-227b6",
  storageBucket: "swaphands-227b6.firebasestorage.app",
  messagingSenderId: "375154627702",
  appId: "1:375154627702:web:e35f03a097c61301843b57",
  measurementId: "G-LS1M0ZSN7C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services and export them
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
