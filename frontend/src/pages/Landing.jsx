import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";

const CATEGORIES = [
  {
    name: "Blood Test",
    image:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=400&q=80",
    price: "₹80",
    originalPrice: "₹150",
    saving: "Save 47%",
  },
  {
    name: "MRI Scan",
    image:
      "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=400&q=80",
    price: "₹2,500",
    originalPrice: "₹4,500",
    saving: "Save 44%",
  },
  {
    name: "X-Ray",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80",
    price: "₹200",
    originalPrice: "₹350",
    saving: "Save 43%",
  },
  {
    name: "CT Scan",
    image:
      "https://images.unsplash.com/photo-1571772996211-2f02c9727629?auto=format&fit=crop&w=400&q=80",
    price: "₹1,500",
    originalPrice: "₹2,500",
    saving: "Save 40%",
  },
  {
    name: "ECG",
    image:
      "https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=400&q=80",
    price: "₹150",
    originalPrice: "₹300",
    saving: "Save 50%",
  },
  {
    name: "Ultrasound",
    image:
      "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=400&q=80",
    price: "₹400",
    originalPrice: "₹700",
    saving: "Save 43%",
  },
];

const POPULAR_SEARCHES = [
  "MRI Scan",
  "Blood Test",
  "CT Scan",
  "X-Ray",
  "ECG",
  "Ultrasound",
];

const STATS = [
  {
    num: "240+",
    label: "Partner Hospitals",
    image:
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=400&q=80",
  },
  {
    num: "50,000+",
    label: "Tests Booked",
    image:
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=400&q=80",
  },
  {
    num: "₹2.5 Cr",
    label: "Saved by Patients",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=400&q=80",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Share Location",
    desc: "We find verified hospitals near you instantly",
    icon: "📍",
    color: "bg-blue-50 text-blue-600",
  },
  {
    step: "02",
    title: "Compare Prices",
    desc: "See prices, ratings & distance side by side",
    icon: "⚖️",
    color: "bg-teal-50 text-teal-600",
  },
  {
    step: "03",
    title: "Book Instantly",
    desc: "Pick a slot and confirm in under 60 seconds",
    icon: "📅",
    color: "bg-purple-50 text-purple-600",
  },
];

const TOP_HOSPITALS = [
  {
    name: "Apollo Diagnostics",
    rating: "4.8",
    distance: "2.1 km",
    tests: "MRI, CT Scan, Blood Tests",
    price: "Blood Test from ₹250",
  },
  {
    name: "Medanta Diagnostics",
    rating: "4.9",
    distance: "3.4 km",
    tests: "Premium tests, Echo, LFT",
    price: "MRI from ₹4,500",
  },
  {
    name: "Dr Lal PathLabs",
    rating: "4.6",
    distance: "1.8 km",
    tests: "Full Body Checkup, ECG, CBC",
    price: "CBC from ₹230",
  },
];

const COMPARISON_ROWS = [
  {
    hospital: "Apollo Diagnostics",
    distance: "2.1 km",
    rating: "4.8",
    price: "₹2,800",
    saving: "Best price",
  },
  {
    hospital: "Fortis Diagnostics",
    distance: "3.2 km",
    rating: "4.7",
    price: "₹3,200",
    saving: "Save ₹400",
  },
  {
    hospital: "Medanta Diagnostics",
    distance: "3.4 km",
    rating: "4.9",
    price: "₹4,500",
    saving: "Premium",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "I saved ₹1800 on my MRI scan. Found a NABL lab just 2 km away that I had no idea existed.",
    name: "Rahul Sharma",
    city: "Dehradun",
  },
  {
    quote:
      "Booked a blood test in 3 minutes. Report came on the same day. Super smooth experience.",
    name: "Priya Verma",
    city: "Saharanpur",
  },
];

const FAQS = [
  {
    q: "Are the prices shown final?",
    a: "Prices are shared by partner hospitals. Any extra charges are shown before booking where applicable.",
  },
  {
    q: "Can I compare hospitals near my location?",
    a: "Yes. Search any test with your city or area to see nearby options, prices, ratings and distance.",
  },
  {
    q: "Do I need to pay before visiting?",
    a: "You can confirm a slot online. Payment options depend on the hospital and selected test.",
  },
  {
    q: "Are hospitals verified?",
    a: "MedCompare lists trusted diagnostic partners and hospitals with transparent test pricing.",
  },
];

