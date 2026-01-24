// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { supabase } from "./lib/supabase";
import { revealDeviceId } from "./lib/device";
import CustomerGate from "./components/CustomerGate";

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
    revealDeviceId();
  }, []);

  useEffect(() => {
    if (!loggedIn) return;

    // Keep Supabase session alive if needed
    const session = supabase?.auth?.session?.();
    if (session?.access_token) {
      localStorage.setItem("customer_access_token", session.access_token);
    }

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
        element={
          loggedIn ? (
            <CustomerGate>
              <Home />
            </CustomerGate>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/order/new"
        element={
          loggedIn ? (
            <CustomerGate>
              <CreateOrder />
            </CustomerGate>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/orders"
        element={
          loggedIn ? (
            <CustomerGate>
              <Orders />
            </CustomerGate>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/orders/:orderId"
        element={
          loggedIn ? (
            <CustomerGate>
              <OrderDetail />
            </CustomerGate>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/invoices"
        element={
          loggedIn ? (
            <CustomerGate>
              <Invoices />
            </CustomerGate>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/disputes"
        element={
          loggedIn ? (
            <CustomerGate>
              <Disputes />
            </CustomerGate>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/payments"
        element={
          loggedIn ? (
            <CustomerGate>
              <Payments />
            </CustomerGate>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/help"
        element={
          loggedIn ? (
            <CustomerGate>
              <Help />
            </CustomerGate>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/profile"
        element={
          loggedIn ? (
            <CustomerGate>
              <Profile />
            </CustomerGate>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/services"
        element={
          loggedIn ? (
            <CustomerGate>
              <Services />
            </CustomerGate>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/checkout/:orderId"
        element={
          loggedIn ? (
            <CustomerGate>
              <Checkout />
            </CustomerGate>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/track/:orderId"
        element={
          loggedIn ? (
            <CustomerGate>
              <TrackOrder />
            </CustomerGate>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/chat/:orderId"
        element={
          loggedIn ? (
            <CustomerGate>
              <Chat />
            </CustomerGate>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/history"
        element={
          loggedIn ? (
            <CustomerGate>
              <History />
            </CustomerGate>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/rating/:orderId"
        element={
          loggedIn ? (
            <CustomerGate>
              <Rating />
            </CustomerGate>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to={loggedIn ? "/" : "/login"} replace />} />
    </Routes>
  );
}
