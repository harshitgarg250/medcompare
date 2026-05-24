import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";

const POPULAR_TESTS = [
  { name: "Blood Test", icon: "🩸", price: "₹80" },
  { name: "MRI Scan", icon: "🧲", price: "₹2,500" },
  { name: "X-Ray", icon: "🦴", price: "₹200" },
  { name: "CT Scan", icon: "🔬", price: "₹1,500" },
  { name: "ECG", icon: "💓", price: "₹150" },
  { name: "Ultrasound", icon: "📡", price: "₹400" },
];

const STATS = [
  { num: "240+", label: "Hospitals & Labs", icon: "🏥" },
  { num: "50K+", label: "Tests Compared", icon: "🔬" },
  { num: "60%", label: "Average Savings", icon: "💰" },
  { num: "4.8★", label: "User Rating", icon: "⭐" },
];

const HOW_IT_WORKS = [
  {
    icon: "📍",
    title: "Share Location",
    desc: "We detect your location and find the best hospitals nearby",
    color: "bg-blue-50 text-blue-500",
  },
  {
    icon: "⚖️",
    title: "Compare Prices",
    desc: "See test prices, ratings, and distance all in one place",
    color: "bg-teal-50 text-teal-500",
  },
  {
    icon: "📅",
    title: "Book Instantly",
    desc: "Choose a slot and confirm your appointment in seconds",
    color: "bg-purple-50 text-purple-500",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya S.",
    city: "Dehradun",
    text: "Saved ₹1,800 on my MRI scan! Found a great lab 2km away.",
    rating: 5,
  },
  {
    name: "Rajesh K.",
    city: "Delhi",
    text: "So easy to compare prices. Booked blood test in under a minute.",
    rating: 5,
  },
  {
    name: "Anita M.",
    city: "Mumbai",
    text: "Best app for finding affordable diagnostics near you.",
    rating: 4,
  },
];

