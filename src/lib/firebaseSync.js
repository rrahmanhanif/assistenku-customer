// src/lib/firebaseSync.js
import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

export async function saveCustomerToFirebase(id, data) {
  return await setDoc(
    doc(db, "customers", id),
    data,
    { merge: true }
  );
}
