import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Hospitals from './pages/Hospitals'
import HospitalDetail from './pages/HospitalDetail'
import Booking from './pages/Booking'
import MyBookings from './pages/MyBookings'
import Register from './pages/Register'





function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/hospitals/:id" element={<HospitalDetail />} />
        <Route path="/booking/:hospitalId" element={<Booking />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  )
}

export default App