// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { supabase } from "./lib/supabase";

// Pages
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import TrackOrder from "./pages/TrackOrder";
import Chat from "./pages/Chat";
import History from "./pages/History";
import Rating from "./pages/Rating";
import Services from "./pages/Services";
import Checkout from "./pages/Checkout";

// Modules
import { listenCustomerNotification } from "./modules/notification";
import { startCustomerGPS } from "./modules/gpsTrackerCustomer";

export default function App() {
  const loggedIn = localStorage.getItem("customer_auth") === "true";

  // =====================================
  // DEVICE LOCK — CEK PERANGKAT CUSTOMER
  // =====================================
  useEffect(() => {
    async function checkDevice() {
      const deviceLocal = localStorage.getItem("device_id");
      const customerId = localStorage.getItem("customer_id");

      if (!deviceLocal || !customerId) return;

      const { data } = await supabase
        .from("customers")
        .select("device_id")
        .eq("id", customerId)
        .single();

      if (data && data.device_id !== deviceLocal) {
        alert("Akun ini sedang digunakan di perangkat lain.");
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    checkDevice();
  }, []);

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
  // REALTIME NOTIFICATION
  // =====================================
  useEffect(() => {
    if (!loggedIn) return;

    const customerId = localStorage.getItem("customer_id");
    if (!customerId) return;

    const unsubNotif = listenCustomerNotification(customerId, (notif) => {
      alert("Pesan Baru: " + notif.message);
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
      <Route path="/" element={loggedIn ? <Home /> : <Navigate to="/login" />} />
      <Route path="/services" element={loggedIn ? <Services /> : <Navigate to="/login" />} />
      <Route path="/checkout/:serviceId" element={loggedIn ? <Checkout /> : <Navigate to="/login" />} />
      <Route path="/chat/:orderId" element={loggedIn ? <Chat /> : <Navigate to="/login" />} />
      <Route path="/history" element={loggedIn ? <History /> : <Navigate to="/login" />} />
      <Route path="/rating/:orderId" element={loggedIn ? <Rating /> : <Navigate to="/login" />} />
      <Route path="/profile" element={loggedIn ? <Profile /> : <Navigate to="/login" />} />
      <Route path="/track/:orderId" element={loggedIn ? <TrackOrder /> : <Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
      }
