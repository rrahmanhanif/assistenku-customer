// Import Firebase
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDDw8VRXSvjGuMgKsEvbufLmXyGgI4hu7U",
  authDomain: "assistenku-customer.firebaseapp.com",
  projectId: "assistenku-customer",
  storageBucket: "assistenku-customer.firebasestorage.app",
  messagingSenderId: "1021599386974",
  appId: "1:1021599386974:web:7350342a375509707d93cf",
  measurementId: "G-813KN9V58E"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
