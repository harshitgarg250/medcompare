import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import API from "../services/api";
import HospitalsMap from "../components/HospitalsMap";

const FILTERS = ["All", "Nearest", "Top Rated", "Lowest Price", "Open Now"];

const CITIES = [
  "Dehradun",
  "Delhi",
  "Mumbai",
  "Saharanpur",
  "Haridwar",
  "Mussoorie",
];

export default function Hospitals() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [activeFilter, setActiveFilter] = useState("All");
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [manualLocation, setManualLocation] = useState("");
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationSuggestionsLoading, setLocationSuggestionsLoading] = useState(false);

  const handleManualLocation = async (value = manualLocation) => {
    const query = (value || "").trim();
    if (!query) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setUserLocation({ lat: parseFloat(lat), lng: parseFloat(lon) });
        toast.success(`📍 ${data[0].display_name.split(",")[0]}`);
      } else {
        toast.error("Location not found");
      }
    } catch {
      toast.error("Could not fetch location");
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocationLoading(false); },
      () => { setUserLocation({ lat: 30.3165, lng: 78.0322 }); setLocationLoading(false); }
    );
  }, []);

  useEffect(() => {
    const query = manualLocation.trim();
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
  }, [manualLocation]);

  const { data: hospitals, isLoading } = useQuery({
    queryKey: ["hospitals", userLocation],
    queryFn: () => userLocation
      ? API.get(`/hospitals/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=200`).then(r => r.data)
      : API.get("/hospitals").then(r => r.data),
    enabled: !locationLoading,
  });

  const filtered = hospitals
    ?.filter(h => {
      if (!search) return true;
      return h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.tests?.some(t => t.test?.name.toLowerCase().includes(search.toLowerCase()));
    })
    ?.filter(h => activeFilter === "Open Now" ? h.isOpen === true : true)
    ?.sort((a, b) => {
      if (activeFilter === "Nearest") return (a.distance || 0) - (b.distance || 0);
      if (activeFilter === "Top Rated") return (b.rating || 0) - (a.rating || 0);
      if (activeFilter === "Lowest Price") {
        const aMin = a.tests?.length > 0 ? Math.min(...a.tests.map(t => t.price)) : 99999;
        const bMin = b.tests?.length > 0 ? Math.min(...b.tests.map(t => t.price)) : 99999;
        return aMin - bMin;
      }
      const sA = (a.distance || 0) - (a.rating || 0) + (a.tests?.length > 0 ? Math.min(...a.tests.map(t => t.price)) / 1000 : 0);
      const sB = (b.distance || 0) - (b.rating || 0) + (b.tests?.length > 0 ? Math.min(...b.tests.map(t => t.price)) / 1000 : 0);
      return sA - sB;
    });

  return (
    <div className="min-h-screen bg-gray-50">

      {/* STICKY HEADER */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-2">

          {/* Search row */}
          <div className="flex gap-2 mb-2">
            <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
              <span className="text-gray-400 shrink-0">🔍</span>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search hospital or test..."
                className="bg-transparent outline-none text-sm text-gray-700 w-full placeholder-gray-400" />
              {search && <button onClick={() => setSearch("")} className="text-gray-400 text-xs shrink-0">✕</button>}
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2 border border-blue-100 w-56 relative">
              <span className="text-blue-400 text-xs shrink-0">📍</span>
              <input type="text" value={manualLocation} onChange={e => setManualLocation(e.target.value)}
                onFocus={() => setShowLocationSuggestions(true)}
                onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                onKeyDown={e => e.key === "Enter" && handleManualLocation()}
                placeholder="Enter city or area..."
                className="bg-transparent outline-none text-xs text-blue-700 w-full placeholder-blue-300" />
              <button onClick={handleManualLocation} className="text-blue-500 text-xs font-bold shrink-0">Go</button>

              <AnimatePresence>
                {showLocationSuggestions && (locationSuggestionsLoading || locationSuggestions.length > 0) && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden z-50 max-h-72 overflow-y-auto">
                    <div className="px-3 py-2 bg-blue-50 border-b border-blue-100 text-[11px] font-semibold uppercase tracking-wide text-blue-400">Cities</div>
                    {locationSuggestionsLoading && locationSuggestions.length === 0 && (
                      <div className="px-3 py-2 text-sm text-blue-500">Searching cities...</div>
                    )}
                    {locationSuggestions.map((city) => (
                      <button key={city.label}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setManualLocation(city.label);
                          setShowLocationSuggestions(false);
                          handleManualLocation(city.label);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition">
                        <span className="text-blue-400">📍</span>
                        <span>{city.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => setShowMap(!showMap)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition shrink-0 ${showMap ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-600 border-gray-200 hover:border-teal-400"}`}>
              🗺️ {showMap ? "Hide" : "Map"}
            </button>
          </div>

          {/* Mobile location */}
          <div className="flex sm:hidden gap-2 mb-2">
            <div className="flex-1 flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2 border border-blue-100 relative">
              <span className="text-blue-400 text-xs shrink-0">📍</span>
              <input type="text" value={manualLocation} onChange={e => setManualLocation(e.target.value)}
                onFocus={() => setShowLocationSuggestions(true)}
                onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                onKeyDown={e => e.key === "Enter" && handleManualLocation()}
                placeholder="Enter city or area..."
                className="bg-transparent outline-none text-xs text-blue-700 w-full placeholder-blue-300" />
              <button onClick={handleManualLocation} className="text-blue-500 text-xs font-bold shrink-0">Go</button>

              <AnimatePresence>
                {showLocationSuggestions && (locationSuggestionsLoading || locationSuggestions.length > 0) && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden z-50 max-h-72 overflow-y-auto">
                    <div className="px-3 py-2 bg-blue-50 border-b border-blue-100 text-[11px] font-semibold uppercase tracking-wide text-blue-400">Cities</div>
                    {locationSuggestionsLoading && locationSuggestions.length === 0 && (
                      <div className="px-3 py-2 text-sm text-blue-500">Searching cities...</div>
                    )}
                    {locationSuggestions.map((city) => (
                      <button key={city.label}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setManualLocation(city.label);
                          setShowLocationSuggestions(false);
                          handleManualLocation(city.label);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition">
                        <span className="text-blue-400">📍</span>
                        <span>{city.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center">
              {locationLoading
                ? <span className="text-xs text-gray-400 animate-pulse">Detecting...</span>
                : <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">📍 Live</span>}
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollSnapType: "x mandatory" }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                style={{ scrollSnapAlign: "start" }}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold border whitespace-nowrap shrink-0 transition ${
                  activeFilter === f ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-600 border-gray-200 hover:border-teal-400"
                }`}>
                {f}
              </button>
            ))}
            <div className="hidden sm:flex items-center ml-auto shrink-0">
              {locationLoading
                ? <span className="text-xs text-gray-400 animate-pulse">Detecting location...</span>
                : <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">📍 Live Location</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* MAP */}
        <AnimatePresence>
          {!locationLoading && showMap && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 400 }} exit={{ opacity: 0, height: 0 }}
              className="mb-6 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <HospitalsMap hospitals={filtered} userLocation={userLocation}
                onHospitalClick={h => setSelectedHospital(h)}
                onRealHospitalClick={h => navigate("/external-hospital", { state: { hospital: h } })} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected hospital panel */}
        <AnimatePresence>
          {selectedHospital && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
              className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100">
                <span className="font-bold text-sm text-gray-800">Hospital Details</span>
                <button onClick={() => setSelectedHospital(null)} className="text-gray-400 text-lg hover:text-gray-600">✕</button>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex gap-3 items-start lg:col-span-2">
                  <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-2xl shrink-0">🏥</div>
                  <div>
                    <div className="font-bold text-gray-800">{selectedHospital.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{selectedHospital.type}</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg text-xs font-bold">⭐ {selectedHospital.rating || "New"}</span>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${selectedHospital.isOpen ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                        {selectedHospital.isOpen ? "🟢 Open" : "🔴 Closed"}
                      </span>
                      {selectedHospital.distance !== undefined && (
                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg text-xs font-bold">📏 {selectedHospital.distance} km</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => navigate(`/hospitals/${selectedHospital.id}`)}
                    className="bg-gradient-to-r from-teal-500 to-blue-500 text-white py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition">
                    View & Book →
                  </button>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${selectedHospital.lat},${selectedHospital.lng}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-1 bg-blue-50 text-blue-600 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-100 transition">
                    🗺️ Directions
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {(isLoading || locationLoading) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
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

        {/* Results header */}
        {!isLoading && !locationLoading && (
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-500">
              <span className="font-bold text-gray-700">{filtered?.length}</span> hospitals found
              {search && <span> for "<strong>{search}</strong>"</span>}
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Best value first
            </div>
          </div>
        )}

        {/* Hospital cards grid */}
        {!isLoading && !locationLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered?.map((hospital, index) => (
              <motion.div key={hospital.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
                onClick={() => navigate(`/hospitals/${hospital.id}`)}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-teal-200 transition cursor-pointer group relative">

                {index === 0 && activeFilter === "All" && (
                  <div className="absolute -top-2.5 left-3">
                    <span className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm">
                      🏆 Best Value
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-start mb-3 mt-1">
                  <div className="flex gap-2.5 items-center">
                    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-xl shrink-0">🏥</div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm group-hover:text-teal-600 transition leading-tight">{hospital.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{hospital.type}</p>
                    </div>
                  </div>
                  <div className="bg-amber-50 text-amber-600 px-2 py-1 rounded-lg text-xs font-bold shrink-0">
                    ⭐ {hospital.rating || "New"}
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <span>📍</span> {hospital.address}
                </p>

                <div className="flex gap-2 mb-3 flex-wrap">
                  {hospital.distance !== undefined && (
                    <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-xs font-medium">📏 {hospital.distance} km</span>
                  )}
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${hospital.isOpen ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                    {hospital.isOpen ? "🟢 Open" : "🔴 Closed"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {hospital.tests?.slice(0, 2).map(t => (
                    <span key={t.id} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg text-xs">{t.test?.name}</span>
                  ))}
                  {hospital.tests?.length > 2 && (
                    <span className="bg-gray-100 text-gray-400 px-2 py-0.5 rounded-lg text-xs">+{hospital.tests.length - 2}</span>
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-400">
                    From <span className="text-teal-600 font-bold text-sm ml-0.5">
                      ₹{hospital.tests?.length > 0 ? Math.min(...hospital.tests.map(t => t.price)) : "N/A"}
                    </span>
                  </div>
                  <button className="bg-teal-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-teal-700 transition">
                    View →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !locationLoading && filtered?.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-bold text-gray-700 text-lg mb-2">No hospitals found</h3>
            <p className="text-gray-400 text-sm">Try a different search or location</p>
          </div>
        )}
      </div>
    </div>
  );
}