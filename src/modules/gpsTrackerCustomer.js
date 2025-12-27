// src/modules/gpsTrackerCustomer.js

import { supabase } from "../lib/supabase";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "assistenku-customer.firebaseapp.com",
  projectId: "assistenku-customer",
  storageBucket: "assistenku-customer.firebasestorage.app",
  messagingSenderId: "1021599386974",
  appId: "1:1021599386974:web:7350342a375509707d93cf",
  measurementId: "G-813KN9V58E",
};

let firebaseLoader = null;

const loadFirebaseDb = async () => {
  if (firebaseLoader) return firebaseLoader;

  firebaseLoader = (async () => {
    if (typeof window === "undefined") return null;

    try {
      const [{ initializeApp }, firestore] = await Promise.all([
        import(
          /* @vite-ignore */ "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js"
        ),
        import(
          /* @vite-ignore */ "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js"
        ),
      ]);

      const app = initializeApp(firebaseConfig);
      const { getFirestore, doc, setDoc } = firestore;

      return { db: getFirestore(app), doc, setDoc };
    } catch (err) {
      console.warn("Firebase init failed", err);
      return null;
    }
  })();

  return firebaseLoader;
};

const sendToSupabase = async (payload) => {
  const { error } = await supabase
    .from("realtime_gps")
    .upsert(payload, { onConflict: "user_id" });

  if (error) throw error;
};

const sendToFirebase = async (payload) => {
  const firebase = await loadFirebaseDb();
  if (!firebase) return;

  const { db, doc, setDoc } = firebase;
  await setDoc(doc(db, "realtime_gps", payload.user_id), payload, { merge: true });
};

/**
 * Ambil data GPS dari database (untuk tracking mitra)
 */
export const getGpsLocation = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from("gps_tracking")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (error) {
      console.error("GPS Error:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("GPS Fetch Error:", err);
    return null;
  }
};

/**
 * Mulai GPS live tracking customer → realtime_gps table (Supabase + Firebase)
 */
export const startCustomerLiveGps = (
  customerId,
  customerName,
  { onStatusChange, onLocation } = {}
) => {
  if (!navigator.geolocation) {
    onStatusChange?.("Perangkat tidak mendukung GPS");
    console.error("Device tidak mendukung GPS");
    return null;
  }

  const updateStatus = (message) => {
    onStatusChange?.(message);
  };

  updateStatus("Meminta izin lokasi...");

  navigator.permissions?.query({ name: "geolocation" }).then((res) => {
    if (res.state === "denied") {
      updateStatus("Izin lokasi ditolak oleh browser");
    }
  });

  let lastSend = 0;

  const watchId = navigator.geolocation.watchPosition(
    async (pos) => {
      try {
        const now = Date.now();
        if (now - lastSend < 10000) return; // kirim setiap 10 detik
        lastSend = now;

        const { latitude, longitude } = pos.coords;

        const payload = {
          user_id: customerId,
          name: customerName,
          role: "customer",
          lat: latitude,
          lng: longitude,
          updated_at: new Date().toISOString(),
        };

        onLocation?.({ lat: latitude, lng: longitude });
        updateStatus("Tracking lokasi aktif");

        await Promise.all([
          sendToSupabase(payload),
          sendToFirebase(payload).catch((err) =>
            console.warn("Firebase GPS warning", err)
          ),
        ]);
      } catch (err) {
        updateStatus("Gagal mengirim lokasi");
        console.error("GPS UPDATE ERROR:", err);
      }
    },
    (err) => {
      if (err.code === err.PERMISSION_DENIED) {
        updateStatus("Akses lokasi ditolak pengguna");
      } else {
        updateStatus("Tidak dapat mengambil lokasi");
      }
      console.error("GPS ERROR:", err);
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
  );

  return {
    watchId,
    stop: () => stopCustomerLiveGps(watchId),
  };
};

/**
 * Stop GPS tracking
 */
export const stopCustomerLiveGps = (watchId) => {
  try {
    if (watchId && typeof navigator !== "undefined") {
      navigator.geolocation.clearWatch(watchId);
    }
  } catch (err) {
    console.error("STOP GPS ERROR:", err);
  }
};

/**
 * ALIAS untuk kompatibilitas dengan App.jsx
 * Agar tidak perlu edit file lain
 */
export const startCustomerGPS = startCustomerLiveGps;
