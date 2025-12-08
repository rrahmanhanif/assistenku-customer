// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import TrackOrder from "./pages/TrackOrder";

import Chat from "./pages/Chat";
import History from "./pages/History";
import Rating from "./pages/Rating";
import Services from "./pages/Services"; // ✅ Tambahkan ini

import { listenCustomerNotification } from "./modules/notification";
import { startCustomerGPS } from "./modules/gpsTrackerCustomer";

export default function App() {
  const loggedIn = localStorage.getItem("customer_auth") === "true";

  // =====================================
  // AUTO START GPS CUSTOMER
  // =====================================
  useEffect(() => {
    if (!loggedIn) return;

    const customerId = localStorage.getItem("customer_id");
    const customerName = localStorage.getItem("customer_name");

    if (customerId && customerName) {
      startCustomerGPS(customerId, customerName);
    }
  }, [loggedIn]);

  // =====================================
  // NOTIFICATION LISTENER
  // =====================================
  useEffect(() => {
    if (!loggedIn) return;

    const customerId = localStorage.getItem("customer_id");
    if (!customerId) return;

    const unsubNotif = listenCustomerNotification(customerId, (notif) => {
      alert("Pesan baru dari Mitra: " + notif.message);
    });

    return () => {
      try {
        unsubNotif.unsubscribe();
      } catch {}
    };
  }, [loggedIn]);

  // =====================================
  // ROUTES
  // =====================================
  return (
    <Routes>
      {/* HOME */}
      <Route
        path="/"
        element={loggedIn ? <Home /> : <Navigate to="/login" />}
      />

      {/* SERVICES — LAYANAN */}
      <Route
        path="/services"
        element={loggedIn ? <Services /> : <Navigate to="/login" />}
      />

      {/* CHAT */}
      <Route
        path="/chat/:orderId"
        element={loggedIn ? <Chat /> : <Navigate to="/login" />}
      />

      {/* HISTORY */}
      <Route
        path="/history"
        element={loggedIn ? <History /> : <Navigate to="/login" />}
      />

      {/* RATING */}
      <Route
        path="/rating/:orderId"
        element={loggedIn ? <Rating /> : <Navigate to="/login" />}
      />

      {/* PROFILE */}
      <Route
        path="/profile"
        element={loggedIn ? <Profile /> : <Navigate to="/login" />}
      />

      {/* TRACK ORDER */}
      <Route
        path="/track/:orderId"
        element={loggedIn ? <TrackOrder /> : <Navigate to="/login" />}
      />

      {/* LOGIN */}
      <Route path="/login" element={<Login />} />
    </Routes>
  );
        }
