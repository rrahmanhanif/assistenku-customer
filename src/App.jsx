// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { supabase } from "./lib/supabase";
import { revealDeviceId } from "./lib/device";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import TrackOrder from "./pages/TrackOrder";
import Chat from "./pages/Chat";
import History from "./pages/History";
import Rating from "./pages/Rating";
import Services from "./pages/Services";
import Checkout from "./pages/Checkout";
import OrderDetail from "./pages/OrderDetail";
import Orders from "./pages/Orders";
import Payments from "./pages/Payments";
import Help from "./pages/Help";
import CreateOrder from "./pages/CreateOrder";
import Invoices from "./pages/Invoices";
import Disputes from "./pages/Disputes";

import { listenCustomerNotification } from "./modules/notification";
import { startCustomerGPS } from "./modules/gpsTrackerCustomer";

export default function App() {
  const loggedIn = localStorage.getItem("customer_auth") === "true";

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

  useEffect(() => {
    if (!loggedIn) return;

    const customerId = localStorage.getItem("customer_id");
    const customerName = localStorage.getItem("customer_name");

    if (customerId && customerName) {
      startCustomerGPS(customerId, customerName);
    }
  }, [loggedIn]);

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
        path="/order/new"
        element={loggedIn ? <CreateOrder /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/orders"
        element={loggedIn ? <Orders /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/orders/:orderId"
        element={loggedIn ? <OrderDetail /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/invoices"
        element={loggedIn ? <Invoices /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/disputes"
        element={loggedIn ? <Disputes /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/payments"
        element={loggedIn ? <Payments /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/help"
        element={loggedIn ? <Help /> : <Navigate to="/login" replace />}
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
