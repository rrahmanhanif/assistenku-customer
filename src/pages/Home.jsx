import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Header from '../components/Header'

export default function Home() {
  const [services, setServices] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data, error } = await supabase.from('orders').select('*')
    if (!error) setServices(data || [])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">Layanan Saya</h2>
        {services.length === 0 ? (
          <p className="text-gray-600">Belum ada layanan aktif.</p>
        ) : (
          <ul className="space-y-3">
            {services.map((s) => (
              <li key={s.id} className="p-3 bg-white rounded shadow">
                <strong>{s.title}</strong> — <span>{s.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