// Reusable scroll-triggered animation — repeats every time
function FadeInSection({ children, className = "", delay = 0, direction = "up" }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.12 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 30 : direction === "down" ? -30 : 0,
      x: direction === "left" ? 30 : direction === "right" ? -30 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Landing() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { scrollY } = useScroll();

  // Subtle hero background color shift on scroll
  const [scrollVal, setScrollVal] = useState(0);
  useEffect(() => {
    return scrollY.on("change", (v) => setScrollVal(v));
  }, [scrollY]);

  const heroBg = `linear-gradient(135deg,
    hsl(168, 60%, ${Math.max(88, 96 - scrollVal * 0.008)}%) 0%,
    hsl(210, 50%, ${Math.max(90, 97 - scrollVal * 0.006)}%) 50%,
    hsl(250, 45%, ${Math.max(91, 96 - scrollVal * 0.005)}%) 100%)`;

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/hospitals?search=${search}`);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">

      {/* ── HERO ── */}
      <div
        className="relative min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: heroBg, transition: "background 0.4s ease" }}
      >
        {/* Soft blobs — subtle, not distracting */}
        <div className="absolute top-24 left-16 w-64 h-64 bg-teal-100 rounded-full opacity-40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-24 right-16 w-80 h-80 bg-blue-100 rounded-full opacity-40 blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white bg-opacity-90 text-teal-700 px-5 py-2 rounded-full text-sm font-medium mb-8 shadow-sm border border-teal-100"
          >
            🔬 Compare 500+ Diagnostic Tests Near You
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight"
          >
            Find the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500">
              Best Price
            </span>
            <br />
            for Every Medical Test
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-gray-500 text-xl mb-10 max-w-xl mx-auto leading-relaxed"
          >
            Compare hospitals, check ratings, view distance — book in seconds.
            Save up to 60% on diagnostics.
          </motion.p>

          {/* Search */}
          <motion.form
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onSubmit={handleSearch}
            className="flex gap-3 max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-2 border border-gray-100 mb-6"
          >
            <span className="pl-3 flex items-center text-gray-400 text-xl">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for MRI, Blood Test, X-Ray..."
              className="flex-1 outline-none text-gray-700 text-base placeholder-gray-400 bg-transparent py-2"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-7 py-3 rounded-xl font-semibold hover:opacity-90 transition"
            >
              Search Nearby
            </button>
          </motion.form>

          {/* Test chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {POPULAR_TESTS.map((test, i) => (
              <motion.button
                key={test.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + i * 0.05 }}
                whileHover={{ scale: 1.04, y: -2 }}
                onClick={() => navigate(`/hospitals?search=${test.name}`)}
                className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-full text-sm hover:border-teal-400 hover:text-teal-600 hover:shadow-md transition flex items-center gap-2"
              >
                <span>{test.icon}</span>
                <span>{test.name}</span>
                <span className="text-teal-500 font-semibold text-xs">from {test.price}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 flex flex-col items-center gap-1 text-gray-400 text-xs"
        >
          <span>Scroll to explore</span>
          <span className="text-base">↓</span>
        </motion.div>
      </div>

      {/* ── STATS ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <FadeInSection className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <FadeInSection key={stat.label} delay={i * 0.08}>
                <div className="text-center p-6 rounded-2xl border border-gray-100 hover:shadow-md hover:-translate-y-1 transition cursor-default">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-4xl font-extrabold text-teal-600 mb-1">{stat.num}</div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </div>
              </FadeInSection>
            ))}
          </FadeInSection>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <FadeInSection className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-800 mb-3">How it works</h2>
            <p className="text-gray-400">Book your test in 3 simple steps</p>
          </FadeInSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <FadeInSection
                key={step.title}
                delay={i * 0.12}
                direction={i === 0 ? "right" : i === 2 ? "left" : "up"}
              >
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition text-center">
                  <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5`}>
                    {step.icon}
                  </div>
                  <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
                    Step {i + 1}
                  </div>
                  <div className="font-bold text-gray-800 text-lg mb-2">{step.title}</div>
                  <div className="text-gray-500 text-sm leading-relaxed">{step.desc}</div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR TESTS ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <FadeInSection className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-800 mb-3">Popular Tests</h2>
            <p className="text-gray-400">Click any test to compare prices nearby</p>
          </FadeInSection>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {POPULAR_TESTS.map((test, i) => (
              <FadeInSection key={test.name} delay={i * 0.07}>
                <motion.button
                  whileHover={{ scale: 1.03, y: -3 }}
                  onClick={() => navigate(`/hospitals?search=${test.name}`)}
                  className="w-full bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-6 text-left hover:shadow-lg hover:border-teal-200 transition"
                >
                  <div className="text-3xl mb-3">{test.icon}</div>
                  <div className="font-bold text-gray-800 mb-1">{test.name}</div>
                  <div className="text-teal-600 font-semibold text-sm">Starting {test.price}</div>
                </motion.button>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-indigo-600">
        <div className="max-w-5xl mx-auto px-6">
          <FadeInSection className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-white mb-3">What patients say</h2>
            <p className="text-teal-100">Real reviews from real users</p>
          </FadeInSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <FadeInSection key={t.name} delay={i * 0.1} direction="up">
                <div className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-2xl p-6 text-white hover:bg-opacity-20 transition">
                  <div className="text-yellow-300 mb-3 text-sm">{"⭐".repeat(t.rating)}</div>
                  <p className="text-teal-50 mb-4 text-sm leading-relaxed">"{t.text}"</p>
                  <div className="font-bold text-sm">{t.name}</div>
                  <div className="text-teal-200 text-xs">{t.city}</div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <FadeInSection>
            <h2 className="text-4xl font-extrabold text-gray-800 mb-4">
              Ready to save on your next test?
            </h2>
            <p className="text-gray-500 mb-8">
              Join 50,000+ users who compare before they book
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/hospitals")}
                className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-lg hover:opacity-90 transition"
              >
                Find Hospitals Near Me 📍
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/login")}
                className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-bold text-base hover:border-teal-400 hover:text-teal-600 transition"
              >
                Create Free Account
              </motion.button>
            </div>
          </FadeInSection>
        </div>
      </section>

    </div>
  );
}

export default Landing;