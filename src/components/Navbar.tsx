import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, LogOut, User, Home, PlusCircle, FileText, Calendar, Trophy } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <Briefcase size={28} />
          <span>JobConnect</span>
        </Link>
        
        <div className="navbar-menu">
          <Link to="/" className="navbar-link">
            <Home size={18} />
            Accueil
          </Link>
          <Link to="/jobs" className="navbar-link">
            <FileText size={18} />
            Offres d'emploi
          </Link>
          <Link to="/contests" className="navbar-link">
            <Trophy size={18} />
            Concours
          </Link>
          <Link to="/events" className="navbar-link">
            <Calendar size={18} />
            Événements
          </Link>
          
          {user ? (
            <>
              {user.role === 'employer' && (
                <Link to="/employer/dashboard" className="navbar-link">
                  <PlusCircle size={18} />
                  Dashboard
                </Link>
              )}
              {user.role === 'candidate' && (
                <Link to="/candidate/dashboard" className="navbar-link">
                  <User size={18} />
                  Mon profil
                </Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="navbar-link">
                  <PlusCircle size={18} />
                  Admin
                </Link>
              )}
              <button onClick={handleLogout} className="navbar-button logout">
                <LogOut size={18} />
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-button">
                Connexion
              </Link>
              <Link to="/register" className="navbar-button primary">
                Inscription
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
