import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import AiAssistant from "./pages/AiAssistant";
import Hospitals from "./pages/Hospitals";
import HospitalDetail from "./pages/HospitalDetail";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import Register from "./pages/Register";
import ExternalHospital from "./pages/ExternalHospital";
import MyReports from "./pages/MyReports";
import ReportDetail from "./pages/ReportDetail";
import Profile from './pages/Profile';
import Compare from './pages/Compare';
import AIChat from './components/AIChat/AIChat';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/hospitals/:id" element={<HospitalDetail />} />
        <Route path="/booking/:hospitalId" element={<Booking />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/reports" element={<MyReports />} />
        <Route path="/reports/:id" element={<ReportDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ai" element={<AiAssistant />} />
        <Route path="/ai-chat" element={<AIChat />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/external-hospital" element={<ExternalHospital />} />
      </Routes>
    </div>
  );
}

export default App;