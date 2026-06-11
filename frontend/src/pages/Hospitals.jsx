import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import API from "../services/api";
import HospitalsMap from "../components/HospitalsMap";

const FILTERS = ["All", "Nearest", "Top Rated", "Lowest Price", "Open Now"];

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
  const [manualLocation, setManualLocation] = useState("");

  const handleManualLocation = async () => {
    if (!manualLocation.trim()) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualLocation)}&format=json&limit=1`
      );
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

  const filtered = hospitals
    ?.filter((h) => {
      if (!search) return true;
      return (
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.tests?.some((t) => t.test?.name.toLowerCase().includes(search.toLowerCase()))
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
        <div className="max-w-5xl mx-auto px-4 pt-3 pb-2">

          {/* Search + Location row */}
          <div className="flex gap-2 mb-2">
            <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
              <span className="text-gray-400 text-sm shrink-0">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search hospital or test..."
                className="bg-transparent outline-none text-sm text-gray-700 w-full placeholder-gray-400"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-gray-400 text-xs shrink-0">✕</button>
              )}
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
            <div className="flex-1 flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-1.5 border border-blue-100">
              <span className="text-blue-400 text-xs shrink-0">📍</span>
              <input
                type="text"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualLocation()}
                placeholder="Enter city or area..."
                className="bg-transparent outline-none text-xs text-blue-700 w-full placeholder-blue-300"
              />
              <button onClick={handleManualLocation} className="text-blue-500 text-xs font-bold shrink-0">Go</button>
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
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4">

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
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-xl shrink-0">🏥</div>
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
                    onClick={() => navigate(`/hospitals/${selectedHospital.id}`)}
                    className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 text-white py-2.5 rounded-xl text-xs font-bold"
                  >
                    View & Book →
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700">{filtered?.length}</span> hospitals
              {search && <span> for "<strong>{search}</strong>"</span>}
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Best value first
            </div>
          </div>
        )}

        {/* Hospital cards */}
        {!isLoading && !locationLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered?.map((hospital, index) => (
              <motion.div
                key={hospital.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => navigate(`/hospitals/${hospital.id}`)}
                className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg hover:border-teal-200 transition cursor-pointer group relative"
              >
                {/* Best Value badge */}
                {index === 0 && activeFilter === "All" && (
                  <div className="absolute -top-2.5 left-3">
                    <span className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm">
                      🏆 Best Value
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-start mb-3 mt-1">
                  <div className="flex gap-2.5 items-center">
                    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                      🏥
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm group-hover:text-teal-600 transition leading-tight">
                        {hospital.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">{hospital.type}</p>
                    </div>
                  </div>
                  <div className="bg-amber-50 text-amber-600 px-2 py-1 rounded-lg text-xs font-bold shrink-0">
                    ⭐ {hospital.rating || "New"}
                  </div>
                </div>

                {/* Address */}
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <span>📍</span> {hospital.address}
                </p>

                {/* Badges */}
                <div className="flex gap-2 mb-3 flex-wrap">
                  {hospital.distance !== undefined && (
                    <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-xs font-medium">
                      📏 {hospital.distance} km
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${hospital.isOpen ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                    {hospital.isOpen ? "🟢 Open" : "🔴 Closed"}
                  </span>
                </div>

                {/* Tests */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {hospital.tests?.slice(0, 3).map((t) => (
                    <span key={t.id} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg text-xs">
                      {t.test?.name}
                    </span>
                  ))}
                  {hospital.tests?.length > 3 && (
                    <span className="bg-gray-100 text-gray-400 px-2 py-0.5 rounded-lg text-xs">
                      +{hospital.tests.length - 3}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-400">
                    From <span className="text-teal-600 font-bold text-sm ml-0.5">
                      ₹{hospital.tests?.length > 0 ? Math.min(...hospital.tests.map((t) => t.price)) : "N/A"}
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
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-bold text-gray-700 mb-1">No hospitals found</h3>
            <p className="text-gray-400 text-sm">Try searching with a different term</p>
          </div>
        )}
      </div>
    </div>
  );
}
