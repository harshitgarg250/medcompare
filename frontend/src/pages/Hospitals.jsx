import { useQuery } from '@tanstack/react-query'
import API from '../services/api'

function Hospitals() {
  const { data, isLoading } = useQuery({
    queryKey: ['hospitals'],
    queryFn: () => API.get('/hospitals').then(res => res.data)
  })

  if (isLoading) return (
    <div className="text-center py-20 text-gray-500">Loading hospitals...</div>
  )

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Nearby Hospitals</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.map(hospital => (
          <div
            key={hospital.id}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
          >
            <div className="text-2xl mb-2">🏥</div>
            <h3 className="font-bold text-gray-800 mb-1">{hospital.name}</h3>
            <p className="text-sm text-gray-500 mb-2">{hospital.type}</p>
            <p className="text-sm text-gray-500 mb-3">📍 {hospital.address}</p>
            <div className="flex justify-between items-center">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${hospital.isOpen ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {hospital.isOpen ? '🟢 Open' : '🔴 Closed'}
              </span>
              <span className="text-teal-600 font-bold text-sm">
                From ₹{hospital.tests[0]?.price || 'N/A'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Hospitals