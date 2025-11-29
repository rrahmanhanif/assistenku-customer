// src/modules/gpsTrackerCustomer.js

const firebaseConfig = {
  apiKey: "AIzaSyBSL87qkuwSQU8aXvLuu24nV7jUoX2mOSA",
  authDomain: "assistenku-8ef85.firebaseapp.com",
  projectId: "assistenku-8ef85",
  storageBucket: "assistenku-8ef85.appspot.com",
  messagingSenderId: "277608324630",
  appId: "1:277608324630:web:e923ef97876b092daff17c"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// SIMPAN GPS
export async function saveCustomerLocation(userId, lat, lng) {
  try {
    await setDoc(doc(db, "customer_locations", userId), {
      lat,
      lng,
      updatedAt: Date.now()
    });
    console.log("Location saved successfully");
  } catch (error) {
    console.error("Error saving location:", error);
  }
}

// AMBIL GPS
export async function getCustomerLocation(userId) {
  try {
    const snapshot = await getDoc(doc(db, "customer_locations", userId));
    if (snapshot.exists()) {
      return snapshot.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error reading location:", error);
    return null;
  }
}
