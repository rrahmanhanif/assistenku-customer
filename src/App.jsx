import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Profile from './pages/Profile'

export default function App() {
  const loggedIn = localStorage.getItem('customer_auth') === 'true'
  return (
    <Routes>
      <Route path="/" element={loggedIn ? <Home /> : <Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  )
}
import { useEffect } from "react";
import { startCustomerGPS } from "./modules/gpsTrackerCustomer";

export default function App() {
  useEffect(() => {
    const custId = "cust001";
    const custName = "Hanif Customer";
    startCustomerGPS(custId, custName);
  }, []);

  return <div>Halo Customer 👋, GPS sedang aktif...</div>;
}
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

const buatOrder = async () => {
  await addDoc(collection(db, "orders"), {
    orderId: "order" + Date.now(),
    customerId: "cust001",
    mitraId: "mitra001",
    serviceType: "Antar Barang",
    price: 100000,
    status: "Menunggu",
    createdAt: new Date().toISOString(),
  });
  alert("Order berhasil dibuat!");
};

export default function App() {
  return (
    <div>
      <h2>Customer App</h2>
      <button onClick={buatOrder}>Buat Order</button>
    </div>
  );
}
