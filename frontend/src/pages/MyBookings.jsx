import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import API from "../services/api";

const statusColor = {
  CONFIRMED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  PENDING: "bg-amber-100 text-amber-700",
};

const statusIcon = { CONFIRMED: "✅", CANCELLED: "❌", PENDING: "⏳" };

export default function MyBookings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => API.get("/bookings/my").then(r => r.data),
  });

  const handleCancel = async (id) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      await API.patch(`/bookings/${id}/cancel`);
      toast.success("Booking cancelled");
      queryClient.invalidateQueries(["my-bookings"]);
    } catch {
      toast.error("Could not cancel booking");
    }
  };

  const handleGenerateReport = async (bookingId) => {
    try {
      const res = await API.post(`/reports/auto-generate/${bookingId}`);
      toast.success("Report ready!");
      navigate(`/reports/${res.data.report.reportId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not generate report");
    }
  };

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
            <h1 className="text-2xl font-extrabold text-gray-800">My Bookings</h1>
            <p className="text-gray-400 text-sm mt-1">{bookings?.length || 0} total appointments</p>
          </div>
          <button onClick={() => navigate("/hospitals")}
            className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-teal-700 transition">
            + Book New Test
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {bookings?.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="font-bold text-gray-700 text-lg mb-2">No bookings yet</h3>
            <p className="text-gray-400 text-sm mb-6">Book a diagnostic test to see it here</p>
            <button onClick={() => navigate("/hospitals")}
              className="bg-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-700 transition">
              Find Hospitals →
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings?.map((booking, i) => {
            const slotDate = booking.slot?.date ? new Date(booking.slot.date) : null;
            const slotTime = booking.slot?.time || "9:00 AM";
            let reportAvailableAt = null;

            if (slotDate) {
              const [timePart, meridiem] = slotTime.split(" ");
              let [hours, minutes] = timePart.split(":").map(Number);
              if (meridiem === "PM" && hours !== 12) hours += 12;
              if (meridiem === "AM" && hours === 12) hours = 0;
              const testDateTime = new Date(slotDate);
              testDateTime.setHours(hours, minutes, 0, 0);
              reportAvailableAt = new Date(testDateTime.getTime() + 2 * 60 * 60 * 1000);
            }

            const now = new Date();
            const isTestDone = slotDate && slotDate < now;
            const isReportReady = reportAvailableAt && reportAvailableAt < now;
            const minutesLeft = reportAvailableAt ? Math.ceil((reportAvailableAt - now) / 60000) : 0;

            return (
              <motion.div key={booking.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition">

                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-xl shrink-0">🏥</div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm leading-tight">{booking.hospital?.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{booking.test?.name}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold shrink-0 ${statusColor[booking.status] || "bg-gray-100 text-gray-600"}`}>
                    {statusIcon[booking.status]} {booking.status}
                  </span>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <div className="text-xs text-gray-400 mb-0.5">Date</div>
                    <div className="text-xs font-bold text-gray-700">
                      {slotDate ? slotDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <div className="text-xs text-gray-400 mb-0.5">Time</div>
                    <div className="text-xs font-bold text-gray-700">{booking.slot?.time || "N/A"}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <div className="text-xs text-gray-400 mb-0.5">Amount</div>
                    <div className="text-sm font-extrabold text-teal-600">₹{booking.totalPrice}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <div className="text-xs text-gray-400 mb-0.5">Booking ID</div>
                    <div className="text-xs font-bold text-gray-700">#{booking.id}</div>
                  </div>
                </div>

                {/* Address */}
                <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                  <span>📍</span>
                  <span className="truncate">{booking.hospital?.address}</span>
                </p>

                {/* Action buttons */}
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => navigate(`/hospitals/${booking.hospitalId}`)}
                    className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-xs font-semibold hover:border-teal-400 hover:text-teal-600 transition">
                    View Hospital
                  </button>
                  {booking.status === "CONFIRMED" && !isTestDone && (
                    <button onClick={() => handleCancel(booking.id)}
                      className="flex-1 bg-red-50 text-red-500 py-2 rounded-xl text-xs font-semibold hover:bg-red-100 transition">
                      Cancel
                    </button>
                  )}
                </div>

                {/* Report button */}
                {booking.status === "CONFIRMED" && isTestDone && (
                  isReportReady ? (
                    <button onClick={() => handleGenerateReport(booking.id)}
                      className="w-full mt-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition">
                      📋 View Report
                    </button>
                  ) : (
                    <div className="w-full mt-2 bg-amber-50 border border-amber-200 text-amber-700 py-2.5 px-3 rounded-xl text-xs font-medium text-center">
                      ⏳ Report processing...
                      {minutesLeft > 0 && ` Ready in ~${minutesLeft < 60 ? `${minutesLeft} min` : `${Math.ceil(minutesLeft / 60)} hr`}`}
                    </div>
                  )
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}