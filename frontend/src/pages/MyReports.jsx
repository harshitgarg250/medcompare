import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";

const statusColor = {
  COMPLETED: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  PROCESSING: "bg-blue-100 text-blue-700",
};

const riskColor = {
  LOW: "text-green-600 bg-green-50",
  MEDIUM: "text-amber-600 bg-amber-50",
  HIGH: "text-red-600 bg-red-50",
};

export default function MyReports() {
  const navigate = useNavigate();

  const { data: reports, isLoading } = useQuery({
    queryKey: ["my-reports"],
    queryFn: () => API.get("/reports/my").then(r => r.data),
  });

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 animate-pulse border border-gray-100">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">My Reports</h1>
            <p className="text-gray-400 text-sm mt-1">{reports?.length || 0} reports available</p>
          </div>
          <button onClick={() => navigate("/hospitals")}
            className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-teal-700 transition">
            Book New Test
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {reports?.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="font-bold text-gray-700 text-lg mb-2">No reports yet</h3>
            <p className="text-gray-400 text-sm mb-6">Book a test to get your digital reports</p>
            <button onClick={() => navigate("/hospitals")}
              className="bg-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-700 transition">
              Find Hospitals →
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports?.map((report, i) => (
            <motion.div key={report.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/reports/${report.reportId}`)}
              className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:shadow-lg hover:border-teal-200 transition group">

              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-xl shrink-0">📋</div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm group-hover:text-teal-600 transition">{report.test?.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{report.hospital?.name}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor[report.status] || "bg-gray-100 text-gray-600"}`}>
                  {report.status}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                  <div className="text-xs text-gray-400 mb-1">Score</div>
                  <div className="font-extrabold text-teal-600 text-lg">{report.healthScore || "--"}</div>
                </div>
                <div className={`rounded-xl p-2.5 text-center ${riskColor[report.riskLevel] || "bg-gray-50 text-gray-600"}`}>
                  <div className="text-xs opacity-70 mb-1">Risk</div>
                  <div className="font-bold text-sm">{report.riskLevel || "--"}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                  <div className="text-xs text-gray-400 mb-1">Tests</div>
                  <div className="font-bold text-gray-700 text-sm">{report.results?.length || 0}</div>
                </div>
              </div>

              {/* Results preview */}
              {report.results?.some(r => r.status !== "NORMAL") && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-3">
                  <p className="text-xs text-red-600 font-semibold">
                    ⚠️ {report.results.filter(r => r.status !== "NORMAL").length} abnormal value(s)
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  {report.reportGeneratedAt
                    ? new Date(report.reportGeneratedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                    : "Pending"}
                </span>
                <span className="text-teal-600 text-xs font-bold group-hover:underline">View Report →</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}