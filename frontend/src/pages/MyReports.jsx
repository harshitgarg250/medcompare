import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import API from '../services/api'

const statusColor = {
  COMPLETED: 'bg-green-100 text-green-700',
  PENDING: 'bg-amber-100 text-amber-700',
  PROCESSING: 'bg-blue-100 text-blue-700'
}

const riskColor = {
  LOW: 'text-green-600',
  MEDIUM: 'text-amber-600',
  HIGH: 'text-red-600'
}

export default function MyReports() {
  const navigate = useNavigate()

  const { data: reports, isLoading } = useQuery({
    queryKey: ['my-reports'],
    queryFn: () => API.get('/reports/my').then(r => r.data)
  })

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-3">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-5">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-extrabold text-gray-800">My Reports</h1>
          <p className="text-gray-400 text-xs mt-1">{reports?.length || 0} reports available</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {reports?.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="font-bold text-gray-700">No reports yet</h3>
            <p className="text-gray-400 text-sm mt-1">Book a test to get your reports</p>
            <button onClick={() => navigate('/hospitals')} className="mt-4 bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold">
              Find Hospitals →
            </button>
          </div>
        )}

        {reports?.map((report, i) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(`/reports/${report.reportId}`)}
            className="bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer hover:shadow-md hover:border-teal-200 transition"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-gray-800 text-sm">{report.test?.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{report.hospital?.name}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor[report.status] || 'bg-gray-100 text-gray-600'}`}>
                {report.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-gray-50 rounded-xl p-2 text-center">
                <div className="text-xs text-gray-400">Health Score</div>
                <div className="font-extrabold text-teal-600 text-lg">{report.healthScore || '--'}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-2 text-center">
                <div className="text-xs text-gray-400">Risk</div>
                <div className={`font-bold text-sm ${riskColor[report.riskLevel] || 'text-gray-600'}`}>
                  {report.riskLevel || '--'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-2 text-center">
                <div className="text-xs text-gray-400">Parameters</div>
                <div className="font-bold text-gray-700 text-sm">{report.results?.length || 0}</div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">
                {report.reportGeneratedAt ? new Date(report.reportGeneratedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pending'}
              </span>
              <span className="text-teal-600 text-xs font-bold">View Report →</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}