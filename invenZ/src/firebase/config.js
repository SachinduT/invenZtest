// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDrsEfQHC-oJgTCjbrqudpvbRChZ5zMCts",
  authDomain: "invenz-1e685.firebaseapp.com",
  projectId: "invenz-1e685",
  storageBucket: "invenz-1e685.firebasestorage.app",
  messagingSenderId: "822615039200",
  appId: "1:822615039200:web:5d527cde89586331824485",
  measurementId: "G-D8E136QKJV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;