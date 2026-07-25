import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import API from "../services/api";

export default function Compare() {
  const navigate = useNavigate();
  const [selectedTest, setSelectedTest] = useState("");

  const { data: tests } = useQuery({
    queryKey: ["tests"],
    queryFn: () => API.get("/tests").then(r => r.data),
  });

  const { data: hospitals, isLoading } = useQuery({
    queryKey: ["compare", selectedTest],
    queryFn: () => API.get("/hospitals").then(r => r.data),
    enabled: true,
  });

  // Filter hospitals jo selected test offer karte hain
  const filtered = hospitals
    ?.map(h => {
      const testPrice = h.tests?.find(t => t.test?.name === selectedTest || t.testId === parseInt(selectedTest));
      return { ...h, matchedTest: testPrice };
    })
    ?.filter(h => selectedTest ? h.matchedTest : true)
    ?.sort((a, b) => (a.matchedTest?.price || 99999) - (b.matchedTest?.price || 99999));

  const minPrice = filtered?.length > 0 ? Math.min(...filtered.filter(h => h.matchedTest).map(h => h.matchedTest.price)) : 0;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-teal-600 text-sm mb-3 flex items-center gap-1">
            ← Back
          </button>
          <h1 className="text-2xl font-extrabold text-gray-800">Price Comparison</h1>
          <p className="text-gray-400 text-sm mt-1">Compare test prices across all hospitals</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Test selector */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Select Test to Compare</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTest("")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                selectedTest === "" ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-600 border-gray-200 hover:border-teal-400"
              }`}
            >
              All Tests
            </button>
            {tests?.map(test => (
              <button key={test.id}
                onClick={() => setSelectedTest(test.name)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                  selectedTest === test.name ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-600 border-gray-200 hover:border-teal-400"
                }`}
              >
                {test.name}
              </button>
            ))}
          </div>
        </div>

        {/* Summary bar */}
        {selectedTest && filtered?.filter(h => h.matchedTest).length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-teal-600 rounded-2xl p-4 text-white">
              <div className="text-xs opacity-70 mb-1">Lowest Price</div>
              <div className="text-2xl font-extrabold">₹{minPrice}</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="text-xs text-gray-400 mb-1">Highest Price</div>
              <div className="text-2xl font-extrabold text-gray-800">
                ₹{Math.max(...filtered.filter(h => h.matchedTest).map(h => h.matchedTest.price))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="text-xs text-gray-400 mb-1">Hospitals Available</div>
              <div className="text-2xl font-extrabold text-gray-800">
                {filtered.filter(h => h.matchedTest).length}
              </div>
            </div>
            <div className="bg-green-50 rounded-2xl border border-green-100 p-4">
              <div className="text-xs text-green-600 mb-1">Max Savings</div>
              <div className="text-2xl font-extrabold text-green-600">
                ₹{Math.max(...filtered.filter(h => h.matchedTest).map(h => h.matchedTest.price)) - minPrice}
              </div>
            </div>
          </motion.div>
        )}

        {/* Comparison table */}
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse border border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">

            {/* Table header */}
            <div className="grid grid-cols-12 bg-gray-900 px-5 py-3 text-xs font-bold uppercase tracking-wide text-white">
              <div className="col-span-4">Hospital</div>
              <div className="col-span-2 text-center">Rating</div>
              <div className="col-span-2 text-center">Distance</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Action</div>
            </div>

            {/* Table rows */}
            {filtered?.map((hospital, i) => {
              const price = hospital.matchedTest?.price;
              const isBest = price === minPrice && selectedTest;
              const savings = price && minPrice ? price - minPrice : 0;

              return (
                <motion.div key={hospital.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={`grid grid-cols-12 px-5 py-4 items-center border-b border-gray-50 last:border-0 hover:bg-gray-50 transition ${isBest ? 'bg-teal-50' : ''}`}
                >
                  {/* Hospital name */}
                  <div className="col-span-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center text-lg shrink-0">🏥</div>
                      <div>
                        <div className="font-bold text-gray-800 text-sm flex items-center gap-2">
                          {hospital.name}
                          {isBest && <span className="bg-teal-600 text-white text-xs px-2 py-0.5 rounded-full">Best</span>}
                        </div>
                        <div className="text-xs text-gray-400">{hospital.type}</div>
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="col-span-2 text-center">
                    <span className="text-amber-500 font-bold text-sm">⭐ {hospital.rating || "N/A"}</span>
                  </div>

                  {/* Distance */}
                  <div className="col-span-2 text-center">
                    <span className="text-blue-600 text-sm font-medium">
                      {hospital.distance ? `${hospital.distance} km` : "—"}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 text-center">
                    {price ? (
                      <div>
                        <div className={`font-extrabold text-base ${isBest ? 'text-teal-600' : 'text-gray-800'}`}>
                          ₹{price}
                        </div>
                        {savings > 0 && (
                          <div className="text-xs text-red-400 line-through">₹{price}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-300 text-sm">Not available</span>
                    )}
                  </div>

                  {/* Action */}
                  <div className="col-span-2 text-center">
                    <button
                      onClick={() => navigate(`/hospitals/${hospital.id}${hospital.matchedTest ? `?testId=${hospital.matchedTest.testId}&price=${price}` : ''}`)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        price ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!price}
                    >
                      {price ? 'Book →' : 'N/A'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filtered?.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-bold text-gray-700">No hospitals found</h3>
          </div>
        )}
      </div>
    </div>
  );
}