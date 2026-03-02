import { Briefcase, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <div className="footer-logo">
            <Briefcase size={28} />
            <span>JobConnect</span>
          </div>
          <p>La plateforme de recrutement qui connecte les talents avec les opportunités.</p>
        </div>
        
        <div className="footer-section">
          <h4>Liens rapides</h4>
          <Link to="/jobs">Offres d'emploi</Link>
          <Link to="/contests">Concours</Link>
          <Link to="/events">Événements</Link>
          <Link to="/about">À propos</Link>
        </div>
        
        <div className="footer-section">
          <h4>Pour les entreprises</h4>
          <Link to="/employer/register">Publier une offre</Link>
          <Link to="/employer/dashboard">Espace employeur</Link>
          <Link to="/pricing">Tarifs</Link>
        </div>
        
        <div className="footer-section">
          <h4>Contact</h4>
          <div className="contact-info">
            <Mail size={16} />
            <span>contact@jobconnect.com</span>
          </div>
          <div className="contact-info">
            <Phone size={16} />
            <span>+33 1 23 45 67 89</span>
          </div>
          <div className="contact-info">
            <MapPin size={16} />
            <span>Paris, France</span>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2026 JobConnect. Tous droits réservés.</p>
      </div>
    </footer>
  );
};

export default Footer;
