// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { supabase } from "./lib/supabase";
import { revealDeviceId } from "./lib/device";

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
      const storedDevice = localStorage.getItem("device_id");
      const deviceLocal = revealDeviceId(storedDevice) || storedDevice;
      const customerId = localStorage.getItem("customer_id");

      if (!deviceLocal || !customerId) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("device_id")
        .eq("id", customerId)
        .single();

      if (error) return;

      if (data && data.device_id !== deviceLocal) {
        alert(
          "Kami mendeteksi sesi lain aktif di perangkat berbeda. Demi keamanan, kami keluarkan sesi ini. Silakan login kembali di perangkat yang ingin digunakan."
        );
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

    const unsubscribe = listenCustomerNotification(customerId);
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [loggedIn]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={loggedIn ? <Home /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/profile"
        element={loggedIn ? <Profile /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/services"
        element={loggedIn ? <Services /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/checkout/:orderId"
        element={loggedIn ? <Checkout /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/track/:orderId"
        element={loggedIn ? <TrackOrder /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/chat/:orderId"
        element={loggedIn ? <Chat /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/history"
        element={loggedIn ? <History /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/rating/:orderId"
        element={loggedIn ? <Rating /> : <Navigate to="/login" replace />}
      />

      <Route
        path="*"
        element={<Navigate to={loggedIn ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}
