import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import API from '../services/api'
import GoogleAuthButton from '../components/GoogleAuthButton'
import useAuthStore from '../store/authStore'

function Register() {
  const navigate = useNavigate()
  const { login, user } = useAuthStore()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      navigate('/hospitals', { replace: true })
    }
  }, [navigate, user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await API.post('/auth/register', form)
      login(res.data.user, res.data.token)
      toast.success('Account created successfully!')
      navigate('/hospitals')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-md shadow-sm"
      >
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏥</div>
          <h1 className="text-2xl font-extrabold text-gray-800">Create Account</h1>
          <p className="text-gray-400 text-sm mt-1">Join MedCompare today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="Harshit Garg"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 text-gray-700 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="you@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 text-gray-700 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">
              Phone
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 text-gray-700 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 text-gray-700 text-sm"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 rounded-xl font-bold hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create Account →'}
          </motion.button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-100" />
          <span className="text-xs font-bold text-gray-300">OR</span>
          <div className="h-px flex-1 bg-gray-100" />
        </div>

        <GoogleAuthButton onSuccess={() => navigate('/hospitals')} />

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Register
