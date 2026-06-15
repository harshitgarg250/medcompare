import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import API from '../services/api'
import GoogleAuthButton from '../components/GoogleAuthButton'
import useAuthStore from '../store/authStore'

function Login() {
  const navigate = useNavigate()
  const { login, user } = useAuthStore()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetStep, setResetStep] = useState(1)
  const [resetLoading, setResetLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: ''
  })
  const [resetForm, setResetForm] = useState({
    email: '',
    otp: '',
    password: ''
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!resetForm.email) {
      toast.error('Please enter your registered email')
      return
    }

    setResetLoading(true)
    try {
      const res = await API.post('/auth/forgot-password', { email: resetForm.email })
      toast.success(res.data.message || 'Reset code sent')
      setResetStep(2)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send reset code')
    } finally {
      setResetLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (resetForm.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setResetLoading(true)
    try {
      const res = await API.post('/auth/reset-password', resetForm)
      login(res.data.user, res.data.token)
      toast.success('Password reset successful')
      setResetOpen(false)
      navigate('/hospitals')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not reset password')
    } finally {
      setResetLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      navigate('/hospitals', { replace: true })
    }
  }, [navigate, user])

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
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label className="text-xs font-semibold text-gray-500 block">Password</label>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => {
                    setResetOpen(true)
                    setResetStep(1)
                    setResetForm({ email: form.email, otp: '', password: '' })
                  }}
                  className="text-xs font-bold text-teal-600 hover:underline"
                >
                  Forgot Password?
                </button>
              )}
            </div>
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

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-100" />
          <span className="text-xs font-bold text-gray-300">OR</span>
          <div className="h-px flex-1 bg-gray-100" />
        </div>

        <GoogleAuthButton onSuccess={() => navigate('/hospitals')} />

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

      {resetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-gray-800">Reset Password</h2>
                <p className="mt-1 text-sm text-gray-400">
                  {resetStep === 1 ? 'Enter your email to receive a verification code.' : 'Enter the code and create a new password.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResetOpen(false)}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-500"
              >
                ✕
              </button>
            </div>

            {resetStep === 1 ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">Email Address</label>
                  <input
                    type="email"
                    required
                    value={resetForm.email}
                    onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })}
                    placeholder="you@email.com"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full rounded-xl bg-teal-600 py-3 text-sm font-bold text-white transition hover:bg-teal-700 disabled:opacity-60"
                >
                  {resetLoading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">Verification Code</label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={6}
                    value={resetForm.otp}
                    onChange={(e) => setResetForm({ ...resetForm, otp: e.target.value })}
                    placeholder="123456"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-lg font-extrabold tracking-[0.3em] outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">New Password</label>
                  <input
                    type="password"
                    required
                    value={resetForm.password}
                    onChange={(e) => setResetForm({ ...resetForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full rounded-xl bg-teal-600 py-3 text-sm font-bold text-white transition hover:bg-teal-700 disabled:opacity-60"
                >
                  {resetLoading ? 'Resetting...' : 'Reset Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setResetStep(1)}
                  className="w-full text-sm font-bold text-gray-400"
                >
                  Use a different email
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Login
