import { useNavigate } from 'react-router-dom'

function Landing() {
  const navigate = useNavigate()

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-center">
      <h1 className="text-5xl font-bold text-gray-800 mb-4">
        Find Best Price for <span className="text-teal-600">Medical Tests</span>
      </h1>
      <p className="text-gray-500 text-lg mb-8">
        Compare hospitals, book appointments, save up to 60%
      </p>
      <button
        onClick={() => navigate('/hospitals')}
        className="bg-teal-600 text-white px-8 py-3 rounded-xl text-lg hover:bg-teal-700"
      >
        Find Hospitals →
      </button>
    </div>
  )
}

export default Landing