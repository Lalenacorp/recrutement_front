import { Briefcase, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-container">
          <div className="footer-section footer-section--brand">
            <div className="footer-logo">
              <Briefcase size={28} aria-hidden />
              <span>SNJobConnect</span>
            </div>
            <p className="footer-tagline">
              {isEn
                ? 'Senegal\'s #1 platform for jobs, training and study abroad.'
                : "La plateforme #1 au Sénégal pour l'emploi, la formation et les études à l'étranger."}
            </p>
          </div>

          <nav className="footer-section footer-section--links" aria-label={isEn ? 'Footer links' : 'Liens du pied de page'}>
            <h4>{isEn ? 'Quick links' : 'Liens rapides'}</h4>
            <Link to="/jobs">{isEn ? 'Jobs' : 'Offres d&apos;emploi'}</Link>
            <Link to="/contests">{isEn ? 'Contests' : 'Concours'}</Link>
            <Link to="/events">{isEn ? 'Events' : 'Événements'}</Link>
            <Link to="/about">{isEn ? 'About' : 'À propos'}</Link>
          </nav>

          <div className="footer-section footer-section--contact">
            <h4>Contact</h4>
            <div className="contact-info">
              <Phone size={18} strokeWidth={2} aria-hidden />
              <a href="tel:+221776417841">+221 77 641 78 41</a>
            </div>
            <div className="contact-info">
              <MapPin size={18} strokeWidth={2} aria-hidden />
              <span>{isEn ? 'Dakar, Senegal' : 'Dakar, Sénégal'}</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SNJobConnect. {isEn ? 'All rights reserved.' : 'Tous droits réservés.'}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
