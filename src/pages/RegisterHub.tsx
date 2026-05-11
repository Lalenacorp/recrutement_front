import { Link } from 'react-router-dom';
import { Briefcase, User, Building2, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSEO } from '../utils/useSEO';

/**
 * Première étape d'inscription : choix entre compte candidat et compte employeur.
 */
const RegisterHub = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  useSEO({
    title: isEn ? 'Create your account' : 'Créer un compte',
    description: isEn
      ? 'Create your free SNJobConnect account: candidate or employer. Access jobs, contests, training and recruit talents in Senegal.'
      : "Créez votre compte gratuit SNJobConnect : candidat ou employeur. Accédez aux offres d'emploi, concours, formations et recrutez vos talents au Sénégal.",
    path: '/register',
  });
  return (
    <div className="auth-page">
      <div className="auth-container auth-container--register-hub">
        <div className="auth-header auth-header--compact">
          <Briefcase size={36} />
          <h2>{isEn ? 'Sign up' : 'Inscription'}</h2>
          <p>{isEn ? 'Choose the account type you want to create' : 'Choisissez le type de compte que vous souhaitez créer'}</p>
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
              <h3>{isEn ? 'Candidate' : 'Candidat'}</h3>
              <p>{isEn ? 'Apply to jobs, track applications and manage your profile.' : 'Postulez aux offres, suivez vos candidatures et gérez votre profil.'}</p>
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
              <h3>{isEn ? 'Employer' : 'Employeur'}</h3>
              <p>{isEn ? 'Post jobs, receive applications and hire top talent.' : 'Publiez des offres, recevez des candidatures et recrutez vos talents.'}</p>
            </div>
            <ChevronRight className="register-hub-card__chevron" size={22} aria-hidden />
          </Link>
        </div>

        <div className="auth-footer">
          <p>
            {isEn ? 'Already have an account?' : 'Déjà un compte ?'} <Link to="/login">{isEn ? 'Log in' : 'Connectez-vous'}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterHub;
