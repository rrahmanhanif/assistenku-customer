import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

export async function updateCustomerLocation(uid, lat, lng) {
await updateDoc(doc(db, "gps_customer", userId), {
  lat,
  lng,
  updatedAt: Date.now()
});
}
