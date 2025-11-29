// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getFirestore
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBSL87qkuwSQU8aXvLuu24nV7jUoX2mOSA",
  authDomain: "assistenku-8ef85.firebaseapp.com",
  projectId: "assistenku-8ef85",
  storageBucket: "assistenku-8ef85.appspot.com",
  messagingSenderId: "550042793325",
  appId: "1:550042793325:web:deaf9c950e7e3f9534aabe"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
