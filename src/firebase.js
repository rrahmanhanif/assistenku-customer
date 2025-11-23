// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBSL87qkuwSQU8aXvLuu24nV7ju0X2moSA",
  authDomain: "assistenku-8ef85.firebaseapp.com",
  projectId: "assistenku-8ef85",
  storageBucket: "assistenku-8ef85.appspot.com",
  messagingSenderId: "86857076355",
  appId: "1:86857076355:web:82e784e4b7d3c1721c432f",
  measurementId: "G-F6FXZP6R2C"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
