import { useState } from "react";
import { supabase } from "../lib/supabase";
import "../styles/login.css"; // Pastikan file ini ada

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Login gagal: " + error.message);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="login-container">
      <h2>Masuk ke Assistenku</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Masuk</button>
      </form>
    </div>
  );
}

export default Login;
