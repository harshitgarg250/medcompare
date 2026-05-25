import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Hospitals from './pages/Hospitals'
import HospitalDetail from './pages/HospitalDetail'
import Booking from './pages/Booking'



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
      </Routes>
    </div>
  )
}

export default App