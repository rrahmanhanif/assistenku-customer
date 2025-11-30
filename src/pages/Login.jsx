import React, { useState } from "react";
import "../styles/login.css";
import { loginCustomer } from "../modules/authCustomer";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // HONEYPOT FIELD (bot biasanya selalu mengisi ini)
  const [hp, setHp] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    // Jika bot mengisi honeypot → langsung blok
    if (hp !== "") {
      alert("Bot terdeteksi. Login ditolak.");
      return;
    }

    if (!email || !password) {
      alert("Email dan password tidak boleh kosong!");
      return;
    }

    const result = await loginCustomer(email, password);

    if (result.success) {
      window.location.href = "/";
    } else {
      alert(result.message);
    }
  }

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>

        <h2>Login Customer</h2>

        <input
          type="email"
          placeholder="Email Anda"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password Anda"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* HONEYPOT — disembunyikan dari manusia */}
        <input
          type="text"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          style={{ display: "none" }}
        />

        <button type="submit">Masuk</button>
      </form>
    </div>
  );
}
