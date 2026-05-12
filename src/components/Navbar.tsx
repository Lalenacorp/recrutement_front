import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LogOut, User, Home, PlusCircle, FileText, Calendar, Trophy, Menu, X, GraduationCap } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
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
        <Link to="/" className="navbar-logo" aria-label="SNJobConnect — accueil">
          <img src="/navbar-logo-base.png?v=7" alt="Logo SNJobConnect" className="brand-logo" />
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
            {t('nav.home')}
          </Link>
          <Link to="/jobs" className="navbar-link" onClick={closeMenu}>
            <FileText size={18} />
            {t('nav.jobs')}
          </Link>
          <Link to="/contests" className="navbar-link" onClick={closeMenu}>
            <Trophy size={18} />
            {t('nav.contests')}
          </Link>
          <Link to="/events" className="navbar-link" onClick={closeMenu}>
            <Calendar size={18} />
            {t('nav.events')}
          </Link>
          <Link to="/espace-etudiant" className="navbar-link" onClick={closeMenu}>
            <GraduationCap size={18} />
            {t('nav.study')}
          </Link>
          <label className="navbar-link navbar-language">
            {t('nav.language')}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
              className="navbar-language-select"
            >
              <option value="fr">FR</option>
              <option value="en">EN</option>
            </select>
          </label>
          
          {user ? (
            <>
              {user.role === 'employer' && (
                <Link to="/employer/dashboard" className="navbar-link" onClick={closeMenu}>
                  <PlusCircle size={18} />
                  {t('nav.dashboard')}
                </Link>
              )}
              {user.role === 'candidate' && (
                <Link to="/candidate/dashboard" className="navbar-link" onClick={closeMenu}>
                  <User size={18} />
                  {t('nav.profile')}
                </Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="navbar-link" onClick={closeMenu}>
                  <PlusCircle size={18} />
                  {t('nav.admin')}
                </Link>
              )}
              <button onClick={handleLogout} className="navbar-button logout">
                <LogOut size={18} />
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-button" onClick={closeMenu}>
                {t('nav.login')}
              </Link>
              <Link to="/register" className="navbar-button primary" onClick={closeMenu}>
                {t('nav.register')}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
