import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useRef } from 'react'
import API from '../services/api'

const statusBadge = {
  NORMAL: 'bg-green-100 text-green-700',
  HIGH: 'bg-red-100 text-red-700',
  LOW: 'bg-blue-100 text-blue-700',
  CRITICAL: 'bg-red-200 text-red-800 font-extrabold'
}

const trendIcon = {
  IMPROVED: '📈 Improved',
  STABLE: '➡️ Stable',
  WORSENED: '📉 Worsened'
}

const riskBg = {
  LOW: 'bg-green-50 border-green-200 text-green-700',
  MEDIUM: 'bg-amber-50 border-amber-200 text-amber-700',
  HIGH: 'bg-red-50 border-red-200 text-red-700'
}

export default function ReportDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const printRef = useRef()

  const { data: report, isLoading } = useQuery({
    queryKey: ['report', id],
    queryFn: () => API.get(`/reports/${id}`).then(r => r.data)
  })

  const handlePrint = () => window.print()

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-3xl mb-2">📋</div>
        <p className="text-gray-400 text-sm">Loading report...</p>
      </div>
    </div>
  )

  if (!report) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-3xl mb-2">❌</div>
        <p className="text-gray-600 font-bold">Report not found</p>
        <button onClick={() => navigate('/reports')} className="mt-3 text-teal-600 text-sm">← Back to Reports</button>
      </div>
    </div>
  )

  const abnormal = report.results?.filter(r => r.status !== 'NORMAL') || []

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .print-card { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
        }
      `}</style>

      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 no-print">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-teal-600 text-sm flex items-center gap-1">
            ← Back
          </button>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-gray-200 transition"
            >
              🖨️ Print
            </button>
            <button
              onClick={() => {
                const url = window.location.href
                navigator.clipboard.writeText(url)
                alert('Report link copied!')
              }}
              className="flex items-center gap-1.5 bg-teal-50 text-teal-600 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-teal-100 transition"
            >
              🔗 Share
            </button>
          </div>
        </div>
      </div>

      <div ref={printRef} className="max-w-3xl mx-auto px-4 py-5 space-y-4">

        {/* Report Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl p-5 text-white print-card"
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs opacity-70 mb-1">🏥 {report.hospital?.name}</div>
              <h1 className="text-xl font-extrabold mb-1">{report.test?.name}</h1>
              <div className="text-xs opacity-80">Report ID: {report.reportId}</div>
            </div>
            <div className="text-right">
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${report.status === 'COMPLETED' ? 'bg-green-400 text-white' : 'bg-amber-400 text-white'}`}>
                {report.status}
              </div>
              <div className="text-xs opacity-70 mt-2">
                {report.reportGeneratedAt ? new Date(report.reportGeneratedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '--'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Patient + Lab Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Patient */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 p-4 print-card"
          >
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Patient Info</div>
            <div className="space-y-2">
              {[
                { label: 'Name', value: report.user?.name },
                { label: 'Email', value: report.user?.email },
                { label: 'Phone', value: report.user?.phone || '--' },
                { label: 'Sample Type', value: report.sampleType },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-xs py-1 border-b border-gray-50">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="text-gray-700 font-medium text-right max-w-[160px] truncate">{item.value || '--'}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Lab */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="bg-white rounded-2xl border border-gray-100 p-4 print-card"
          >
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Lab Info</div>
            <div className="space-y-2">
              {[
                { label: 'Lab', value: report.hospital?.name },
                { label: 'Doctor', value: report.doctorName },
                { label: 'Technician', value: report.technicianName },
                { label: 'NABL', value: '✅ Accredited' },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-xs py-1 border-b border-gray-50">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="text-gray-700 font-medium">{item.value || '--'}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sample Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 p-4 print-card"
        >
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Sample Timeline</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Collected', date: report.sampleCollectedAt },
              { label: 'Received', date: report.sampleReceivedAt },
              { label: 'Generated', date: report.reportGeneratedAt },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                <div className="text-xs text-gray-400 mb-1">{item.label}</div>
                <div className="text-xs font-bold text-gray-700">
                  {item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '--'}
                </div>
                <div className="text-xs text-gray-400">
                  {item.date ? new Date(item.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--'}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Health Score + Risk */}
        {(report.healthScore || report.riskLevel) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center print-card">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Health Score</div>
              <div className="text-4xl font-extrabold text-teal-600">{report.healthScore || '--'}</div>
              <div className="text-xs text-gray-400 mt-1">out of 100</div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${report.healthScore || 0}%` }}
                />
              </div>
            </div>
            <div className={`rounded-2xl border p-4 text-center print-card ${riskBg[report.riskLevel] || 'bg-gray-50 border-gray-200 text-gray-700'}`}>
              <div className="text-xs font-bold uppercase tracking-widest mb-2 opacity-70">Risk Level</div>
              <div className="text-2xl mb-1">
                {report.riskLevel === 'LOW' ? '✅' : report.riskLevel === 'MEDIUM' ? '⚠️' : '🚨'}
              </div>
              <div className="text-xl font-extrabold">{report.riskLevel || '--'}</div>
              <div className="text-xs opacity-70 mt-1">Risk Assessment</div>
            </div>
          </motion.div>
        )}

        {/* Test Results */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden print-card"
        >
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Test Results</div>
            {abnormal.length > 0 && (
              <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {abnormal.length} Abnormal
              </span>
            )}
          </div>

          {/* Header row */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 text-xs font-bold text-gray-400 uppercase">
            <div className="col-span-4">Parameter</div>
            <div className="col-span-2 text-center">Value</div>
            <div className="col-span-2 text-center">Unit</div>
            <div className="col-span-2 text-center">Range</div>
            <div className="col-span-2 text-center">Status</div>
          </div>

          <div className="divide-y divide-gray-50">
            {report.results?.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className={`grid grid-cols-12 gap-2 px-4 py-3 items-center text-xs ${r.status !== 'NORMAL' ? 'bg-red-50' : ''}`}
              >
                <div className="col-span-4 font-medium text-gray-700">
                  {r.parameterName}
                  {r.previousValue && (
                    <div className="text-gray-400 text-xs mt-0.5">
                      Prev: {r.previousValue} {r.trend && <span className="text-xs">{trendIcon[r.trend]}</span>}
                    </div>
                  )}
                </div>
                <div className={`col-span-2 text-center font-bold ${r.status !== 'NORMAL' ? 'text-red-600' : 'text-gray-800'}`}>
                  {r.value}
                </div>
                <div className="col-span-2 text-center text-gray-400">{r.unit || '--'}</div>
                <div className="col-span-2 text-center text-gray-400">{r.referenceRange || '--'}</div>
                <div className="col-span-2 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusBadge[r.status] || 'bg-gray-100 text-gray-600'}`}>
                    {r.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Abnormal Insights */}
        {abnormal.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-4 print-card"
          >
            <div className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-3">
              ⚠️ Abnormal Values — Health Insights
            </div>
            <div className="space-y-3">
              {abnormal.map(r => (
                <div key={r.id} className="bg-white rounded-xl p-3 border border-amber-100">
                  <div className="font-bold text-gray-800 text-xs mb-1">{r.parameterName}</div>
                  <div className="text-xs text-gray-600 mb-1">
                    Value: <span className="font-bold text-red-600">{r.value} {r.unit}</span>
                    {r.referenceRange && <span className="text-gray-400"> (Normal: {r.referenceRange})</span>}
                  </div>
                  <div className="text-xs text-gray-500">
                    {r.status === 'HIGH'
                      ? '📊 Value is above normal range. Please consult your doctor.'
                      : r.status === 'LOW'
                      ? '📉 Value is below normal range. Please consult your doctor.'
                      : '⚠️ Critical value detected. Immediate medical attention recommended.'}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Follow-up */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="bg-white rounded-2xl border border-gray-100 p-4 print-card"
        >
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            📅 Follow-up Recommendations
          </div>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-teal-500 shrink-0">✓</span>
              <span>Repeat this test after 3 months for tracking</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-teal-500 shrink-0">✓</span>
              <span>Consult a General Physician if values remain abnormal</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-teal-500 shrink-0">✓</span>
              <span>Maintain a healthy diet, regular exercise and adequate sleep</span>
            </div>
            {report.notes && (
              <div className="flex items-start gap-2">
                <span className="text-teal-500 shrink-0">📝</span>
                <span>{report.notes}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Doctor Signature */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl border border-gray-100 p-4 print-card"
        >
          <div className="flex justify-between items-end">
            <div>
              <div className="text-xs text-gray-400 mb-1">Verified by</div>
              <div className="font-bold text-gray-800 text-sm">{report.doctorName}</div>
              <div className="text-xs text-gray-400">{report.hospital?.name}</div>
              <div className="text-xs text-teal-600 mt-1">✅ NABL Accredited Lab</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-1">Report ID</div>
              <div className="font-mono text-xs font-bold text-gray-600">{report.reportId}</div>
              <div className="text-xs text-gray-400 mt-1">Scan to verify</div>
              <div className="text-2xl mt-1">📱</div>
            </div>
          </div>
        </motion.div>

        {/* Action buttons */}
        <div className="flex gap-3 no-print pb-6">
          <button
            onClick={handlePrint}
            className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 rounded-xl text-sm font-bold hover:opacity-90 transition"
          >
            🖨️ Print / Save PDF
          </button>
          <button
            onClick={() => navigate('/hospitals')}
            className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-bold hover:border-teal-400 transition"
          >
            Book Another Test
          </button>
        </div>
      </div>
    </div>
  )
}