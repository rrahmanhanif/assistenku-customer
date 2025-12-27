// src/App.jsx
import React, { useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { supabase } from "./lib/supabase";
import useAuthGuard from "./hooks/useAuthGuard";

// Layout
import Layout from "./components/Layout";

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

  // Toast notifications
  const [notifications, setNotifications] = useState([]);
  const timeoutsRef = useRef(new Map());

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
  // REALTIME NOTIFICATION (Toast)
  // =====================================
  useEffect(() => {
    if (checking || !loggedIn) return;

    const customerId = localStorage.getItem("customer_id");
    if (!customerId) return;

    const unsubNotif = listenCustomerNotification(customerId, (notif) => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now() + Math.random());

      setNotifications((prev) => [...prev, { id, message: notif.message }]);

      const timeoutId = setTimeout(() => {
        setNotifications((prev) => prev.filter((item) => item.id !== id));
        timeoutsRef.current.delete(id);
      }, 5000);

      timeoutsRef.current.set(id, timeoutId);
    });

    return () => {
      try {
        unsubNotif.unsubscribe();
      } catch {}

      for (const t of timeoutsRef.current.values()) {
        clearTimeout(t);
      }
      timeoutsRef.current.clear();
    };
  }, [checking, loggedIn]);

  return (
    <>
      {/* Toast container */}
      <div
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          zIndex: 1000,
        }}
        aria-live="polite"
      >
        {notifications.map((item) => (
          <div
            key={item.id}
            style={{
              background: "#1e293b",
              color: "white",
              padding: "10px 14px",
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              minWidth: 220,
            }}
          >
            Pesan Baru: {item.message}
          </div>
        ))}
      </div>

      <Routes>
        {/* Protected Area */}
        <Route
          path="/"
          element={<ProtectedRoute loggedIn={loggedIn} checking={checking} />}
        >
          {/* Layout wrapper hanya sekali */}
          <Route element={<ProtectedShell />}>
            <Route index element={<Home />} />
            <Route path="services" element={<Services />} />

            <Route path="order/:orderId" element={<OrderDetail />} />
            <Route path="checkout/:orderId" element={<Checkout />} />

            <Route path="chat/:orderId" element={<Chat />} />
            <Route path="history" element={<History />} />
            <Route path="rating/:orderId" element={<Rating />} />
            <Route path="profile" element={<Profile />} />
            <Route path="track/:orderId" element={<TrackOrder />} />
          </Route>
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
    </>
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

/**
 * Shell untuk halaman protected:
 * - Membungkus semua halaman dengan Layout
 * - Set judul berdasarkan route
 */
function ProtectedShell() {
  const location = useLocation();
  const title = getTitleFromPath(location.pathname);

  return (
    <Layout title={title}>
      <Outlet />
    </Layout>
  );
}

function getTitleFromPath(pathname) {
  if (pathname === "/") return "Beranda";
  if (pathname.startsWith("/services")) return "Layanan";
  if (pathname.startsWith("/order/")) return "Detail Order";
  if (pathname.startsWith("/checkout/")) return "Checkout";
  if (pathname.startsWith("/chat/")) return "Chat";
  if (pathname.startsWith("/history")) return "Riwayat";
  if (pathname.startsWith("/rating/")) return "Rating";
  if (pathname.startsWith("/profile")) return "Profil";
  if (pathname.startsWith("/track/")) return "Lacak Pesanan";
  return "Assistenku";
}
