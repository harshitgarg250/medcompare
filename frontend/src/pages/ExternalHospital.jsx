import { useLocation, useNavigate } from 'react-router-dom'

function ExternalHospital() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const h = state?.hospital

  if (!h) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🏥</div>
          <p className="text-gray-400">Hospital not found</p>
          <button
            onClick={() => navigate('/hospitals')}
            className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-xl"
          >
            Back to Hospitals
          </button>
        </div>
      </div>
    )
  }

  const name = h.tags?.name || 'Hospital'
  const type = h.tags?.amenity === 'hospital' ? 'Hospital' : h.tags?.amenity === 'clinic' ? 'Clinic' : 'Medical Center'
  const phone = h.tags?.phone || h.tags?.['contact:phone']
  const website = h.tags?.website || h.tags?.['contact:website']
  const street = h.tags?.['addr:street']
  const city = h.tags?.['addr:city']
  const emergency = h.tags?.emergency
  const lat = h.lat || h.center?.lat
  const lng = h.lon || h.center?.lon

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-100 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-teal-600 text-sm mb-4 flex items-center gap-1 transition"
          >
            ← Back to map
          </button>

          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
              🏥
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-800 mb-1">{name}</h1>
              <p className="text-gray-400 text-sm mb-3">{type}</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold">
                  📍 OpenStreetMap Data
                </span>
                {emergency === 'yes' && (
                  <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs font-bold">
                    🚨 Emergency Services
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* LEFT COLUMN */}
          <div className="md:col-span-2 space-y-4">

            {/* Contact Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Contact Info
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                {street ? (
                  <div className="flex gap-2">
                    <span>📍</span>
                    <span>{street}{city ? `, ${city}` : ''}</span>
                  </div>
                ) : null}
                {phone ? (
                  <div className="flex gap-2">
                    <span>📞</span>
                    <a href={`tel:${phone}`} className="text-teal-600 hover:underline">{phone}</a>
                  </div>
                ) : null}
                {website ? (
                  <div className="flex gap-2">
                    <span>🌐</span>
                    <a href={website} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">
                      Visit Website
                    </a>
                  </div>
                ) : null}
                {!street && !phone && !website && (
                  <p className="text-gray-400 text-sm">Contact details not available in OpenStreetMap</p>
                )}
              </div>
            </div>

            {/* Available Information */}
            {Object.keys(h.tags || {}).length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Available Information
                </div>
                <div className="divide-y divide-gray-50">
                  {Object.entries(h.tags || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm py-2">
                      <span className="text-gray-400 capitalize">
                        {key.replace(/_/g, ' ').replace('addr:', '')}
                      </span>
                      <span className="text-gray-700 font-medium text-right max-w-xs">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Find More Details */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Find More Details
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(name + ' hospital')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 bg-blue-50 text-blue-600 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-blue-100 transition"
                >
                  🔍 Search on Google
                </a>
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(name)}/@${lat},${lng},15z`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 bg-green-50 text-green-600 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-green-100 transition"
                >
                  🗺️ View on Google Maps
                </a>
                <a
                  href={`https://www.justdial.com/search?q=${encodeURIComponent(name)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 bg-orange-50 text-orange-600 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-orange-100 transition"
                >
                  📋 Search on JustDial
                </a>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">

            {/* Note */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="text-xs font-bold text-amber-600 mb-2">ℹ️ Note</div>
              <p className="text-xs text-amber-700 leading-relaxed">
                This hospital is from OpenStreetMap. To book appointments with price comparison, use MedCompare verified hospitals.
              </p>
            </div>

            {/* Navigation */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Navigation
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-blue-100 transition"
                >
                  🗺️ Get Directions
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-50 text-green-600 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-green-100 transition"
                >
                  🔍 View on Google Maps
                </a>
              </div>
            </div>

            {/* Book a Test */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Book a Test
              </div>
              <p className="text-xs text-gray-400 mb-3">
                Compare prices and book appointments at verified hospitals nearby
              </p>
              <button
                onClick={() => navigate('/hospitals')}
                className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 rounded-xl text-sm font-bold hover:opacity-90 transition"
              >
                Find Bookable Hospitals →
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default ExternalHospital