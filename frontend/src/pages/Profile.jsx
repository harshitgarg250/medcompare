import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import API from '../services/api'
import useAuthStore from '../store/authStore'

export default function Profile() {
  const { user, login } = useAuthStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await API.put('/auth/profile', form)
      login(res.data.user, localStorage.getItem('token'))
      toast.success('Profile updated!')
    } catch {
      toast.error('Could not update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-teal-600 text-sm mb-3 flex items-center gap-1">
            ← Back
          </button>
          <h1 className="text-2xl font-extrabold text-gray-800">My Profile</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your account details</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">

        {/* Avatar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold shrink-0">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div className="font-extrabold text-gray-800 text-lg">{user?.name}</div>
            <div className="text-gray-400 text-sm">{user?.email}</div>
            <div className="bg-teal-50 text-teal-600 text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block">
              {user?.role || 'USER'}
            </div>
          </div>
        </motion.div>

        {/* Edit form */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Edit Profile</div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 text-sm text-gray-700"
                placeholder="Your name" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">Email</label>
              <input type="email" value={user?.email} disabled
                className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-400 bg-gray-50 cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">Phone Number</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 text-sm text-gray-700"
                placeholder="+91 98765 43210" />
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-60">
              {loading ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </form>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3">
          {[
            { label: 'Bookings', icon: '📋', action: () => navigate('/my-bookings') },
            { label: 'Reports', icon: '📄', action: () => navigate('/reports') },
            { label: 'Hospitals', icon: '🏥', action: () => navigate('/hospitals') },
          ].map(item => (
            <button key={item.label} onClick={item.action}
              className="bg-white rounded-2xl border border-gray-100 p-4 text-center hover:shadow-md hover:border-teal-200 transition">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-xs font-bold text-gray-600">{item.label}</div>
            </button>
          ))}
        </motion.div>

        {/* Account */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Account</div>
          <div className="text-sm text-gray-600 mb-4">
            Manage your profile details from here.
          </div>
          <button onClick={() => { useAuthStore.getState().logout(); navigate('/'); }}
            className="w-full bg-red-50 text-red-500 border border-red-100 py-3 rounded-xl font-bold text-sm hover:bg-red-100 transition">
            Logout
          </button>
        </motion.div>

      </div>
    </div>
  )
}