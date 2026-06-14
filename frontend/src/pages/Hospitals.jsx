import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import API from "../services/api";
import HospitalsMap from "../components/HospitalsMap";

const FILTERS = ["All", "Nearest", "Top Rated", "Lowest Price", "Open Now"];
const TRUST_POINTS = ["Verified partners", "Transparent prices", "Secure booking", "No hidden charges"];
const HOSPITAL_IMAGES = [
  "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=640&q=75",
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=640&q=75",
  "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=640&q=75",
  "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=640&q=75",
  "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=640&q=75",
  "https://images.unsplash.com/photo-1581595219315-a187dd40c322?auto=format&fit=crop&w=640&q=75",
];
const FALLBACK_TESTS = [
  "Blood Test",
  "MRI Scan",
  "X-Ray",
  "CT Scan",
  "ECG",
  "Ultrasound",
];
const STORAGE_KEYS = {
  savedHospitals: "medcompare_saved_hospitals",
  searchHistory: "medcompare_search_history",
  recentTests: "medcompare_recent_tests",
};
const FALLBACK_HOSPITALS = [
  {
    id: "fallback-city",
    name: "City Hospital",
    type: "Diagnostic Center",
    address: "Rajpur Road",
    city: "Dehradun",
    lat: 30.3256,
    lng: 78.0437,
    rating: 4.5,
    isOpen: true,
    distance: 1.8,
    reviewCount: 238,
    verified: true,
    image: HOSPITAL_IMAGES[0],
    tests: [
      { id: "city-blood", price: 80, originalPrice: 150, duration: "15 min", reportTime: "24 hrs", test: { name: "Blood Test" } },
      { id: "city-mri", price: 2500, originalPrice: 4500, duration: "45 min", reportTime: "Same day", test: { name: "MRI Scan" } },
      { id: "city-xray", price: 200, originalPrice: 350, duration: "10 min", reportTime: "2 hrs", test: { name: "X-Ray" } },
    ],
  },
  {
    id: "fallback-kailash",
    name: "Kailash Hospital",
    type: "Multi-speciality Hospital",
    address: "Haridwar Road",
    city: "Dehradun",
    lat: 30.3008,
    lng: 78.0461,
    rating: 4.3,
    isOpen: true,
    distance: 2.4,
    reviewCount: 184,
    verified: true,
    image: HOSPITAL_IMAGES[1],
    tests: [
      { id: "kailash-blood", price: 90, duration: "15 min", reportTime: "24 hrs", test: { name: "Blood Test" } },
      { id: "kailash-ct", price: 1500, duration: "30 min", reportTime: "Same day", test: { name: "CT Scan" } },
      { id: "kailash-ecg", price: 150, duration: "10 min", reportTime: "30 min", test: { name: "ECG" } },
    ],
  },
  {
    id: "fallback-synergy",
    name: "Synergy Hospital",
    type: "Hospital",
    address: "Ballupur Road",
    city: "Dehradun",
    lat: 30.3346,
    lng: 78.0108,
    rating: 4.6,
    isOpen: true,
    distance: 3.1,
    reviewCount: 312,
    verified: true,
    image: HOSPITAL_IMAGES[2],
    tests: [
      { id: "synergy-blood", price: 100, duration: "15 min", reportTime: "24 hrs", test: { name: "Blood Test" } },
      { id: "synergy-mri", price: 2800, duration: "45 min", reportTime: "Same day", test: { name: "MRI Scan" } },
      { id: "synergy-ultra", price: 400, duration: "20 min", reportTime: "4 hrs", test: { name: "Ultrasound" } },
    ],
  },
  {
    id: "fallback-velmed",
    name: "Velmed Hospital",
    type: "Hospital",
    address: "Turner Road",
    city: "Dehradun",
    lat: 30.2866,
    lng: 78.0078,
    rating: 4.2,
    isOpen: false,
    distance: 4.2,
    reviewCount: 96,
    verified: true,
    image: HOSPITAL_IMAGES[3],
    tests: [
      { id: "velmed-xray", price: 220, duration: "10 min", reportTime: "2 hrs", test: { name: "X-Ray" } },
      { id: "velmed-ct", price: 1600, duration: "30 min", reportTime: "Same day", test: { name: "CT Scan" } },
      { id: "velmed-ecg", price: 180, duration: "10 min", reportTime: "30 min", test: { name: "ECG" } },
    ],
  },
  {
    id: "fallback-apollo",
    name: "Apollo Hospital",
    type: "Hospital",
    address: "Sarita Vihar",
    city: "Delhi",
    lat: 28.5363,
    lng: 77.2839,
    rating: 4.7,
    isOpen: true,
    distance: 210,
    reviewCount: 1240,
    verified: true,
    image: HOSPITAL_IMAGES[4],
    tests: [
      { id: "apollo-blood", price: 120, duration: "15 min", reportTime: "24 hrs", test: { name: "Blood Test" } },
      { id: "apollo-mri", price: 3200, duration: "45 min", reportTime: "Same day", test: { name: "MRI Scan" } },
      { id: "apollo-ultra", price: 550, duration: "20 min", reportTime: "4 hrs", test: { name: "Ultrasound" } },
    ],
  },
  {
    id: "fallback-max",
    name: "Max Hospital",
    type: "Hospital",
    address: "Saket",
    city: "Delhi",
    lat: 28.5276,
    lng: 77.213,
    rating: 4.5,
    isOpen: true,
    distance: 214,
    reviewCount: 890,
    verified: true,
    image: HOSPITAL_IMAGES[5],
    tests: [
      { id: "max-blood", price: 110, duration: "15 min", reportTime: "24 hrs", test: { name: "Blood Test" } },
      { id: "max-ct", price: 1900, duration: "30 min", reportTime: "Same day", test: { name: "CT Scan" } },
      { id: "max-xray", price: 250, duration: "10 min", reportTime: "2 hrs", test: { name: "X-Ray" } },
    ],
  },
];

