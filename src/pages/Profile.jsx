import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Header from '../components/Header'

export default function Profile() {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    getProfile()
  }, [])

  async function getProfile() {
    const user = (await supabase.auth.getUser()).data.user
    if (user) setProfile(user)
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
          </>
        ) : (
          <p>Memuat...</p>
        )}
      </div>
    </div>
  )
}
