// src/lib/firebaseClient.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDDw8VRXSvjGuMgKsEvbufLmXyGgI4hu7U",
  authDomain: "assistenku-customer.firebaseapp.com",
  projectId: "assistenku-customer",
  storageBucket: "assistenku-customer.firebasestorage.app",
  messagingSenderId: "1021599386974",
  appId: "1:1021599386974:web:7350342a375509707d93cf",
  measurementId: "G-813KN9V58E"
};

// Init
const app = initializeApp(firebaseConfig);

// Optional
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export const db = getFirestore(app);
export { app, analytics };