export default function Hospitals() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const filterRef = useRef(null);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [activeFilter, setActiveFilter] = useState("All");
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [manualLocation, setManualLocation] = useState(searchParams.get("location") || "");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationSuggestLoading, setLocationSuggestLoading] = useState(false);
  const [compareHospitals, setCompareHospitals] = useState([]);
  const [savedHospitals, setSavedHospitals] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.savedHospitals)) || [];
    } catch {
      return [];
    }
  });
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.searchHistory)) || [];
    } catch {
      return [];
    }
  });
  const [recentTests, setRecentTests] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.recentTests)) || [];
    } catch {
      return [];
    }
  });

  const applyLocation = (place) => {
    setManualLocation(place.display_name);
    setUserLocation({ lat: parseFloat(place.lat), lng: parseFloat(place.lon) });
    setShowLocationSuggestions(false);
    toast.success(`📍 ${place.display_name.split(",")[0]}`);
  };

  const handleManualLocation = async (location = manualLocation) => {
    if (!location.trim()) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`
      );
      const data = await res.json();
      if (data.length > 0) {
        applyLocation(data[0]);
      } else {
        toast.error("Location not found");
      }
    } catch {
      toast.error("Could not fetch location");
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLoading(false);
      },
      () => {
        setUserLocation({ lat: 30.3165, lng: 78.0322 });
        setLocationLoading(false);
      }
    );
  }, []);

  const { data: hospitals, isLoading } = useQuery({
    queryKey: ["hospitals", userLocation],
    queryFn: () =>
      userLocation
        ? API.get(`/hospitals/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=5000`).then((r) => r.data)
        : API.get("/hospitals").then((r) => r.data),
    enabled: !locationLoading,
  });

  const { data: suggestionHospitals = [], isLoading: suggestionsLoading } = useQuery({
    queryKey: ["hospital-search-suggestions"],
    queryFn: () => API.get("/hospitals").then((r) => r.data),
  });

  const { data: suggestionTests = [] } = useQuery({
    queryKey: ["test-search-suggestions"],
    queryFn: () => API.get("/tests").then((r) => r.data),
  });

  const searchSuggestions = useMemo(() => {
    if (!search.trim()) return [];

    const q = search.toLowerCase();
    const matches = [];
    const seen = new Set();

    const hospitalSources = [
      ...(hospitals || []),
      ...suggestionHospitals,
      ...FALLBACK_HOSPITALS,
    ];

    hospitalSources.forEach((hospital) => {
      if (hospital.name?.toLowerCase().includes(q)) {
        const key = `hospital-${hospital.id || hospital.name.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          matches.push({
            type: "hospital",
            label: hospital.name,
            detail: hospital.address || hospital.city || "Hospital",
            icon: "🏥",
          });
        }
      }
    });

    suggestionTests.forEach((test) => {
      if (test.name?.toLowerCase().includes(q)) {
        const key = `test-${test.name.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          matches.push({
            type: "test",
            label: test.name,
            detail: test.category || "Medical test",
            icon: "🔬",
          });
        }
      }
    });

    FALLBACK_TESTS.forEach((testName) => {
      if (testName.toLowerCase().includes(q)) {
        const key = `test-${testName.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          matches.push({
            type: "test",
            label: testName,
            detail: "Common medical test",
            icon: "🔬",
          });
        }
      }
    });

    return matches.slice(0, 8);
  }, [hospitals, search, suggestionHospitals, suggestionTests]);

  const displayHospitals = useMemo(() => {
    if (hospitals?.length > 0) return hospitals;
    if (suggestionHospitals.length > 0) return suggestionHospitals;
    return FALLBACK_HOSPITALS;
  }, [hospitals, suggestionHospitals]);

  const isDemoData = !hospitals?.length && !suggestionHospitals.length;
  const selectedTestName = search.trim();
  const getMatchingTest = (hospital) =>
    hospital.tests?.find((t) => t.test?.name?.toLowerCase() === selectedTestName.toLowerCase()) ||
    hospital.tests?.find((t) => t.test?.name?.toLowerCase().includes(selectedTestName.toLowerCase())) ||
    hospital.tests?.[0];
  const getMinPrice = (hospital) =>
    hospital.tests?.length > 0 ? Math.min(...hospital.tests.map((t) => t.price)) : null;
  const getHospitalImage = (hospital, index = 0) =>
    hospital.image || HOSPITAL_IMAGES[index % HOSPITAL_IMAGES.length];
  const getSavingPercent = (test) => {
    if (!test?.originalPrice || test.originalPrice <= test.price) return null;
    return Math.round(((test.originalPrice - test.price) / test.originalPrice) * 100);
  };
  const isComparing = (hospital) => compareHospitals.some((item) => item.id === hospital.id);
  const isSaved = (hospital) => savedHospitals.some((item) => item.id === hospital.id);
  const toggleCompare = (hospital) => {
    setCompareHospitals((current) => {
      if (current.some((item) => item.id === hospital.id)) {
        return current.filter((item) => item.id !== hospital.id);
      }
      return [...current, hospital].slice(0, 3);
    });
  };
  const toggleSave = (hospital) => {
    setSavedHospitals((current) => {
      if (current.some((item) => item.id === hospital.id)) {
        toast.success("Removed from saved hospitals");
        return current.filter((item) => item.id !== hospital.id);
      }

      toast.success("Saved hospital");
      const summary = {
        id: hospital.id,
        name: hospital.name,
        type: hospital.type,
        city: hospital.city,
        rating: hospital.rating,
        distance: hospital.distance,
      };
      return [summary, ...current].slice(0, 6);
    });
  };
  const compareRows = [
    {
      label: selectedTestName || "Test Price",
      value: (hospital) => {
        const test = getMatchingTest(hospital);
        return test?.price ? `₹${test.price}` : "N/A";
      },
    },
    { label: "Rating", value: (hospital) => hospital.rating ? `${hospital.rating}/5` : "New" },
    { label: "Distance", value: (hospital) => hospital.distance !== undefined ? `${hospital.distance} km` : "--" },
    { label: "Reports Time", value: (hospital) => getMatchingTest(hospital)?.reportTime || "24 hrs" },
    { label: "Home Collection", value: (hospital) => hospital.type?.toLowerCase().includes("diagnostic") ? "Yes" : "No" },
  ];

  useEffect(() => {
    const q = manualLocation.trim();
    if (q.length < 2) return;

    const timeoutId = setTimeout(async () => {
      setLocationSuggestLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5`
        );
        const data = await res.json();
        setLocationSuggestions(data || []);
        setShowLocationSuggestions(true);
      } catch {
        setLocationSuggestions([]);
      } finally {
        setLocationSuggestLoading(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [manualLocation]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.savedHospitals, JSON.stringify(savedHospitals));
  }, [savedHospitals]);

  useEffect(() => {
    const q = search.trim();
    if (q.length < 2) return;

    const timeoutId = setTimeout(() => {
      setSearchHistory((current) => {
        const next = [q, ...current.filter((item) => item.toLowerCase() !== q.toLowerCase())].slice(0, 6);
        localStorage.setItem(STORAGE_KEYS.searchHistory, JSON.stringify(next));
        return next;
      });

      if (FALLBACK_TESTS.some((test) => test.toLowerCase() === q.toLowerCase())) {
        setRecentTests((current) => {
          const next = [q, ...current.filter((item) => item.toLowerCase() !== q.toLowerCase())].slice(0, 5);
          localStorage.setItem(STORAGE_KEYS.recentTests, JSON.stringify(next));
          return next;
        });
      }
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const filtered = displayHospitals
    ?.filter((h) => {
      if (!search) return true;
      return (
	        h.name.toLowerCase().includes(search.toLowerCase()) ||
	        h.tests?.some((t) => t.test?.name?.toLowerCase().includes(search.toLowerCase()))
      );
    })
    ?.filter((h) => {
      if (activeFilter === "Open Now") return h.isOpen === true;
      return true;
    })
    ?.sort((a, b) => {
      if (activeFilter === "Nearest") return (a.distance || 0) - (b.distance || 0);
      if (activeFilter === "Top Rated") return (b.rating || 0) - (a.rating || 0);
      if (activeFilter === "Lowest Price") {
        const aMin = a.tests?.length > 0 ? Math.min(...a.tests.map((t) => t.price)) : 99999;
        const bMin = b.tests?.length > 0 ? Math.min(...b.tests.map((t) => t.price)) : 99999;
        return aMin - bMin;
      }
      const sA = (a.distance || 0) - (a.rating || 0) + (a.tests?.length > 0 ? Math.min(...a.tests.map((t) => t.price)) / 1000 : 0);
      const sB = (b.distance || 0) - (b.rating || 0) + (b.tests?.length > 0 ? Math.min(...b.tests.map((t) => t.price)) / 1000 : 0);
      return sA - sB;
    });

  return (
    <div className="min-h-screen bg-gray-50">

      {/* STICKY HEADER */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="mx-auto max-w-6xl px-4 pb-2 pt-3 sm:px-6 lg:px-8">

          {/* Search + Location row */}
          <div className="flex gap-2 mb-2">
	            <div className="flex-1 relative">
	              <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
	                <span className="text-gray-400 text-sm shrink-0">🔍</span>
	                <input
	                  type="text"
	                  value={search}
	                  onChange={(e) => {
	                    setSearch(e.target.value);
	                    setShowSearchSuggestions(true);
	                  }}
	                  onFocus={() => setShowSearchSuggestions(true)}
	                  onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 150)}
	                  placeholder="Search hospital or test..."
	                  className="bg-transparent outline-none text-sm text-gray-700 w-full placeholder-gray-400"
	                />
	                {search && (
	                  <button onClick={() => setSearch("")} className="text-gray-400 text-xs shrink-0">✕</button>
	                )}
	              </div>

	              <AnimatePresence>
	                {showSearchSuggestions && search.trim().length > 0 && (searchSuggestions.length > 0 || suggestionsLoading) && (
	                  <motion.div
	                    initial={{ opacity: 0, y: -6 }}
	                    animate={{ opacity: 1, y: 0 }}
	                    exit={{ opacity: 0, y: -6 }}
	                    className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden z-40"
	                  >
	                    {suggestionsLoading ? (
	                      <div className="px-3 py-2.5 text-xs text-gray-400">Searching...</div>
	                    ) : (
	                      searchSuggestions.map((item) => (
	                        <button
	                          key={`${item.type}-${item.label}`}
	                          type="button"
	                          onMouseDown={() => {
	                            setSearch(item.label);
	                            setShowSearchSuggestions(false);
	                          }}
	                          className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 border-b border-gray-50 last:border-0"
	                        >
	                          <span className="text-base shrink-0">{item.icon}</span>
	                          <span className="min-w-0 flex-1">
	                            <span className="block text-sm font-semibold text-gray-700 truncate">{item.label}</span>
	                            <span className="block text-xs text-gray-400 truncate">{item.detail}</span>
	                          </span>
	                          <span className="text-xs text-gray-300 capitalize">{item.type}</span>
	                        </button>
	                      ))
	                    )}
	                  </motion.div>
	                )}
	              </AnimatePresence>
	            </div>
            <button
              onClick={() => setShowMap(!showMap)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition shrink-0 ${
                showMap ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-600 border-gray-200"
              }`}
            >
              🗺️
            </button>
          </div>

          {/* Location search */}
          <div className="flex gap-2 mb-2">
	            <div className="flex-1 relative">
	              <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-1.5 border border-blue-100">
	                <span className="text-blue-400 text-xs shrink-0">📍</span>
	                <input
	                  type="text"
	                  value={manualLocation}
	                  onChange={(e) => {
	                    setManualLocation(e.target.value);
	                    setShowLocationSuggestions(true);
	                  }}
	                  onFocus={() => setShowLocationSuggestions(true)}
	                  onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 150)}
	                  onKeyDown={(e) => e.key === "Enter" && handleManualLocation()}
	                  placeholder="Enter city or area..."
	                  className="bg-transparent outline-none text-xs text-blue-700 w-full placeholder-blue-300"
	                />
	                <button onClick={() => handleManualLocation()} className="text-blue-500 text-xs font-bold shrink-0">Go</button>
	              </div>

	              <AnimatePresence>
	                {showLocationSuggestions && manualLocation.trim().length >= 2 && (locationSuggestions.length > 0 || locationSuggestLoading) && (
	                  <motion.div
	                    initial={{ opacity: 0, y: -6 }}
	                    animate={{ opacity: 1, y: 0 }}
	                    exit={{ opacity: 0, y: -6 }}
	                    className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl border border-blue-100 shadow-xl overflow-hidden z-40"
	                  >
	                    {locationSuggestLoading ? (
	                      <div className="px-3 py-2.5 text-xs text-gray-400">Searching...</div>
	                    ) : (
	                      locationSuggestions.map((place) => (
	                        <button
	                          key={place.place_id}
	                          type="button"
	                          onMouseDown={() => applyLocation(place)}
	                          className="w-full flex items-start gap-2 px-3 py-2.5 text-left hover:bg-blue-50 border-b border-gray-50 last:border-0"
	                        >
	                          <span className="text-sm shrink-0">📍</span>
	                          <span className="text-xs text-gray-600 leading-snug">{place.display_name}</span>
	                        </button>
	                      ))
	                    )}
	                  </motion.div>
	                )}
	              </AnimatePresence>
	            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
              {locationLoading ? (
                <span className="animate-pulse">Detecting...</span>
              ) : (
                <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">📍 Live</span>
              )}
            </div>
          </div>

          {/* Filters — horizontal scroll */}
          <div
            ref={filterRef}
            className="flex gap-2 overflow-x-auto pb-1"
            style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
          >
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{ scrollSnapAlign: "start" }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border whitespace-nowrap shrink-0 transition ${
                  activeFilter === f
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-teal-400"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {TRUST_POINTS.map((point) => (
              <span key={point} className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                ✓ {point}
              </span>
            ))}
          </div>

          {(searchHistory.length > 0 || recentTests.length > 0) && (
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {recentTests.map((test) => (
                <button
                  key={`recent-${test}`}
                  type="button"
                  onClick={() => setSearch(test)}
                  className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700"
                >
                  Recently viewed: {test}
                </button>
              ))}
              {searchHistory.map((item) => (
                <button
                  key={`history-${item}`}
                  type="button"
                  onClick={() => setSearch(item)}
                  className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-500 ring-1 ring-gray-200"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">

        {/* MAP */}
        <AnimatePresence>
          {!locationLoading && showMap && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 320 }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
            >
              <HospitalsMap
                hospitals={filtered}
                userLocation={userLocation}
                onHospitalClick={(h) => setSelectedHospital(h)}
                onRealHospitalClick={(h) => navigate("/external-hospital", { state: { hospital: h } })}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Side panel */}
        <AnimatePresence>
          {selectedHospital && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="mb-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                <span className="font-bold text-sm text-gray-800">Hospital Details</span>
                <button onClick={() => setSelectedHospital(null)} className="text-gray-400 text-lg">✕</button>
              </div>
                <div className="p-4">
                <img
                  src={getHospitalImage(selectedHospital)}
                  alt={selectedHospital.name}
                  className="mb-4 h-36 w-full rounded-xl object-cover"
                  loading="lazy"
                />
                <div className="flex gap-3 mb-3">
                  <img
                    src={getHospitalImage(selectedHospital)}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover shrink-0"
                    loading="lazy"
                  />
                  <div>
                    <div className="font-bold text-gray-800 text-sm">{selectedHospital.name}</div>
                    <div className="text-xs text-gray-400">{selectedHospital.type}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-lg text-xs font-bold">⭐ {selectedHospital.rating || "New"}</span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${selectedHospital.isOpen ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                    {selectedHospital.isOpen ? "🟢 Open" : "🔴 Closed"}
                  </span>
                  {selectedHospital.distance !== undefined && (
                    <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-xs font-bold">📏 {selectedHospital.distance} km</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (typeof selectedHospital.id === "number") {
                        navigate(`/hospitals/${selectedHospital.id}`);
                      }
                    }}
                    disabled={typeof selectedHospital.id !== "number"}
                    className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 text-white py-2.5 rounded-xl text-xs font-bold"
                  >
                    {typeof selectedHospital.id === "number" ? "View & Book →" : "Demo hospital"}
                  </button>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedHospital.lat},${selectedHospital.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-600"
                  >
                    🗺️
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading skeletons */}
        {(isLoading || locationLoading) && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded mb-2 w-3/4" />
                    <div className="h-2 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded mb-2" />
                <div className="h-2 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Results count */}
        {!isLoading && !locationLoading && (
          <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-lg font-extrabold text-gray-800">
                  {filtered?.length || 0} verified options
                  {search && <span> for {search}</span>}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Compare price, distance, rating and report time before booking.
                </p>
              </div>
              <div className="text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-2 rounded-xl">
                Best value sorted first
              </div>
            </div>
            {isDemoData && (
              <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                Demo results are showing because live hospital API data is unavailable.
              </div>
            )}
          </div>
        )}

        {!isLoading && !locationLoading && savedHospitals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-gray-800">Saved Hospitals</h2>
                <p className="text-xs text-blue-700">Shortlisted options stay here on this device.</p>
              </div>
              <button
                type="button"
                onClick={() => setSavedHospitals([])}
                className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-blue-700"
              >
                Clear
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {savedHospitals.map((hospital) => (
                <button
                  key={`saved-${hospital.id}`}
                  type="button"
                  onClick={() => {
                    if (typeof hospital.id === "number") {
                      navigate(`/hospitals/${hospital.id}`);
                    }
                  }}
                  className="min-w-[220px] rounded-xl bg-white p-3 text-left shadow-sm ring-1 ring-blue-100"
                >
                  <div className="truncate text-sm font-extrabold text-gray-800">{hospital.name}</div>
                  <div className="mt-1 truncate text-xs text-gray-400">{hospital.type} · {hospital.city}</div>
                  <div className="mt-2 flex items-center justify-between text-xs font-bold">
                    <span className="text-amber-600">★ {hospital.rating || "New"}</span>
                    <span className="text-blue-600">{hospital.distance ?? "--"} km</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Comparison table */}
        {!isLoading && !locationLoading && compareHospitals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-sm"
          >
            <div className="flex flex-col gap-2 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-extrabold text-gray-800">Hospital Comparison</h2>
                <p className="text-xs text-gray-400">Compare up to 3 hospitals before booking.</p>
              </div>
              <button
                type="button"
                onClick={() => setCompareHospitals([])}
                className="self-start rounded-xl bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-200 sm:self-auto"
              >
                Clear
              </button>
            </div>

            {compareHospitals.length === 1 ? (
              <div className="px-4 py-3 text-sm text-gray-500">
                Add one more hospital to see side-by-side comparison.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">
                        Feature
                      </th>
                      {compareHospitals.map((hospital) => (
                        <th key={hospital.id} className="min-w-[150px] px-4 py-3 text-xs font-bold text-gray-700">
                          <div className="flex items-center gap-2">
                            <img
                              src={getHospitalImage(hospital)}
                              alt=""
                              className="h-8 w-8 rounded-lg object-cover"
                              loading="lazy"
                            />
                            <span>{hospital.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {compareRows.map((row) => (
                      <tr key={row.label}>
                        <td className="sticky left-0 z-10 bg-white px-4 py-3 text-xs font-bold text-gray-500">
                          {row.label}
                        </td>
                        {compareHospitals.map((hospital) => (
                          <td key={`${hospital.id}-${row.label}`} className="px-4 py-3 font-semibold text-gray-800">
                            {row.value(hospital)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* Hospital cards */}
        {!isLoading && !locationLoading && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered?.map((hospital, index) => {
              const matchingTest = getMatchingTest(hospital);
              const savingPercent = getSavingPercent(matchingTest);

              return (
              <motion.article
                key={hospital.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="relative rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-lg"
              >
                <img
                  src={getHospitalImage(hospital, index)}
                  alt={`${hospital.name} facility`}
                  className="mb-4 h-32 w-full rounded-xl object-cover"
                  loading="lazy"
                />
                {index === 0 && activeFilter === "All" && (
                  <div className="absolute -top-2.5 left-3">
                    <span className="rounded-full bg-teal-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                      Best value
                    </span>
                  </div>
                )}

                <div className="mb-3 flex items-start justify-between gap-3 mt-1">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-base font-extrabold text-gray-850 text-gray-800">
                        {hospital.name}
                      </h3>
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                        Verified
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">{hospital.type} · {hospital.address}</p>
                  </div>
	                  <div className="shrink-0 rounded-xl bg-amber-50 px-2 py-1 text-xs font-bold text-amber-600">
	                    {hospital.rating || "New"} ★
	                  </div>
	                </div>

                <div className="mb-4 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-gray-50 p-2">
                    <div className="text-[11px] text-gray-400">{matchingTest?.test?.name || "From"}</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-extrabold text-teal-600">₹{matchingTest?.price || getMinPrice(hospital) || "N/A"}</span>
                      {matchingTest?.originalPrice && (
                        <span className="text-xs font-semibold text-gray-300 line-through">₹{matchingTest.originalPrice}</span>
                      )}
                    </div>
                    {savingPercent && (
                      <div className="mt-0.5 text-[11px] font-bold text-green-600">Save {savingPercent}%</div>
                    )}
                  </div>
                  <div className="rounded-xl bg-gray-50 p-2">
                    <div className="text-[11px] text-gray-400">Distance</div>
                    <div className="text-sm font-bold text-gray-700">{hospital.distance ?? "--"} km</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-2">
                    <div className="text-[11px] text-gray-400">Reports</div>
                    <div className="text-sm font-bold text-gray-700">{getMatchingTest(hospital)?.reportTime || "24 hrs"}</div>
                  </div>
                </div>

                <div className="mb-3 flex flex-wrap gap-1.5">
                  {hospital.tests?.slice(0, 3).map((t) => (
                    <span key={t.id} className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                      {t.test?.name} · ₹{t.price}
                    </span>
                  ))}
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span>{hospital.reviewCount || hospital.reviews?.length || 0} reviews</span>
                  <span className={hospital.isOpen ? "font-semibold text-emerald-600" : "font-semibold text-red-500"}>
                    {hospital.isOpen ? "Open now" : "Closed"}
                  </span>
                  <span>No hidden charges</span>
                </div>

	                <div className="flex gap-2 border-t border-gray-100 pt-3">
	                  <button
	                    type="button"
	                    onClick={() => toggleSave(hospital)}
	                    className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
	                      isSaved(hospital)
	                        ? "border-blue-500 bg-blue-50 text-blue-700"
	                        : "border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700"
	                    }`}
	                    aria-label={isSaved(hospital) ? "Unsave hospital" : "Save hospital"}
	                  >
	                    {isSaved(hospital) ? "Saved" : "Save"}
	                  </button>
	                  <button
	                    type="button"
	                    onClick={() => toggleCompare(hospital)}
	                    className={`flex-1 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                      isComparing(hospital)
                        ? "border-teal-600 bg-teal-50 text-teal-700"
                        : "border-gray-200 text-gray-600 hover:border-teal-300 hover:text-teal-700"
                    }`}
                  >
                    {isComparing(hospital) ? "Added" : "Compare"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof hospital.id === "number") {
                        navigate(`/hospitals/${hospital.id}`);
                      } else {
                        setSelectedHospital(hospital);
                      }
                    }}
                    className="flex-1 rounded-xl bg-teal-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-teal-700"
                  >
                    {typeof hospital.id === "number" ? "Book Test" : "View Details"}
                  </button>
                </div>
              </motion.article>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !locationLoading && filtered?.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-12 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-bold text-gray-700 mb-1">No matching hospitals found</h3>
            <p className="text-gray-400 text-sm mb-4">Try a popular test or clear filters to see more options.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {FALLBACK_TESTS.slice(0, 4).map((test) => (
                <button
                  key={test}
                  type="button"
                  onClick={() => setSearch(test)}
                  className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700"
                >
                  {test}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
