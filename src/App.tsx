import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import RegisterHub from './pages/RegisterHub';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Contests from './pages/Contests';
import ContestDetails from './pages/ContestDetails';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import CandidateDashboard from './pages/CandidateDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EmployerRegister from './pages/EmployerRegister';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StudyCanada from './pages/StudyCanada';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isAdminDashboard = location.pathname === '/admin/dashboard';

  return (
    <div className="app">
      {!isAdminDashboard && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<RegisterHub />} />
          <Route path="/register/candidat" element={<Register />} />
          <Route path="/register/employeur" element={<EmployerRegister />} />
          <Route path="/employer/register" element={<Navigate to="/register/employeur" replace />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-email-employee" element={<VerifyEmail />} />
          {/* Permet de gérer les liens de vérification envoyés par l'API pour les employeurs :
             http://localhost:5173/api/auth/verify-email?token=... */}
          <Route path="/api/auth/verify-email" element={<VerifyEmail />} />
           {/* Lien de vérification unique pour employeurs et candidats :
             http://localhost:5173/api?token=... */}
          <Route path="/api" element={<VerifyEmail />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/contests" element={<Contests />} />
          <Route path="/contests/:id" element={<ContestDetails />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/etudes-canada" element={<StudyCanada />} />
          <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
          <Route path="/employer/dashboard" element={<EmployerDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>
      {!isAdminDashboard && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
