import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import API from '../services/api'
import useAuthStore from '../store/authStore'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: ''
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

 const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)

  // VALIDATION
  if (!isLogin) {
    if (form.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters')
      setLoading(false)
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error('Please enter a valid email address')
      setLoading(false)
      return
    }
    if (!/^\d{10}$/.test(form.phone)) {
      toast.error('Phone number must be 10 digits')
      setLoading(false)
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      setLoading(false)
      return
    }
  } else {
    if (!form.email || !form.password) {
      toast.error('Please fill all fields')
      setLoading(false)
      return
    }
  }

  try {
      if (isLogin) {
        const res = await API.post('/auth/login', {
          email: form.email,
          password: form.password
        })
        login(res.data.user, res.data.token)
        toast.success('Welcome back! 👋')
        navigate('/hospitals')
      } else {
        const res = await API.post('/auth/register', {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password
        })
        login(res.data.user, res.data.token)
        toast.success('Account created! 🎉')
        navigate('/hospitals')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md p-8"
      >
        {/* LOGO */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🏥</div>
          <h1 className="text-2xl font-extrabold text-gray-800">MedCompare</h1>
          <p className="text-gray-400 text-sm mt-1">
            {isLogin ? 'Sign in to your account' : 'Create your free account'}
          </p>
        </div>

        {/* TAB SWITCH */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
              isLogin
                ? 'bg-white text-teal-600 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
              !isLogin
                ? 'bg-white text-teal-600 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Register
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Harshit Garg"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@email.com"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="9876543210"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3.5 rounded-xl font-bold text-sm hover:opacity-90 transition shadow-lg mt-2 disabled:opacity-60"
          >
            {loading ? '⏳ Please wait...' : isLogin ? 'Sign In →' : 'Create Account →'}
          </motion.button>
        </form>

        {/* SWITCH LINK */}
        <p className="text-center text-sm text-gray-400 mt-6">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-teal-600 font-semibold hover:underline"
          >
            {isLogin ? 'Register here' : 'Sign in'}
          </button>
        </p>
      </motion.div>
    </div>
  )
}

export default Login