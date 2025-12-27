// src/components/Layout.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { clearCustomerStorage } from "../hooks/useAuthGuard";

const navItems = [
  { to: "/", label: "Beranda" },
  { to: "/services", label: "Layanan" },
  { to: "/history", label: "Pesanan" },
  { to: "/profile", label: "Profil" },
];

export default function Layout({ title, children }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }

    clearCustomerStorage();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="app-subtitle">Assistenku</p>
          <h1 className="app-title">{title || "Customer App"}</h1>
        </div>

        <button type="button" className="btn-ghost" onClick={handleLogout}>
          Keluar
        </button>
      </header>

      <main className="content-area">{children}</main>

      <nav className="bottom-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `bottom-nav__item ${isActive ? "bottom-nav__item--active" : ""}`
            }
            end={item.to === "/"}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
