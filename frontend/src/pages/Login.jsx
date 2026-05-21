import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import API from '../services/api'
import useAuthStore from '../store/authStore'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await API.post('/auth/login', form)
      login(res.data.user, res.data.token)
      toast.success('Login successful!')
      navigate('/hospitals')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Sign In</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          className="border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-teal-500"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-teal-500"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          type="submit"
          className="bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700"
        >
          Sign In
        </button>
      </form>
    </div>
  )
}

export default Login