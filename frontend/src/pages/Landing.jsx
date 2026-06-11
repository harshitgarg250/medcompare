import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { name: "Blood Test", icon: "🩸", price: "₹80" },
  { name: "MRI Scan", icon: "🧲", price: "₹2,500" },
  { name: "X-Ray", icon: "🦴", price: "₹200" },
  { name: "CT Scan", icon: "🔬", price: "₹1,500" },
  { name: "ECG", icon: "💓", price: "₹150" },
  { name: "Ultrasound", icon: "📡", price: "₹400" },
];

const STATS = [
  { num: "240+", label: "Hospitals", icon: "🏥" },
  { num: "50K+", label: "Tests Done", icon: "🔬" },
  { num: "60%", label: "Avg Savings", icon: "💰" },
  { num: "24/7", label: "Support", icon: "🎯" },
];

const STEPS = [
  { step: "01", title: "Share Location", desc: "We find hospitals near you", icon: "📍", color: "bg-blue-50 text-blue-600" },
  { step: "02", title: "Compare Prices", desc: "See prices, ratings & distance", icon: "⚖️", color: "bg-teal-50 text-teal-600" },
  { step: "03", title: "Book Instantly", desc: "Confirm in seconds", icon: "📅", color: "bg-purple-50 text-purple-600" },
];

export default function Landing() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/hospitals?search=${search}`);
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── HERO ── */}
      <section
        className="relative pt-8 pb-10 px-4"
        style={{
          background: `linear-gradient(160deg,
            hsl(168,55%,${Math.max(92, 97 - scrollY * 0.005)}%) 0%,
            hsl(210,45%,${Math.max(94, 98 - scrollY * 0.003)}%) 60%,
            white 100%)`
        }}
      >
        {/* Blobs */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-100 rounded-full opacity-40 blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-100 rounded-full opacity-30 blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-2xl mx-auto relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white bg-opacity-80 text-teal-700 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 shadow-sm border border-teal-100"
          >
            🔬 Compare 500+ Diagnostic Tests
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-3"
          >
            Find the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-500">
              Best Price
            </span>
            {" "}for Every Medical Test
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-500 text-sm sm:text-base mb-6 max-w-md"
          >
            Compare hospitals, check ratings, view distance — book in seconds. Save up to 60%.
          </motion.p>

          {/* Search */}
          <motion.form
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            onSubmit={handleSearch}
            className="flex gap-2 bg-white rounded-2xl shadow-lg p-1.5 border border-gray-100 mb-5"
          >
            <div className="flex items-center gap-2 flex-1 px-3">
              <span className="text-gray-400 text-base shrink-0">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search MRI, Blood Test, X-Ray..."
                className="flex-1 outline-none text-gray-700 text-sm bg-transparent placeholder-gray-400 min-w-0"
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition shrink-0"
            >
              Search
            </button>
          </motion.form>

          {/* Category chips — horizontal scroll */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="flex gap-2 overflow-x-auto pb-1 scroll-smooth"
            style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
          >
            {CATEGORIES.map((c) => (
              <button
                key={c.name}
                onClick={() => { setActiveCategory(c.name); navigate(`/hospitals?search=${c.name}`); }}
                style={{ scrollSnapAlign: "start" }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border whitespace-nowrap shrink-0 transition ${
                  activeCategory === c.name
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-teal-400"
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
                <span className={`font-semibold ${activeCategory === c.name ? "text-teal-100" : "text-teal-500"}`}>
                  {c.price}
                </span>
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="px-4 py-8 bg-white">
        <div className="max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: i * 0.07 }}
              className="bg-gray-50 rounded-2xl p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition"
            >
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-xl font-extrabold text-teal-600">{s.num}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS — compact timeline ── */}
      <section className="px-4 py-8 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            className="text-center mb-6"
          >
            <h2 className="text-xl font-extrabold text-gray-800">How it works</h2>
            <p className="text-gray-400 text-xs mt-1">3 simple steps</p>
          </motion.div>

          <div className="relative">
            {/* Line */}
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200 hidden sm:block" />

            <div className="flex flex-col sm:flex-row gap-4">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false }}
                  transition={{ delay: i * 0.12 }}
                  className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex sm:flex-col gap-3 sm:gap-2 items-start sm:items-center sm:text-center"
                >
                  <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center text-lg shrink-0`}>
                    {s.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-400 mb-0.5">Step {s.step}</div>
                    <div className="font-bold text-gray-800 text-sm">{s.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{s.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 py-10 bg-gradient-to-br from-teal-600 to-blue-600 text-center">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
          >
            <h2 className="text-xl font-extrabold text-white mb-2">
              Ready to save on your next test?
            </h2>
            <p className="text-teal-100 text-sm mb-5">
              Join 50,000+ users who compare before they book
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/hospitals")}
                className="bg-white text-teal-600 px-6 py-3 rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition"
              >
                Find Hospitals Near Me 📍
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/register")}
                className="border-2 border-white border-opacity-60 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-white hover:bg-opacity-10 transition"
              >
                Create Free Account
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}