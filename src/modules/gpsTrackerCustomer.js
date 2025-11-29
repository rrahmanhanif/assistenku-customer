import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export async function updateCustomerLocation(uid, lat, lng) {
  await setDoc(
    doc(db, "customer_locations", uid),
    { lat, lng, updatedAt: Date.now() },
    { merge: true }
  );
}
