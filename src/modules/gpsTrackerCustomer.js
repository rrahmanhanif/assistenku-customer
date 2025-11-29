// gpsTrackerCustomer.js
// MODULE UNTUK TRACKING POSISI CUSTOMER (AMAN UNTUK VERCEL)

// ------ FIREBASE SETUP ------
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDDw8VRXSvjGuMgKsEvbufLmXyGgI4hu7U",
  authDomain: "assistenku-customer.firebaseapp.com",
  projectId: "assistenku-customer",
  storageBucket: "assistenku-customer.firebasestorage.app",
  messagingSenderId: "1021599386974",
  appId: "1:1021599386974:web:7350342a375509707d93cf",
  measurementId: "G-813KN9V58E"
};

let firebaseApp = null;

export function initFirebase() {
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
  }
  return firebaseApp;
}

// ------ SUPABASE SETUP ------
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vptfubypmfafrnmwweyj.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ------ FUNGSI GPS ------
export function startCustomerGPS(customerId) {
  initFirebase();

  if (!navigator.geolocation) {
    console.error("GPS tidak didukung perangkat.");
    return;
  }

  navigator.geolocation.watchPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      console.log("Customer position:", lat, lon);

      await supabase
        .from("customer_tracking")
        .upsert({
          customer_id: customerId,
          latitude: lat,
          longitude: lon,
          updated_at: new Date().toISOString()
        });
    },
    (err) => {
      console.error("GPS Error:", err);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000
    }
  );
}