const CITIES = [
  "Dehradun",
  "Delhi",
  "Mumbai",
  "Saharanpur",
  "Haridwar",
  "Mussoorie",
];

export default function Landing() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("Dehradun");
  const [scrollY, setScrollY] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [allTests, setAllTests] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationSuggestionsLoading, setLocationSuggestionsLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    API.get("/tests")
      .then((res) => setAllTests(res.data))
      .catch(() => {});
  }, []);

  const suggestions = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    const testMatches = allTests
      .filter((t) => t.name?.toLowerCase().includes(q))
      .slice(0, 4)
      .map((t) => ({ type: "test", label: t.name, icon: "🔬" }));
    const cityMatches = CITIES.filter((c) => c.toLowerCase().includes(q))
      .slice(0, 3)
      .map((c) => ({ type: "city", label: c, icon: "📍" }));
    return [...testMatches, ...cityMatches];
  }, [search, allTests]);

  useEffect(() => {
    const query = location.trim();
    if (!query) {
      setLocationSuggestions([]);
      setLocationSuggestionsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLocationSuggestionsLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=20&accept-language=en&q=${encodeURIComponent(query)}`,
          {
            signal: controller.signal,
            headers: { Accept: "application/json" },
          }
        );
        const data = await res.json();

        const getSimilarity = (text, target) => {
          const a = text.toLowerCase();
          const b = target.toLowerCase();
          if (!b) return 0;
          if (a === b) return 100;
          if (a.startsWith(b)) return 95;
          if (a.includes(b)) return 85;

          const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
          for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
          for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;

          for (let i = 1; i <= a.length; i += 1) {
            for (let j = 1; j <= b.length; j += 1) {
              const cost = a[i - 1] === b[j - 1] ? 0 : 1;
              matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
              );
            }
          }

          const distance = matrix[a.length][b.length];
          const maxLen = Math.max(a.length, b.length);
          return maxLen === 0 ? 0 : (1 - distance / maxLen) * 100;
        };

        const normalized = data
          .filter((item) => {
            const addr = item.address || {};
            return addr.city || addr.town || addr.village;
          })
          .map((item) => {
            const addr = item.address || {};
            const label =
              addr.city || addr.town || addr.village || item.display_name.split(",")[0];
            return {
              label,
              full: item.display_name,
              score: getSimilarity(label, query),
            };
          })
          .filter(
            (item, index, array) =>
              array.findIndex((entry) => entry.label.toLowerCase() === item.label.toLowerCase()) === index
          )
          .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));

        if (!controller.signal.aborted) {
          setLocationSuggestions(normalized);
        }
      } catch {
        if (!controller.signal.aborted) {
          setLocationSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLocationSuggestionsLoading(false);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    navigate(`/hospitals?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ── HERO ── */}
      <section
        className="relative px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pb-20 lg:pt-16"
        style={{
          background: `linear-gradient(160deg,
            hsl(168,55%,${Math.max(92, 97 - scrollY * 0.005)}%) 0%,
            hsl(210,45%,${Math.max(94, 98 - scrollY * 0.003)}%) 60%,
            white 100%)`,
        }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-100 rounded-full opacity-30 blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-blue-100 rounded-full opacity-20 blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-white bg-opacity-80 text-teal-700 px-3 py-1.5 rounded-full text-xs font-semibold mb-5 shadow-sm border border-teal-100"
              >
                Verified Hospitals · Real Prices · Instant Booking
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl lg:text-5xl mb-4"
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
                className="mb-5 max-w-lg text-sm text-gray-500 sm:text-base leading-relaxed"
              >
                Save up to 60% on MRI, CT Scan, Blood Tests and more. Find the
                best price near you in seconds.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.22 }}
                className="mb-5 grid grid-cols-2 gap-2 max-w-lg"
              >
                {[
                  "Verified Hospitals",
                  "Real Prices",
                  "Instant Booking",
                  "No Hidden Charges",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 text-xs font-bold text-gray-700 shadow-sm border border-white"
                  >
                    <span className="text-teal-600">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </motion.div>

              {/* Search */}
<motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.25 }}
  className="relative mb-4 max-w-2xl">
  <form onSubmit={handleSearch}
    className="flex flex-col sm:flex-row gap-2 rounded-2xl border border-gray-100 bg-white p-2 shadow-lg">

    {/* Test search */}
    <div className="relative flex-1">
      <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
        <span className="text-gray-400 shrink-0">🔍</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Search test or hospital..."
          className="flex-1 outline-none text-gray-700 text-sm bg-transparent placeholder-gray-400 min-w-0"
        />
        {search && (
          <button type="button" onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
        )}
      </div>

      {/* Test suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Suggestions</span>
            </div>
            {suggestions.map((s, i) => (
              <button key={i}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSearch(s.label);
                  setShowSuggestions(false);
                  navigate(`/hospitals?search=${encodeURIComponent(s.label)}`);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-teal-50 transition text-left border-b border-gray-50 last:border-0">
                <span className="w-6 text-center">{s.icon}</span>
                <span className="text-sm text-gray-700 font-medium">{s.label}</span>
                <span className="text-xs text-gray-300 ml-auto bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                  {s.type === "test" ? "Test" : "City"}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Location search */}
    <div className="relative sm:w-48">
      <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2.5 border border-blue-100">
        <span className="text-blue-400 shrink-0">📍</span>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onFocus={() => setShowLocationSuggestions(true)}
          onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
          placeholder="City or area..."
          className="flex-1 outline-none text-blue-700 text-sm bg-transparent placeholder-blue-300 min-w-0"
        />
        {location && (
          <button type="button" onClick={() => setLocation("")} className="text-blue-300 hover:text-blue-500 text-xs">✕</button>
        )}
      </div>

      {/* Location suggestions dropdown */}
      <AnimatePresence>
        {showLocationSuggestions && (locationSuggestionsLoading || locationSuggestions.length > 0) && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 max-h-72 overflow-y-auto">
            <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">📍 Cities</span>
            </div>
            {locationSuggestionsLoading && locationSuggestions.length === 0 && (
              <div className="px-4 py-3 text-sm text-blue-500">Searching cities...</div>
            )}
            {locationSuggestions.map((city, i) => (
              <button key={i}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setLocation(city.label);
                  setShowLocationSuggestions(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition text-left border-b border-gray-50 last:border-0">
                <span className="text-blue-400">📍</span>
                <span className="text-sm text-gray-700 font-medium">{city.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    <button type="submit"
      className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition shrink-0">
      Search
    </button>
  </form>
</motion.div>
            </div>

            {/* Right — Hero image + preview card */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=85"
                  alt="Medical diagnostic lab"
                  className="w-full h-72 object-cover rounded-3xl shadow-2xl"
                />
                {/* Floating card */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 w-64">
                  <div className="text-xs font-bold text-gray-400 mb-2">
                    🏥 Nearest Hospital
                  </div>
                  <div className="font-bold text-gray-800 text-sm mb-1">
                    Apollo Diagnostics
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                      Blood Test CBC
                    </span>
                    <span className="font-extrabold text-teal-600">₹250</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-amber-400 text-xs">⭐ 4.8</span>
                    <span className="text-xs text-gray-400">· 2.1 km away</span>
                    <span className="ml-auto bg-green-100 text-green-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      Open
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white px-4 py-10 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-6">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition"
              >
                <img
                  src={s.image}
                  alt={s.label}
                  className="w-full h-36 object-cover"
                  loading="lazy"
                />
                <div className="p-4 text-center">
                  <div className="text-2xl font-extrabold text-teal-600">
                    {s.num}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR TESTS ── */}
      <section className="bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-extrabold text-gray-800 sm:text-3xl">
              Popular Tests
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              Compare prices for the most booked diagnostics
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {CATEGORIES.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-md transition cursor-pointer"
                onClick={() =>
                  navigate(`/hospitals?search=${encodeURIComponent(c.name)}`)
                }
              >
                <img
                  src={c.image}
                  alt={c.name}
                  className="h-40 w-full object-cover"
                  loading="lazy"
                />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-800">
                        {c.name}
                      </h3>
                      <p className="mt-1 text-xs text-gray-400">
                        Compare nearby verified centres
                      </p>
                    </div>
                    <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-bold text-green-600 shrink-0">
                      {c.saving}
                    </span>
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <span className="text-xl font-extrabold text-teal-600">
                        {c.price}
                      </span>
                      <span className="ml-2 text-xs text-gray-300 line-through">
                        {c.originalPrice}
                      </span>
                    </div>
                    <span className="rounded-xl bg-gray-900 px-3 py-2 text-xs font-bold text-white hover:bg-teal-600 transition">
                      Compare →
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-extrabold text-gray-800 sm:text-3xl">
              How it works
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              Book your diagnostic test in 3 simple steps
            </p>
          </motion.div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-6">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center"
              >
                <div className="absolute -top-3 -right-3 w-7 h-7 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow">
                  {s.step}
                </div>
                <div
                  className={`w-14 h-14 ${s.color} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4`}
                >
                  {s.icon}
                </div>
                <h3 className="font-bold text-gray-800 text-base mb-2">
                  {s.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP HOSPITALS ── */}
      <section className="bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-extrabold text-gray-800 sm:text-3xl">
              Top Hospitals
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              Verified options with ratings, distance and starting prices
            </p>
          </motion.div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-5">
            {TOP_HOSPITALS.map((h, i) => (
              <motion.div
                key={h.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                onClick={() => navigate("/hospitals")}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition cursor-pointer"
              >
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-2xl mb-4">
                  🏥
                </div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-sm font-extrabold text-gray-800">
                    {h.name}
                  </h3>
                  <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700 shrink-0">
                    ⭐ {h.rating}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4">{h.tests}</p>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100">
                  <span className="font-bold text-blue-600">
                    📏 {h.distance}
                  </span>
                  <span className="font-extrabold text-teal-600">
                    {h.price}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICE COMPARISON TABLE ── */}
      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-extrabold text-gray-800 sm:text-3xl">
              MRI Price Comparison
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              See why comparing before booking saves money
            </p>
          </motion.div>
          <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
            <div className="grid grid-cols-5 bg-gray-900 px-5 py-3 text-xs font-bold uppercase tracking-wide text-white">
              <div className="col-span-2">Hospital</div>
              <div>Distance</div>
              <div>Rating</div>
              <div>Price</div>
            </div>
            {COMPARISON_ROWS.map((row, i) => (
              <motion.button
                key={row.hospital}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                onClick={() => navigate("/hospitals?search=MRI")}
                className={`grid w-full grid-cols-5 px-5 py-4 text-left text-sm hover:bg-teal-50 transition ${i !== COMPARISON_ROWS.length - 1 ? "border-b border-gray-100" : ""} ${i === 0 ? "bg-teal-50" : ""}`}
              >
                <span className="col-span-2 font-bold text-gray-800 flex items-center gap-2">
                  {i === 0 && (
                    <span className="bg-teal-600 text-white text-xs px-2 py-0.5 rounded-full">
                      Best
                    </span>
                  )}
                  {row.hospital}
                </span>
                <span className="text-gray-500 text-xs my-auto">
                  {row.distance}
                </span>
                <span className="font-bold text-amber-600 my-auto">
                  ⭐ {row.rating}
                </span>
                <span className="font-extrabold text-teal-600 my-auto">
                  {row.price}
                </span>
              </motion.button>
            ))}
          </div>
          <div className="text-center mt-4">
            <button
              onClick={() => navigate("/hospitals")}
              className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition"
            >
              Compare All Hospitals →
            </button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-extrabold text-gray-800 sm:text-3xl">
              Patient Stories
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              Real savings, faster decisions
            </p>
          </motion.div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
            {TESTIMONIALS.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="text-amber-400 text-lg mb-3">★★★★★</div>
                <p className="text-sm font-semibold leading-relaxed text-gray-700 mb-4">
                  "{item.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm">
                    {item.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-800">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-400">{item.city}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-extrabold text-gray-800 sm:text-3xl">
              Frequently Asked
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              Everything you need to know
            </p>
          </motion.div>
          <div className="space-y-3">
            {FAQS.map((item, i) => (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-bold text-gray-800">
                    {item.q}
                  </span>
                  <span
                    className={`text-teal-600 text-xl font-bold transition-transform ${openFaq === i ? "rotate-45" : ""}`}
                  >
                    +
                  </span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-4 text-sm text-gray-500 leading-relaxed"
                    >
                      {item.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 py-16 bg-gradient-to-br from-teal-600 to-blue-600">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-extrabold text-white mb-3 sm:text-3xl">
              Ready to save on your next medical test?
            </h2>
            <p className="text-teal-100 text-base mb-8 max-w-lg mx-auto">
              Join 50,000+ users who compare before they book
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/hospitals")}
                className="bg-white text-teal-600 px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition"
              >
                📍 Find Hospitals Near Me
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/register")}
                className="border-2 border-white border-opacity-60 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white hover:bg-opacity-10 transition"
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
