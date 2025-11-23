import { db } from "../firebase";
import { doc, updateDoc, setDoc } from "firebase/firestore";

export const startCustomerGPS = async (customerId, customerName) => {
  navigator.geolocation.watchPosition(
    async (pos) => {
      const data = {
        id: customerId,
        name: customerName,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "customer_locations", customerId), data, { merge: true });
    },
    (err) => {
      console.log("GPS Error:", err);
    },
    { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
  );
};
