import { Briefcase, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-container">
          <div className="footer-section footer-section--brand">
            <div className="footer-logo">
              <Briefcase size={28} aria-hidden />
              <span>JobConnect</span>
            </div>
            <p className="footer-tagline">
              La plateforme de recrutement qui connecte les talents avec les opportunités.
            </p>
          </div>

          <nav className="footer-section footer-section--links" aria-label="Liens du pied de page">
            <h4>Liens rapides</h4>
            <Link to="/jobs">Offres d&apos;emploi</Link>
            <Link to="/contests">Concours</Link>
            <Link to="/events">Événements</Link>
            <Link to="/about">À propos</Link>
          </nav>

          <div className="footer-section footer-section--contact">
            <h4>Contact</h4>
            <div className="contact-info">
              <Phone size={18} strokeWidth={2} aria-hidden />
              <a href="tel:+221776417841">+221 77 641 78 41</a>
            </div>
            <div className="contact-info">
              <MapPin size={18} strokeWidth={2} aria-hidden />
              <span>Dakar, Sénégal</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} JobConnect. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
