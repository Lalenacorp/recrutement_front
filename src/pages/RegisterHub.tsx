import { Link } from 'react-router-dom';
import { Briefcase, User, Building2, ChevronRight } from 'lucide-react';

/**
 * Première étape d'inscription : choix entre compte candidat et compte employeur.
 */
const RegisterHub = () => {
  return (
    <div className="auth-page">
      <div className="auth-container auth-container--register-hub">
        <div className="auth-header auth-header--compact">
          <Briefcase size={36} />
          <h2>Inscription</h2>
          <p>Choisissez le type de compte que vous souhaitez créer</p>
        </div>

        <div className="register-hub-cards" role="list">
          <Link
            to="/register/candidat"
            className="register-hub-card"
            role="listitem"
          >
            <div className="register-hub-card__icon register-hub-card__icon--candidate">
              <User size={32} aria-hidden />
            </div>
            <div className="register-hub-card__body">
              <h3>Candidat</h3>
              <p>Postulez aux offres, suivez vos candidatures et gérez votre profil.</p>
            </div>
            <ChevronRight className="register-hub-card__chevron" size={22} aria-hidden />
          </Link>

          <Link
            to="/register/employeur"
            className="register-hub-card"
            role="listitem"
          >
            <div className="register-hub-card__icon register-hub-card__icon--employer">
              <Building2 size={32} aria-hidden />
            </div>
            <div className="register-hub-card__body">
              <h3>Employeur</h3>
              <p>Publiez des offres, recevez des candidatures et recrutez vos talents.</p>
            </div>
            <ChevronRight className="register-hub-card__chevron" size={22} aria-hidden />
          </Link>
        </div>

        <div className="auth-footer">
          <p>
            Déjà un compte ? <Link to="/login">Connectez-vous</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterHub;
