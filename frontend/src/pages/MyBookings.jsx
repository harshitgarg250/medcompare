import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import API from '../services/api'
import useAuthStore from '../store/authStore'

function MyBookings() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { data: bookings, isLoading, refetch } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => API.get('/bookings/my').then(res => res.data)
  })

  const handleCancel = async (id) => {
    try {
      await API.patch(`/bookings/${id}/cancel`)
      toast.success('Booking cancelled!')
      refetch()
    } catch (err) {
      toast.error('Could not cancel booking')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Please login first</h2>
          <button
            onClick={() => navigate('/login')}
            className="bg-teal-600 text-white px-6 py-3 rounded-xl font-bold mt-4"
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const statusColor = {
    CONFIRMED: 'bg-green-50 text-green-600',
    PENDING: 'bg-amber-50 text-amber-600',
    CANCELLED: 'bg-red-50 text-red-500',
    COMPLETED: 'bg-blue-50 text-blue-600',
  }

  const statusIcon = {
    CONFIRMED: '✅',
    PENDING: '⏳',
    CANCELLED: '❌',
    COMPLETED: '🎉',
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-100 px-6 py-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-extrabold text-gray-800">My Bookings</h1>
          <p className="text-sm text-gray-400 mt-1">
            {bookings?.length || 0} total appointments
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* EMPTY STATE */}
        {bookings?.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No bookings yet</h2>
            <p className="text-gray-400 mb-6">Book your first diagnostic test today</p>
            <button
              onClick={() => navigate('/hospitals')}
              className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-6 py-3 rounded-xl font-bold"
            >
              Find Hospitals →
            </button>
          </div>
        )}

        {/* BOOKINGS LIST */}
        <div className="space-y-4">
          {bookings?.map((booking, i) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-base">
                    {booking.hospital?.name}
                  </h3>
                  <p className="text-sm text-gray-400">{booking.test?.name}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor[booking.status]}`}>
                  {statusIcon[booking.status]} {booking.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 mb-1">Date</div>
                  <div className="text-sm font-semibold text-gray-700">
                    {booking.slot?.date
                      ? new Date(booking.slot.date).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })
                      : 'N/A'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 mb-1">Time</div>
                  <div className="text-sm font-semibold text-gray-700">
                    {booking.slot?.time || 'N/A'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 mb-1">Amount</div>
                  <div className="text-sm font-bold text-teal-600">
                    ₹{booking.totalPrice}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 mb-1">Booking ID</div>
                  <div className="text-sm font-semibold text-gray-700">
                    #{booking.id}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  📍 {booking.hospital?.address}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/hospitals/${booking.hospitalId}`)}
                    className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-xs font-medium hover:border-teal-400 hover:text-teal-600 transition"
                  >
                    View Hospital
                  </button>
                  {booking.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="bg-red-50 text-red-500 px-4 py-2 rounded-xl text-xs font-medium hover:bg-red-100 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MyBookings