import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { validatePhone } from "../utils/validator";

const submitLogin = async () => {
  if (!validatePhone(phone)) {
    alert("Nomor HP tidak valid");
    return;
  }

  // proses login lanjut…
};

let lastLogin = 0;

async function handleLogin(e) {
  e.preventDefault();

  const now = Date.now();
  if (now - lastLogin < 8000)
    return alert("Terlalu sering, coba lagi 8 detik");

  lastLogin = now;

  // ... lanjutan kode login kamu
}

  const handleLogin = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Login gagal.')
    else {
      localStorage.setItem('customer_auth', 'true')
      navigate('/')
    }
  }

  return (
    <div className="flex h-screen justify-center items-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-xl shadow-md w-80">
        <h2 className="text-2xl font-bold text-center mb-4 text-blue-600">Login Customer</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)}
          placeholder="Email" className="border w-full p-2 rounded mb-3" />
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)}
          placeholder="Password" className="border w-full p-2 rounded mb-3" />
        <button className="bg-blue-600 text-white w-full py-2 rounded">Masuk</button>
      </form>
    </div>
  )
}
