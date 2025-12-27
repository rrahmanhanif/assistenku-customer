import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { supabase } from "../lib/supabase";
import { clearCustomerStorage } from "../hooks/useAuthGuard";

export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      setProfile(data.user);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    clearCustomerStorage();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="p-6">
        <h2 className="text-2xl font-bold text-blue-700 mb-2">Profil</h2>

        {profile ? (
          <>
            <p>Email: {profile.email}</p>
            <p>ID: {profile.id}</p>

            <button
              onClick={handleLogout}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
            >
              Keluar
            </button>
          </>
        ) : (
          <p>Memuat...</p>
        )}
      </div>
    </div>
  );
}
