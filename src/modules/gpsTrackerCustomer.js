import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

export async function updateCustomerLocation(uid, lat, lng) {
  await setDoc(
    doc(db, "customer_locations", uid),
    { lat, lng, updatedAt: Date.now() },
    { merge: true }
  );
}
