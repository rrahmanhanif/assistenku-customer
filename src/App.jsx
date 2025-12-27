// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { supabase } from "./lib/supabase";
import useAuthGuard from "./hooks/useAuthGuard";

// Pages (Public)
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// Pages (Protected)
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import TrackOrder from "./pages/TrackOrder";
import Chat from "./pages/Chat";
import History from "./pages/History";
import Rating from "./pages/Rating";
import Services from "./pages/Services";
import Checkout from "./pages/Checkout";
import OrderDetail from "./pages/OrderDetail";

// Modules
import { listenCustomerNotification } from "./modules/notification";
import { startCustomerGPS } from "./modules/gpsTrackerCustomer";

export default function App() {
  const { loggedIn, checking } = useAuthGuard();

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
    if (checking || !loggedIn) return;

    const customerId = localStorage.getItem("customer_id");
    const customerName = localStorage.getItem("customer_name");

    if (customerId && customerName) {
      startCustomerGPS(customerId, customerName);
    }
  }, [checking, loggedIn]);

  // =====================================
  // REALTIME NOTIFICATION
  // =====================================
  useEffect(() => {
    if (checking || !loggedIn) return;

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
  }, [checking, loggedIn]);

  // =====================================
  // ROUTES
  // =====================================
  return (
    <Routes>
      {/* Protected Area */}
      <Route
        path="/"
        element={<ProtectedRoute loggedIn={loggedIn} checking={checking} />}
      >
        <Route index element={<Home />} />
        <Route path="services" element={<Services />} />

        {/* Perubahan sesuai patch lama */}
        <Route path="order/:orderId" element={<OrderDetail />} />
        <Route path="checkout/:orderId" element={<Checkout />} />

        <Route path="chat/:orderId" element={<Chat />} />
        <Route path="history" element={<History />} />
        <Route path="rating/:orderId" element={<Rating />} />
        <Route path="profile" element={<Profile />} />
        <Route path="track/:orderId" element={<TrackOrder />} />
      </Route>

      {/* Public Area */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to={loggedIn ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}

function ProtectedRoute({ loggedIn, checking }) {
  if (checking) {
    return <div className="p-6 text-center">Memeriksa sesi...</div>;
  }

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
