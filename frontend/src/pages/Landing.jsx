import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const POPULAR_TESTS = [
  { name: 'Blood Test', icon: '🩸', price: '₹80' },
  { name: 'MRI Scan', icon: '🧲', price: '₹2,500' },
  { name: 'X-Ray', icon: '🦴', price: '₹200' },
  { name: 'CT Scan', icon: '🔬', price: '₹1,500' },
  { name: 'ECG', icon: '💓', price: '₹150' },
  { name: 'Ultrasound', icon: '📡', price: '₹400' },
]

const STATS = [
  { num: '240+', label: 'Hospitals & Labs', icon: '🏥' },
  { num: '50K+', label: 'Tests Compared', icon: '🔬' },
  { num: '60%', label: 'Average Savings', icon: '💰' },
  { num: '4.8★', label: 'User Rating', icon: '⭐' },
]

const HOW_IT_WORKS = [
  { icon: '📍', title: 'Share Location', desc: 'We detect your location and find the best hospitals nearby', color: 'bg-blue-50 text-blue-500' },
  { icon: '⚖️', title: 'Compare Prices', desc: 'See test prices, ratings, and distance all in one place', color: 'bg-teal-50 text-teal-500' },
  { icon: '📅', title: 'Book Instantly', desc: 'Choose a slot and confirm your appointment in seconds', color: 'bg-purple-50 text-purple-500' },
]

const TESTIMONIALS = [
  { name: 'Priya S.', city: 'Dehradun', text: 'Saved ₹1,800 on my MRI scan! Found a great lab 2km away.', rating: 5 },
  { name: 'Rajesh K.', city: 'Delhi', text: 'So easy to compare prices. Booked blood test in under a minute.', rating: 5 },
  { name: 'Anita M.', city: 'Mumbai', text: 'Best app for finding affordable diagnostics near you.', rating: 4 },
]

// Scroll animation hook
function useInView() {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return [ref, inView]
}

function AnimatedSection({ children, className = '' }) {
  const [ref, inView] = useInView()
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function Landing() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/hospitals?search=${search}`)
  }

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* HERO — gradient shifts on scroll */}
      <div
        className="relative min-h-screen flex flex-col items-center justify-center px-6 transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, 
            hsl(${168 + scrollY * 0.05}, 70%, ${96 - scrollY * 0.02}%) 0%, 
            hsl(${210 + scrollY * 0.03}, 60%, ${98 - scrollY * 0.01}%) 50%,
            hsl(${280 + scrollY * 0.02}, 50%, ${97 - scrollY * 0.01}%) 100%)`
        }}
      >
        {/* Background blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200 rounded-full opacity-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-200 rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white bg-opacity-80 backdrop-blur text-teal-700 px-5 py-2 rounded-full text-sm font-medium mb-8 shadow-sm border border-teal-100"
          >
            🔬 Compare 500+ Diagnostic Tests Near You
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight"
          >
            Find the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500">
              Best Price
            </span>
            <br />for Every Medical Test
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-gray-500 text-xl mb-10 max-w-xl mx-auto"
          >
            Compare hospitals, check ratings, view distance — book in seconds. Save up to 60% on diagnostics.
          </motion.p>

          {/* SEARCH */}
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onSubmit={handleSearch}
            className="flex gap-3 max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-2 border border-gray-100 mb-6"
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
              className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-7 py-3 rounded-xl font-semibold hover:opacity-90 transition shadow-md"
            >
              Search Nearby
            </button>
          </motion.form>

          {/* POPULAR TESTS CHIPS */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {POPULAR_TESTS.map((test, i) => (
              <motion.button
                key={test.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                onClick={() => navigate(`/hospitals?search=${test.name}`)}
                className="bg-white bg-opacity-80 backdrop-blur border border-gray-200 text-gray-600 px-4 py-2 rounded-full text-sm hover:border-teal-400 hover:text-teal-600 hover:shadow-md transition flex items-center gap-2"
              >
                <span>{test.icon}</span>
                <span>{test.name}</span>
                <span className="text-teal-500 font-semibold text-xs">from {test.price}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-8 text-gray-400 text-sm flex flex-col items-center gap-1"
        >
          <span>Scroll to explore</span>
          <span>↓</span>
        </motion.div>
      </div>

      {/* STATS */}
      <AnimatedSection className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition hover:-translate-y-1"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-4xl font-extrabold text-teal-600 mb-1">{stat.num}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* HOW IT WORKS */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-teal-50">
        <div className="max-w-5xl mx-auto px-6">
          <AnimatedSection>
            <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-4">How it works</h2>
            <p className="text-gray-400 text-center mb-12">Book your test in 3 simple steps</p>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition hover:-translate-y-2 text-center"
              >
                <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5`}>
                  {step.icon}
                </div>
                <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Step {i + 1}</div>
                <div className="font-bold text-gray-800 text-lg mb-2">{step.title}</div>
                <div className="text-gray-500 text-sm leading-relaxed">{step.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* TESTS SHOWCASE */}
      <div className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <AnimatedSection>
            <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-4">Popular Tests</h2>
            <p className="text-gray-400 text-center mb-12">Click any test to compare prices nearby</p>
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {POPULAR_TESTS.map((test, i) => (
              <motion.button
                key={test.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.03 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                onClick={() => navigate(`/hospitals?search=${test.name}`)}
                className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-6 text-left hover:shadow-lg hover:border-teal-200 transition"
              >
                <div className="text-3xl mb-3">{test.icon}</div>
                <div className="font-bold text-gray-800 mb-1">{test.name}</div>
                <div className="text-teal-600 font-semibold text-sm">Starting {test.price}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div className="py-20 bg-gradient-to-br from-teal-600 to-blue-600">
        <div className="max-w-5xl mx-auto px-6">
          <AnimatedSection>
            <h2 className="text-4xl font-extrabold text-white text-center mb-4">What patients say</h2>
            <p className="text-teal-100 text-center mb-12">Real reviews from real users</p>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                viewport={{ once: true }}
                className="bg-white bg-opacity-10 backdrop-blur border border-white border-opacity-20 rounded-2xl p-6 text-white"
              >
                <div className="text-yellow-300 mb-3">{'⭐'.repeat(t.rating)}</div>
                <p className="text-teal-50 mb-4 text-sm leading-relaxed">"{t.text}"</p>
                <div className="font-bold">{t.name}</div>
                <div className="text-teal-200 text-xs">{t.city}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <AnimatedSection className="py-20 bg-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-4">Ready to save on your next test?</h2>
          <p className="text-gray-500 mb-8">Join 50,000+ users who compare before they book</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/hospitals')}
              className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:opacity-90 transition"
            >
              Find Hospitals Near Me 📍
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/login')}
              className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-bold text-lg hover:border-teal-400 transition"
            >
              Create Free Account
            </motion.button>
          </div>
        </div>
      </AnimatedSection>

    </div>
  )
}

export default Landing