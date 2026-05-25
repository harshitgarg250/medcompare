import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useState } from 'react'
import toast from 'react-hot-toast'
import API from '../services/api'
import useAuthStore from '../store/authStore'

function HospitalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [selectedTest, setSelectedTest] = useState(null)

  const { data: hospital, isLoading } = useQuery({
    queryKey: ['hospital', id],
    queryFn: () => API.get(`/hospitals/${id}`).then(res => res.data)
  })

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading hospital details...</p>
      </div>
    </div>
  )

  if (!hospital) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Hospital not found</p>
    </div>
  )

  const handleBook = () => {
    if (!user) {
      toast.error('Please login to book an appointment')
      navigate('/login')
      return
    }
    if (!selectedTest) {
      toast.error('Please select a test first')
      return
    }
    navigate(`/booking/${hospital.id}?testId=${selectedTest.testId}&price=${selectedTest.price}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-teal-600 text-sm mb-4 flex items-center gap-1 transition"
          >
            ← Back to results
          </button>

          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex gap-4 items-start">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                🏥
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-800 mb-1">
                  {hospital.name}
                </h1>
                <p className="text-gray-400 text-sm mb-3">{hospital.type}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-lg text-xs font-bold">
                    ⭐ {hospital.rating || 'New'}
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    hospital.isOpen
                      ? 'bg-green-50 text-green-600'
                      : 'bg-red-50 text-red-500'
                  }`}>
                    {hospital.isOpen ? '🟢 Open Now' : '🔴 Closed'}
                  </span>
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold">
                    📍 {hospital.city}
                  </span>
                </div>
              </div>
            </div>

            {/* BOOK BUTTON */}
            <div className="flex flex-col gap-2 min-w-[200px]">
              {selectedTest && (
                <div className="text-right">
                  <div className="text-xs text-gray-400">Selected test</div>
                  <div className="font-bold text-gray-700">{selectedTest.test?.name}</div>
                  <div className="text-2xl font-extrabold text-teal-600">₹{selectedTest.price}</div>
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleBook}
                className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition shadow-lg"
              >
                📅 Book Appointment
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* LEFT — Tests */}
        <div className="md:col-span-2 space-y-6">

          {/* TESTS & PRICING */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Tests & Pricing</h2>
              <p className="text-xs text-gray-400 mt-1">Select a test to book</p>
            </div>
            <div className="divide-y divide-gray-50">
              {hospital.tests?.map((t) => (
                <motion.div
                  key={t.id}
                  whileHover={{ backgroundColor: '#f0fdfa' }}
                  onClick={() => setSelectedTest(t)}
                  className={`px-6 py-4 flex justify-between items-center cursor-pointer transition ${
                    selectedTest?.id === t.id
                      ? 'bg-teal-50 border-l-4 border-teal-500'
                      : ''
                  }`}
                >
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">{t.test?.name}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      ⏱ {t.duration} &nbsp;·&nbsp; 📋 Report in {t.reportTime}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-teal-600 font-extrabold text-lg">₹{t.price}</div>
                    {selectedTest?.id === t.id && (
                      <div className="text-xs text-teal-500 font-medium">Selected ✓</div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* REVIEWS */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Patient Reviews</h2>
            </div>
            {hospital.reviews?.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-400 text-sm">
                No reviews yet — be the first to review!
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {hospital.reviews?.map((r) => (
                  <div key={r.id} className="px-6 py-4">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-sm text-gray-700">
                        {r.user?.name}
                      </span>
                      <span className="text-yellow-400 text-xs">
                        {'⭐'.repeat(r.rating)}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Info */}
        <div className="space-y-4">

          {/* CONTACT */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-800 mb-4">Contact Info</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex gap-2">
                <span>📍</span>
                <span>{hospital.address}, {hospital.city}</span>
              </div>
              {hospital.phone && (
                <div className="flex gap-2">
                  <span>📞</span>
                  <span>{hospital.phone}</span>
                </div>
              )}
              {hospital.email && (
                <div className="flex gap-2">
                  <span>✉️</span>
                  <span>{hospital.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* BADGES */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-800 mb-4">Highlights</h3>
            <div className="flex flex-wrap gap-2">
              {['NABL Accredited', 'Home Collection', 'Same Day Reports', 'Online Booking'].map(b => (
                <span key={b} className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-medium">
                  ✓ {b}
                </span>
              ))}
            </div>
          </div>

          {/* MINI MAP PLACEHOLDER */}
          <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl border border-gray-100 p-5 text-center">
            <div className="text-4xl mb-2">🗺️</div>
            <div className="text-sm font-semibold text-gray-700 mb-1">View on Map</div>
            <div className="text-xs text-gray-400 mb-3">
              {hospital.lat?.toFixed(4)}, {hospital.lng?.toFixed(4)}
            </div>
            <a
              href={`https://maps.google.com/?q=${hospital.lat},${hospital.lng}`}
              target="_blank"
              rel="noreferrer"
              className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-xs font-medium hover:border-teal-400 hover:text-teal-600 transition inline-block"
            >
              Open in Google Maps →
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}

export default HospitalDetail