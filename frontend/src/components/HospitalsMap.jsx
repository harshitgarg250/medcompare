import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const realHospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

function SetCenter({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.setView(center, 13)
  }, [center, map])
  return null
}

// Real hospitals fetch from Overpass API
function FetchRealHospitals({ center, onFetch }) {
  const map = useMap()

  useEffect(() => {
    if (!center) return

    const fetchHospitals = async () => {
      try {
        const { lat, lng } = center
        const radius = 5000 // 5km
        const query = `
          [out:json][timeout:25];
          (
            node["amenity"="hospital"](around:${radius},${lat},${lng});
            node["amenity"="clinic"](around:${radius},${lat},${lng});
            node["amenity"="doctors"](around:${radius},${lat},${lng});
            way["amenity"="hospital"](around:${radius},${lat},${lng});
          );
          out center;
        `
        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query
        })
        const data = await res.json()
        onFetch(data.elements || [])
      } catch (err) {
        console.log('Overpass error:', err)
      }
    }

    fetchHospitals()
  }, [center])

  return null
}

function HospitalsMap({ hospitals, userLocation, onHospitalClick }) {
  const [realHospitals, setRealHospitals] = useState([])

  const center = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [30.3165, 78.0322]

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%', borderRadius: '16px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <SetCenter center={center} />

      {/* Fetch real hospitals */}
      <FetchRealHospitals
        center={userLocation}
        onFetch={setRealHospitals}
      />

      {/* User location */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>
            <div className="text-center">
              <strong>📍 Your Location</strong>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Our DB hospitals — Green markers */}
      {hospitals?.map(hospital => (
        <Marker
          key={hospital.id}
          position={[hospital.lat, hospital.lng]}
          icon={hospitalIcon}
          eventHandlers={{
            click: () => onHospitalClick && onHospitalClick(hospital)
          }}
        >
          <Popup>
            <div style={{ minWidth: '160px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                🏥 {hospital.name}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                {hospital.type}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>
                📏 {hospital.distance} km away
              </div>
              <div style={{ fontSize: '12px', color: '#0d9488', fontWeight: 'bold', marginBottom: '6px' }}>
                From ₹{hospital.tests?.[0]?.price || 'N/A'}
              </div>
              <div style={{ fontSize: '11px', background: '#0d9488', color: '#fff', padding: '4px 8px', borderRadius: '6px', textAlign: 'center', cursor: 'pointer' }}
                onClick={() => onHospitalClick && onHospitalClick(hospital)}
              >
                View & Book →
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Real hospitals from OpenStreetMap — Blue markers */}
      {realHospitals.map(h => {
        const lat = h.lat || h.center?.lat
        const lng = h.lon || h.center?.lon
        if (!lat || !lng) return null
        return (
          <Marker
            key={h.id}
            position={[lat, lng]}
            icon={realHospitalIcon}
          >
            <Popup>
              <div style={{ minWidth: '160px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  🏥 {h.tags?.name || 'Hospital'}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  {h.tags?.amenity === 'hospital' ? 'Hospital' :
                   h.tags?.amenity === 'clinic' ? 'Clinic' : 'Medical Center'}
                </div>
                {h.tags?.['addr:street'] && (
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    📍 {h.tags?.['addr:street']}
                  </div>
                )}
                {h.tags?.phone && (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    📞 {h.tags?.phone}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}

export default HospitalsMap