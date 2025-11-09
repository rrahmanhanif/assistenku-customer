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
