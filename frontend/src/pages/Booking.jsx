import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import API from "../services/api";
import useAuthStore from "../store/authStore";

const TIMES = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
];

function Booking() {
  const { hospitalId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const testId = searchParams.get("testId");
  const price = searchParams.get("price");

  const [step, setStep] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState("UPI / Card");
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [bookedTimes, setBookedTimes] = useState([]);

  const { data: hospital } = useQuery({
    queryKey: ["hospital", hospitalId],
    queryFn: () => API.get(`/hospitals/${hospitalId}`).then((res) => res.data),
  });

  const selectedTest = hospital?.tests?.find(
    (t) => t.testId === parseInt(testId),
  );

  // Date change hone pe booked slots fetch karo
  useEffect(() => {
    if (selectedDate && hospitalId && testId) {
      API.get(
        `/slots?hospitalId=${hospitalId}&date=${selectedDate}&testId=${testId}`,
      )
        .then((res) => {
          const booked = res.data.filter((s) => s.isBooked).map((s) => s.time);
          setBookedTimes(booked);
          if (booked.includes(selectedTime)) {
            setSelectedTime(null);
            toast.error("Your selected time is booked. Please choose another.");
          }
        })
        .catch(() => {});
    }
  }, [selectedDate, hospitalId, testId, selectedTime]);

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select date and time");
      return;
    }
    setLoading(true);
    try {
      // Slot banao
      await API.post("/slots", {
        hospitalId: parseInt(hospitalId),
        date: selectedDate,
        times: [selectedTime],
        testId: parseInt(testId),
      });

      // Naya slot fetch karo
      const slotsRes = await API.get(
        `/slots?hospitalId=${hospitalId}&date=${selectedDate}&testId=${testId}`,
      );

      // Available slot dhundo same time ka
      const newSlot = slotsRes.data.find(
        (s) => s.time === selectedTime && !s.isBooked,
      );

      if (!newSlot) {
        toast.error("Slot not available, please select another time");
        setLoading(false);
        return;
      }

      // Booking karo
      const bookingRes = await API.post("/bookings", {
        hospitalId: parseInt(hospitalId),
        testId: parseInt(testId),
        slotId: newSlot.id,
        totalPrice: parseFloat(price),
        notes,
      });

      setBookingId(bookingRes.data.booking.id);
      setStep(3);
      toast.success("Booking confirmed!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-teal-600 text-sm mb-4 flex items-center gap-1"
          >
            ← Back
          </button>
          <h1 className="text-xl font-extrabold text-gray-800">
            Book Appointment
          </h1>
          <p className="text-sm text-gray-400">{hospital?.name}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* STEPS */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
                  step >= s
                    ? "bg-teal-600 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {step > s ? "✓" : s}
              </div>
              <span
                className={`text-xs font-medium ${
                  step >= s ? "text-teal-600" : "text-gray-400"
                }`}
              >
                {s === 1 ? "Details" : s === 2 ? "Payment" : "Confirmed"}
              </span>
              {i < 2 && (
                <div
                  className={`flex-1 h-0.5 ${
                    step > s ? "bg-teal-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* STEP 1 — Details */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* ORDER SUMMARY */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Order Summary
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Hospital</span>
                <span className="text-sm font-semibold text-gray-800">
                  {hospital?.name}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Test</span>
                <span className="text-sm font-semibold text-gray-800">
                  {selectedTest?.test?.name}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Duration</span>
                <span className="text-sm text-gray-600">
                  {selectedTest?.duration}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Report Time</span>
                <span className="text-sm text-gray-600">
                  {selectedTest?.reportTime}
                </span>
              </div>
              <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-800">Total</span>
                <span className="text-2xl font-extrabold text-teal-600">
                  ₹{price}
                </span>
              </div>
            </div>

            {/* DATE */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Select Date
              </div>
              <input
                type="date"
                min={today}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime(null);
                }}
                style={{ colorScheme: "light" }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 text-gray-700 text-sm"
              />
            </div>

            {/* TIME SLOTS */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Select Time
              </div>
              {!selectedDate && (
                <p className="text-xs text-gray-400 mb-3">
                  Please select a date first
                </p>
              )}
              <div className="grid grid-cols-3 gap-2">
                {TIMES.map((time) => {
                  const isBooked = bookedTimes.includes(time);
                  return (
                    <button
                      key={time}
                      disabled={isBooked || !selectedDate}
                      onClick={() => !isBooked && setSelectedTime(time)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border transition ${
                        isBooked
                          ? "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed line-through"
                          : selectedTime === time
                            ? "bg-teal-600 text-white border-teal-600"
                            : !selectedDate
                              ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                              : "bg-white text-gray-600 border-gray-200 hover:border-teal-400"
                      }`}
                    >
                      {isBooked ? `${time} ✗` : time}
                    </button>
                  );
                })}
              </div>
              {bookedTimes.length > 0 && (
                <p className="text-xs text-gray-400 mt-3">✗ = Already booked</p>
              )}
            </div>

            {/* NOTES */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Special Notes (Optional)
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any medical history or special requirements..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 text-gray-700 text-sm resize-none"
              />
            </div>

            {/* PATIENT INFO */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Patient Info
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Name</span>
                  <span className="font-semibold text-gray-800">
                    {user?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Email</span>
                  <span className="font-semibold text-gray-800">
                    {user?.email}
                  </span>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!selectedDate || !selectedTime) {
                  toast.error("Please select date and time");
                  return;
                }
                setStep(2);
              }}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-4 rounded-2xl font-bold text-base hover:opacity-90 transition shadow-lg"
            >
              Continue to Payment →
            </motion.button>
          </motion.div>
        )}

        {/* STEP 2 — Payment */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Payment Method
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: "💳", label: "UPI / Card" },
                  { icon: "🏦", label: "Net Banking" },
                  { icon: "💵", label: "Pay at Center" },
                  { icon: "📱", label: "Wallet" },
                ].map((m) => (
                  <div
                    key={m.label}
                    onClick={() => setSelectedPayment(m.label)}
                    className={`p-4 rounded-xl border text-center cursor-pointer transition ${
                      selectedPayment === m.label
                        ? "border-teal-500 bg-teal-50"
                        : "border-gray-200 hover:border-teal-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">{m.icon}</div>
                    <div className="text-xs font-medium text-gray-700">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-500">Test Price</span>
                <span>₹{price}</span>
              </div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-500">Convenience Fee</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between">
                <span className="font-bold text-gray-800">Total</span>
                <span className="text-xl font-extrabold text-teal-600">
                  ₹{price}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-gray-200 text-gray-600 py-4 rounded-2xl font-bold hover:border-teal-400 transition"
              >
                ← Back
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBooking}
                disabled={loading}
                className="flex-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white py-4 px-8 rounded-2xl font-bold hover:opacity-90 transition shadow-lg disabled:opacity-60"
              >
                {loading ? "Processing..." : `Pay ₹${price} →`}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* STEP 3 — Confirmed */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-gray-400 mb-6">
              Your appointment has been booked successfully.
            </p>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-left mb-6 max-w-sm mx-auto">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Booking Details
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Booking ID</span>
                  <span className="font-bold text-gray-800">
                    #{bookingId || "MC001"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Hospital</span>
                  <span className="font-semibold text-gray-800">
                    {hospital?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Test</span>
                  <span className="font-semibold text-gray-800">
                    {selectedTest?.test?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-semibold text-gray-800">
                    {selectedDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time</span>
                  <span className="font-semibold text-gray-800">
                    {selectedTime}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
                  <span className="font-bold text-gray-800">Amount Paid</span>
                  <span className="font-extrabold text-teal-600">₹{price}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <motion.button
                whileHover={{ scale: 1.03 }}
                onClick={() => navigate("/hospitals")}
                className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition"
              >
                Find More Tests
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                onClick={() => navigate("/")}
                className="border border-gray-200 text-gray-600 px-6 py-3 rounded-xl font-bold hover:border-teal-400 transition"
              >
                Go Home
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Booking;
