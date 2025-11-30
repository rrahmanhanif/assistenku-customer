import 'leaflet/dist/leaflet.css';
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import TrackOrder from "./pages/TrackOrder"; // fitur tracking MITRA

import { startCustomerGPS } from "./modules/gpsTrackerCustomer";

export default function App() {
  const loggedIn = localStorage.getItem("customer_auth") === "true";

  useEffect(() => {
    if (!loggedIn) return;

    // Ambil ID customer
    const customerId = localStorage.getItem("customer_id");
    const customerName = localStorage.getItem("customer_name");

    if (customerId && customerName) {
      // Aktifkan GPS customer
      startCustomerGPS(customerId, customerName);
    }
  }, [loggedIn]);

  return (
    <Routes>
      {/* HOME */}
      <Route
        path="/"
        element={loggedIn ? <Home /> : <Navigate to="/login" />}
      />
      <Route path="/chat/:orderId" element={<Chat />} />

      {/* LOGIN */}
      <Route path="/login" element={<Login />} />

      {/* PROFILE */}
      <Route
        path="/profile"
        element={loggedIn ? <Profile /> : <Navigate to="/login" />}
      />

      {/* TRACK MITRA */}
      <Route
        path="/track/:orderId"
        element={loggedIn ? <TrackOrder /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}
