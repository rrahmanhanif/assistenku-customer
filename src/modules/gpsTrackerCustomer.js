// src/modules/gpsTrackerCustomer.js
import { db } from "../firebase";
import {
  doc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

export async function updateCustomerGPS(uid, latitude, longitude) {
  try {
    await setDoc(
      doc(db, "customer_location", uid),
      {
        latitude,
        longitude,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  } catch (error) {
    console.error("GPS update failed:", error);
  }
}
