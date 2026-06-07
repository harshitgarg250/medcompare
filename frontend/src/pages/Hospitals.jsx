import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import API from "../services/api";
import HospitalsMap from "../components/HospitalsMap";
import toast from "react-hot-toast";

const FILTERS = ["All", "Nearest", "Top Rated", "Lowest Price", "Open Now"];

function Hospitals() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [activeFilter, setActiveFilter] = useState("All");
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [showMap, setShowMap] = useState(true);
  const [manualLocation, setManualLocation] = useState("");

  const handleManualLocation = async () => {
    if (!manualLocation.trim()) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualLocation)}&format=json&limit=1`,
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setUserLocation({ lat: parseFloat(lat), lng: parseFloat(lon) });
        toast.success(`Location set to ${data[0].display_name.split(",")[0]}`);
      } else {
        toast.error("Location not found. Try another city.");
      }
    } catch {
      toast.error("Could not fetch location");
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationLoading(false);
      },
      () => {
        setUserLocation({ lat: 30.3165, lng: 78.0322 });
        setLocationLoading(false);
      },
    );
  }, []);

  const { data: hospitals, isLoading } = useQuery({
    queryKey: ["hospitals", userLocation],
    queryFn: () =>
      userLocation
        ? API.get(
            `/hospitals/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=5000`,
          ).then((res) => res.data)
        : API.get("/hospitals").then((res) => res.data),
    enabled: !locationLoading,
  });

  const filtered = hospitals
    ?.filter((h) => {
      if (!search) return true;
      return (
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.tests?.some((t) =>
          t.test?.name.toLowerCase().includes(search.toLowerCase()),
        )
      );
    })
    ?.sort((a, b) => {
      if (activeFilter === "Nearest") return a.distance - b.distance;
      if (activeFilter === "Top Rated") return b.rating - a.rating;
      if (activeFilter === "Lowest Price")
        return (a.tests?.[0]?.price || 0) - (b.tests?.[0]?.price || 0);
      if (activeFilter === "Open Now") return b.isOpen - a.isOpen;
      const scoreA =
        (a.distance || 0) -
        (a.rating || 0) +
        Math.min(...(a.tests?.map((t) => t.price) || [0])) / 1000;
      const scoreB =
        (b.distance || 0) -
        (b.rating || 0) +
        Math.min(...(b.tests?.map((t) => t.price) || [0])) / 1000;
      return scoreA - scoreB;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TOP BAR */}
      <div className="bg-white border-b border-gray-200 sticky top-[57px] z-10 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-col gap-3">
          <div className="flex gap-2 flex-wrap w-full md:w-auto">
            <div className="flex gap-2 bg-gray-100 rounded-xl px-4 py-2 w-full md:w-72">
              <span className="text-gray-400">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search hospital or test..."
                className="bg-transparent outline-none text-sm text-gray-700 w-full placeholder-gray-400"
              />
            </div>
            <div className="flex gap-2 bg-blue-50 rounded-xl px-4 py-2 w-full md:w-64 border border-blue-100">
              <span className="text-blue-400">📍</span>
              <input
                type="text"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualLocation()}
                placeholder="Enter city or area..."
                className="bg-transparent outline-none text-sm text-blue-700 w-full placeholder-blue-300"
              />
              <button
                onClick={handleManualLocation}
                className="text-blue-500 text-xs font-bold hover:text-blue-700"
              >
                Go
              </button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap items-center justify-center md:justify-start">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  activeFilter === f
                    ? "bg-teal-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-teal-400"
                }`}
              >
                {f}
              </button>
            ))}
            <button
              onClick={() => setShowMap(!showMap)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition border ${
                showMap
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white border-gray-200 text-gray-600"
              }`}
            >
              🗺️ {showMap ? "Hide Map" : "Show Map"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* LOCATION STATUS */}
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
          <span>📍</span>
          <span>
            {locationLoading
              ? "Detecting your location..."
              : "Showing hospitals near your location"}
          </span>
          {!locationLoading && (
            <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs font-medium">
              Live Location
            </span>
          )}
        </div>

        {/* MAP + DETAIL PANEL */}
        {!locationLoading && showMap && (
          <div className="mb-8 flex gap-4" style={{ height: "480px" }}>
            {/* MAP */}
            <div
              className={`rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-all ${selectedHospital ? "w-3/5" : "w-full"}`}
            >
              <HospitalsMap
                hospitals={filtered}
                userLocation={userLocation}
                onHospitalClick={(h) => setSelectedHospital(h)}
                onRealHospitalClick={(h) =>
                  navigate("/external-hospital", { state: { hospital: h } })
                }
              />
            </div>

            {/* DETAIL PANEL */}
            {selectedHospital && (
              <div className="w-2/5 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex justify-between items-center">
                  <span className="font-bold text-sm text-gray-800">
                    Hospital Details
                  </span>
                  <button
                    onClick={() => setSelectedHospital(null)}
                    className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-4">
                  {/* Name & Type */}
                  <div className="flex gap-3 items-start mb-4">
                    <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                      🏥
                    </div>
                    <div>
                      <h2 className="font-extrabold text-gray-800 text-base leading-tight">
                        {selectedHospital.name}
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {selectedHospital.type}
                      </p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-lg text-xs font-bold">
                      ⭐ {selectedHospital.rating || "New"}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        selectedHospital.isOpen
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {selectedHospital.isOpen ? "🟢 Open Now" : "🔴 Closed"}
                    </span>
                    {selectedHospital.distance !== undefined && (
                      <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-xs font-bold">
                        📏 {selectedHospital.distance} km
                      </span>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-2">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Contact Info
                    </div>
                    <div className="flex gap-2 text-xs text-gray-600">
                      <span>📍</span>
                      <span>
                        {selectedHospital.address}, {selectedHospital.city}
                      </span>
                    </div>
                    {selectedHospital.phone && (
                      <div className="flex gap-2 text-xs text-gray-600">
                        <span>📞</span>
                        <a
                          href={`tel:${selectedHospital.phone}`}
                          className="text-teal-600 hover:underline"
                        >
                          {selectedHospital.phone}
                        </a>
                      </div>
                    )}
                    {selectedHospital.email && (
                      <div className="flex gap-2 text-xs text-gray-600">
                        <span>✉️</span>
                        <a
                          href={`mailto:${selectedHospital.email}`}
                          className="text-teal-600 hover:underline"
                        >
                          {selectedHospital.email}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Highlights */}
                  <div className="mb-4">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Highlights
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "NABL Accredited",
                        "Home Collection",
                        "Same Day Reports",
                        "Online Booking",
                        "Emergency Services",
                      ].map((b) => (
                        <span
                          key={b}
                          className="bg-teal-50 text-teal-700 px-2 py-1 rounded-full text-xs font-medium"
                        >
                          ✓ {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tests & Prices */}
                  <div className="mb-4">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Tests & Prices
                    </div>
                    <div className="space-y-2">
                      {selectedHospital.tests?.map((t) => (
                        <div
                          key={t.id}
                          className="flex justify-between items-center bg-gray-50 rounded-xl px-3 py-2"
                        >
                          <span className="text-xs font-medium text-gray-700">
                            {t.test?.name}
                          </span>
                          <span className="text-xs font-bold text-teal-600">
                            ₹{t.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Directions */}

                  <div className="mb-4">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Navigation
                    </div>
                    href=
                    {`https://www.google.com/maps/dir/?api=1&destination=${selectedHospital.lat},${selectedHospital.lng}`}
                    target="_blank" rel="noreferrer" className="flex
                    items-center gap-2 bg-blue-50 text-blue-600 px-3 py-2
                    rounded-xl text-xs font-semibold hover:bg-blue-100
                    transition w-full justify-center"
                    <a>🗺️ Get Directions on Google Maps</a>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() =>
                        navigate(`/hospitals/${selectedHospital.id}`)
                      }
                      className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 rounded-xl text-sm font-bold hover:opacity-90 transition"
                    >
                      View Full Profile →
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/hospitals/${selectedHospital.id}`)
                      }
                      className="w-full border border-teal-500 text-teal-600 py-3 rounded-xl text-sm font-bold hover:bg-teal-50 transition"
                    >
                      📅 Book Appointment
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LOADING SKELETONS */}
        {(isLoading || locationLoading) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2 w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* HOSPITALS GRID */}
        {!isLoading && !locationLoading && (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-gray-500 text-sm">
                <span className="font-semibold text-gray-700">
                  {filtered?.length} hospitals
                </span>{" "}
                available for booking
                {search && (
                  <span>
                    {" "}
                    for "<strong>{search}</strong>"
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                Sorted by best value
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered?.map((hospital, index) => (
                <div
                  key={hospital.id}
                  onClick={() => navigate(`/hospitals/${hospital.id}`)}
                  className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-teal-200 transition cursor-pointer group relative"
                >
                  {index === 0 && activeFilter === "All" && (
                    <div className="absolute -top-3 left-4">
                      <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        🏆 Best Value
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3 items-center">
                      <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-2xl">
                        🏥
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 group-hover:text-teal-600 transition">
                          {hospital.name}
                        </h3>
                        <p className="text-xs text-gray-400">{hospital.type}</p>
                      </div>
                    </div>
                    <div className="bg-amber-50 text-amber-600 px-2 py-1 rounded-lg text-xs font-bold">
                      ⭐ {hospital.rating || "New"}
                    </div>
                  </div>

                  <div className="flex gap-4 mb-3 text-xs text-gray-500">
                    <span>📍 {hospital.address}</span>
                  </div>

                  <div className="flex gap-3 mb-4 text-xs">
                    {hospital.distance !== undefined && (
                      <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-medium">
                        📏 {hospital.distance} km
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 rounded-lg font-medium ${
                        hospital.isOpen
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {hospital.isOpen ? "🟢 Open" : "🔴 Closed"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {hospital.tests?.slice(0, 3).map((t) => (
                      <span
                        key={t.id}
                        className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs"
                      >
                        {t.test?.name}
                      </span>
                    ))}
                    {hospital.tests?.length > 3 && (
                      <span className="bg-gray-100 text-gray-400 px-2 py-1 rounded-lg text-xs">
                        +{hospital.tests.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-400">
                      Starting from
                      <span className="text-teal-600 font-bold text-base ml-1">
                        ₹
                        {hospital.tests?.length > 0
                          ? Math.min(...hospital.tests.map((t) => t.price))
                          : "N/A"}
                      </span>
                    </div>
                    <button className="bg-teal-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-teal-700 transition">
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Hospitals;
