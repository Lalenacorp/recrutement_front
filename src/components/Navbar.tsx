import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, LogOut, User, Home, PlusCircle, FileText, Calendar, Trophy, Menu, X, GraduationCap } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <Briefcase size={28} />
          <span>JobConnect</span>
        </Link>
        
        {/* Menu hamburger button */}
        <button 
          className="navbar-hamburger" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="navbar-link" onClick={closeMenu}>
            <Home size={18} />
            Accueil
          </Link>
          <Link to="/jobs" className="navbar-link" onClick={closeMenu}>
            <FileText size={18} />
            Offres d'emploi
          </Link>
          <Link to="/contests" className="navbar-link" onClick={closeMenu}>
            <Trophy size={18} />
            Concours
          </Link>
          <Link to="/events" className="navbar-link" onClick={closeMenu}>
            <Calendar size={18} />
            Événements
          </Link>
          <Link to="/etudes-canada" className="navbar-link" onClick={closeMenu}>
            <GraduationCap size={18} />
            Étudier au Canada
          </Link>
          
          {user ? (
            <>
              {user.role === 'employer' && (
                <Link to="/employer/dashboard" className="navbar-link" onClick={closeMenu}>
                  <PlusCircle size={18} />
                  Dashboard
                </Link>
              )}
              {user.role === 'candidate' && (
                <Link to="/candidate/dashboard" className="navbar-link" onClick={closeMenu}>
                  <User size={18} />
                  Mon profil
                </Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="navbar-link" onClick={closeMenu}>
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
              <Link to="/login" className="navbar-button" onClick={closeMenu}>
                Connexion
              </Link>
              <Link to="/register" className="navbar-button primary" onClick={closeMenu}>
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
