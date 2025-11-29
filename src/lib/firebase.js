// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "assistenku-customer.firebaseapp.com",
  projectId: "assistenku-customer",
  storageBucket: "assistenku-customer.firebasestorage.app",
  messagingSenderId: "1021599386974",
  appId: "1:1021599386974:web:7350342a375509707d93cf",
  measurementId: "G-813KN9V58E",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
