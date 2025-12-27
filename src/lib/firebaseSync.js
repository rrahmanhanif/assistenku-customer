// src/lib/firebaseSync.js
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "assistenku-customer.firebaseapp.com",
  projectId: "assistenku-customer",
  storageBucket: "assistenku-customer.firebasestorage.app",
  messagingSenderId: "1021599386974",
  appId: "1:1021599386974:web:7350342a375509707d93cf",
  measurementId: "G-813KN9V58E",
};

let firebaseDbPromise = null;

async function loadFirebase() {
  if (firebaseDbPromise) return firebaseDbPromise;

  firebaseDbPromise = (async () => {
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
      console.warn("Firebase tidak dapat dimuat", err);
      return null;
    }
  })();

  return firebaseDbPromise;
}

export async function saveCustomerToFirebase(id, data) {
  const firebase = await loadFirebase();
  if (!firebase) return null;

  const { db, doc, setDoc } = firebase;
  return await setDoc(doc(db, "customers", id), data, { merge: true });
}
