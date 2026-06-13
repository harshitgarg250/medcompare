import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";

const CATEGORIES = [
  { name: "Blood Test", image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=160&q=70", price: "₹80", originalPrice: "₹150", saving: "Save 47%" },
  { name: "MRI Scan", image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=160&q=70", price: "₹2,500", originalPrice: "₹4,500", saving: "Save 44%" },
  { name: "X-Ray", image: "https://images.unsplash.com/photo-1583912267550-d44c15d5c5f5?auto=format&fit=crop&w=160&q=70", price: "₹200", originalPrice: "₹350", saving: "Save 43%" },
  { name: "CT Scan", image: "https://images.unsplash.com/photo-1581595219315-a187dd40c322?auto=format&fit=crop&w=160&q=70", price: "₹1,500", originalPrice: "₹2,500", saving: "Save 40%" },
  { name: "ECG", image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=160&q=70", price: "₹150", originalPrice: "₹300", saving: "Save 50%" },
  { name: "Ultrasound", image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=160&q=70", price: "₹400", originalPrice: "₹700", saving: "Save 43%" },
];
const POPULAR_SEARCHES = ["MRI Scan", "Blood Test", "CT Scan", "X-Ray", "ECG", "Ultrasound"];

const STATS = [
  { num: "240+", label: "Partner Hospitals", image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=240&q=70" },
  { num: "50,000+", label: "Tests Booked", image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=240&q=70" },
  { num: "₹2.5 Cr", label: "Saved by Patients", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=240&q=70" },
];

const STEPS = [
  { step: "01", title: "Share Location", desc: "We find hospitals near you", icon: "📍", color: "bg-blue-50 text-blue-600" },
  { step: "02", title: "Compare Prices", desc: "See prices, ratings & distance", icon: "⚖️", color: "bg-teal-50 text-teal-600" },
  { step: "03", title: "Book Instantly", desc: "Confirm in seconds", icon: "📅", color: "bg-purple-50 text-purple-600" },
];
const WHY_CHOOSE_US = [
  { icon: "🏥", title: "Verified Hospitals", desc: "Only trusted diagnostic partners and hospitals." },
  { icon: "💰", title: "Lowest Price Guarantee", desc: "Compare prices before you book." },
  { icon: "⚡", title: "Instant Booking", desc: "Reserve your test slot in seconds." },
  { icon: "🔒", title: "Secure Payments", desc: "Your booking and payment details stay protected." },
  { icon: "📍", title: "Nearby Locations", desc: "Find options close to your area." },
];
const TESTIMONIALS = [
  {
    quote: "I saved ₹1800 on my MRI scan.",
    name: "Rahul Sharma",
  },
  {
    quote: "Found the nearest hospital in 2 minutes.",
    name: "Priya Verma",
  },
];

const CITIES = ["Dehradun", "Delhi", "Mumbai", "Saharanpur", "Haridwar", "Mussoorie"];

const ADVISOR_RULES = [
  {
    keywords: ["headache", "dizziness", "chakkar", "migraine", "sir dard"],
    tests: ["CBC", "Blood Sugar", "MRI Brain"],
  },
  {
    keywords: ["fever", "weakness", "body pain", "infection", "bukhar"],
    tests: ["CBC", "CRP", "Blood Culture"],
  },
  {
    keywords: ["chest pain", "breath", "heart", "palpitation"],
    tests: ["ECG", "Troponin I", "Lipid Profile"],
  },
  {
    keywords: ["thyroid", "weight gain", "hair fall", "fatigue"],
    tests: ["Thyroid Profile", "Vitamin D", "CBC"],
  },
  {
    keywords: ["stomach", "abdominal", "liver", "vomiting", "pet dard"],
    tests: ["Liver Function Test", "Ultrasound", "CBC"],
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("Dehradun");
  const [activeCategory, setActiveCategory] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allTests, setAllTests] = useState([]);
  const [symptoms, setSymptoms] = useState("");
  const [advisorResults, setAdvisorResults] = useState(["CBC", "Blood Sugar", "MRI Brain"]);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    API.get("/tests").then(res => setAllTests(res.data)).catch(() => {});
  }, []);

  const suggestions = useMemo(() => {
    if (!search.trim()) return [];

    const q = search.toLowerCase();
    const testMatches = allTests
      .filter(t => t.name?.toLowerCase().includes(q))
      .slice(0, 4)
      .map(t => ({ type: "test", label: t.name, icon: "🔬" }));
    const cityMatches = CITIES
      .filter(c => c.toLowerCase().includes(q))
      .slice(0, 3)
      .map(c => ({ type: "city", label: c, icon: "📍" }));

    return [...testMatches, ...cityMatches];
  }, [search, allTests]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (location.trim()) params.set("location", location.trim());
    navigate(`/hospitals?${params.toString()}`);
  };

  const handleAdvisor = () => {
    const q = symptoms.toLowerCase();
    const matched = ADVISOR_RULES.find((rule) =>
      rule.keywords.some((keyword) => q.includes(keyword))
    );
    setAdvisorResults(matched?.tests || ["CBC", "Blood Sugar", "Doctor Consultation"]);
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── HERO ── */}
      <section
        className="relative px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pb-14 lg:pt-12"
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

        <div className="relative z-10 mx-auto max-w-6xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white bg-opacity-80 text-teal-700 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 shadow-sm border border-teal-100"
          >
            Verified Hospitals · Real Prices · Instant Booking
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-4xl text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl lg:text-5xl mb-3"
          >
            Compare Medical Test Prices Across{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-500">
              Verified Hospitals
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6 max-w-2xl text-sm text-gray-500 sm:text-base"
          >
            Save up to 60% on MRI, CT Scan, Blood Tests and more.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="mb-6 grid max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2"
          >
            {["Verified Hospitals", "Real Prices", "Instant Booking", "No Hidden Charges"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 text-xs font-bold text-gray-700 shadow-sm border border-white">
                <span className="text-teal-600">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="relative mb-5 max-w-4xl"
          >
            <form
              onSubmit={handleSearch}
              className="grid gap-2 rounded-2xl border border-gray-100 bg-white p-2 shadow-lg md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)_auto]"
            >
              <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
                <span className="text-gray-400 text-base shrink-0">🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="Search Test"
                  className="flex-1 outline-none text-gray-700 text-sm bg-transparent placeholder-gray-400 min-w-0"
                />
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2.5">
                <span className="text-blue-400 text-base shrink-0">📍</span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                  className="flex-1 outline-none text-blue-700 text-sm bg-transparent placeholder-blue-300 min-w-0"
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition shrink-0"
              >
                Compare
              </button>
            </form>

            {/* Suggestions dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-30"
                >
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onMouseDown={() => {
                        setSearch(s.label);
                        setShowSuggestions(false);
                        navigate(`/hospitals?search=${encodeURIComponent(s.label)}`);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-left border-b border-gray-50 last:border-0"
                    >
                      <span className="text-base">{s.icon}</span>
                      <span className="text-sm text-gray-700">{s.label}</span>
                      <span className="text-xs text-gray-300 ml-auto">{s.type === "test" ? "Test" : "City"}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-5 max-w-4xl"
          >
            <div className="mb-2 text-xs font-extrabold text-gray-500">🔥 Popular</div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {POPULAR_SEARCHES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => navigate(`/hospitals?search=${encodeURIComponent(item)}&location=${encodeURIComponent(location || "Dehradun")}`)}
                  className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 shadow-sm transition hover:border-teal-300 hover:text-teal-700"
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.div>

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
                onClick={() => { setActiveCategory(c.name); navigate(`/hospitals?search=${encodeURIComponent(c.name)}`); }}
                style={{ scrollSnapAlign: "start" }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border whitespace-nowrap shrink-0 transition ${
                  activeCategory === c.name
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-teal-400"
                }`}
              >
                <img src={c.image} alt={c.name} className="h-8 w-8 rounded-lg object-cover" loading="lazy" />
                <span className="flex flex-col items-start leading-tight">
                  <span>{c.name}</span>
                  <span>
                    <span className={`font-bold ${activeCategory === c.name ? "text-white" : "text-teal-600"}`}>
                      {c.price}
                    </span>
                    <span className={`ml-1 line-through ${activeCategory === c.name ? "text-teal-100" : "text-gray-300"}`}>
                      {c.originalPrice}
                    </span>
                  </span>
                </span>
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeCategory === c.name ? "bg-white/20 text-white" : "bg-green-50 text-green-600"}`}>
                  {c.saving}
                </span>
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-5"
          >
            <h2 className="text-xl font-extrabold text-gray-800">Trusted by 50,000+ Patients</h2>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
              <span>★★★★★</span>
              <span>4.8/5 Average Rating</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:gap-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: i * 0.07 }}
              className="bg-gray-50 rounded-2xl p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition border border-gray-100"
            >
              <img src={s.image} alt={s.label} className="mx-auto mb-3 h-16 w-full rounded-xl object-cover" loading="lazy" />
              <div className="text-xl font-extrabold text-teal-600">{s.num}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </motion.div>
          ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-5"
          >
            <h2 className="text-xl font-extrabold text-gray-800">Patient Stories</h2>
            <p className="text-xs text-gray-400 mt-1">Real savings, faster decisions.</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:gap-4">
            {TESTIMONIALS.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 text-sm font-bold text-amber-500">★★★★★</div>
                <p className="text-sm font-semibold leading-relaxed text-gray-700">"{item.quote}"</p>
                <div className="mt-4 text-xs font-bold text-gray-500">— {item.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-5"
          >
            <h2 className="text-xl font-extrabold text-gray-800">Why Choose MedCompare?</h2>
            <p className="text-xs text-gray-400 mt-1">Built for transparent, faster medical test booking.</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {WHY_CHOOSE_US.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-800">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI ADVISOR ── */}
      <section className="bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 mb-2">
                  🤖 AI Test Advisor
                </div>
                <h2 className="text-xl font-extrabold text-gray-800">Not sure which test to book?</h2>
                <p className="text-xs text-gray-400 mt-1">Describe symptoms and get suggested tests to compare.</p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder='Describe symptoms, e.g. "I have headache and dizziness"'
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-700 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-50"
              />
              <button
                type="button"
                onClick={handleAdvisor}
                className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-700"
              >
                Suggest Tests
              </button>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {advisorResults.map((test) => (
                <button
                  key={test}
                  type="button"
                  onClick={() => navigate(`/hospitals?search=${encodeURIComponent(test)}&location=${encodeURIComponent(location || "Dehradun")}`)}
                  className="rounded-xl border border-teal-100 bg-teal-50 px-3 py-3 text-left transition hover:border-teal-300 hover:bg-white"
                >
                  <div className="text-sm font-extrabold text-gray-800">{test}</div>
                  <div className="text-xs text-teal-600 mt-1">Compare prices →</div>
                </button>
              ))}
            </div>

            <p className="mt-3 text-[11px] text-gray-400">
              This advisor is for guidance only and does not replace medical advice.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS — compact timeline ── */}
      <section className="bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
