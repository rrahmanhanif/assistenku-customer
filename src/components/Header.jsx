import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const navigate = useNavigate()
  const logout = () => {
    localStorage.removeItem('customer_auth')
    navigate('/login')
  }

  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
      <h1 className="text-lg font-semibold">Assistenku Customer</h1>
      <button
        onClick={logout}
        className="bg-white text-blue-600 px-3 py-1 rounded-lg hover:bg-gray-100"
      >
        Logout
      </button>
    </header>
  )
}
