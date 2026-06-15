import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import API from '../services/api'
import useAuthStore from '../store/authStore'

function MyBookings() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const {
    data: bookings = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => API.get('/bookings/my').then((res) => res.data),
    enabled: Boolean(user),
  })

  const handleCancel = async (id) => {
    try {
      await API.patch(`/bookings/${id}/cancel`)
      toast.success('Booking cancelled!')
      refetch()
    } catch {
      toast.error('Could not cancel booking')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Please login first
          </h2>
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const statusColor = {
    CONFIRMED: 'bg-green-50 text-green-600',
    PENDING: 'bg-yellow-50 text-yellow-600',
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            My Bookings
          </h1>
          <p className="text-gray-500 mt-2">
            View and manage your hospital test bookings
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              No bookings found
            </h2>
            <p className="text-gray-500 mb-6">
              You haven't booked any tests yet.
            </p>
            <button
              onClick={() => navigate('/hospitals')}
              className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold"
            >
              Browse Hospitals
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">
                      {booking.hospital?.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {booking.test?.name}
                    </p>
                  </div>

                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold shrink-0 ${
                      statusColor[booking.status]
                    }`}
                  >
                    {statusIcon[booking.status]} {booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <div className="text-xs text-gray-400 mb-0.5">
                      Date
                    </div>
                    <div className="text-xs font-semibold text-gray-700">
                      {booking.slot?.date
                        ? new Date(
                            booking.slot.date
                          ).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'N/A'}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <div className="text-xs text-gray-400 mb-0.5">
                      Time
                    </div>
                    <div className="text-xs font-semibold text-gray-700">
                      {booking.slot?.time || 'N/A'}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <div className="text-xs text-gray-400 mb-0.5">
                      Amount
                    </div>
                    <div className="text-sm font-bold text-teal-600">
                      ₹{booking.totalPrice}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <div className="text-xs text-gray-400 mb-0.5">
                      Booking ID
                    </div>
                    <div className="text-xs font-semibold text-gray-700">
                      #{booking.id}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400 truncate max-w-[140px]">
                    📍 {booking.hospital?.address}
                  </span>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() =>
                        navigate(`/hospitals/${booking.hospitalId}`)
                      }
                      className="border border-gray-200 text-gray-600 px-3 py-1.5 rounded-xl text-xs font-medium"
                    >
                      View
                    </button>

                    {booking.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="bg-red-50 text-red-500 px-3 py-1.5 rounded-xl text-xs font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyBookings
