import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import EmailVerificationPending from './EmailVerificationPending';
import { useLanguage } from '../context/LanguageContext';
import { useSEO } from '../utils/useSEO';

const PHONE_E164 = /^\+[1-9]\d{1,14}$/;

const Register = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  useSEO({
    title: isEn ? 'Candidate sign up' : 'Inscription candidat',
    description: isEn
      ? 'Create your free candidate account on SNJobConnect: apply for jobs, contests and training opportunities in Senegal.'
      : "Créez votre compte candidat gratuit sur SNJobConnect : postulez aux offres d'emploi, concours et formations au Sénégal.",
    path: '/register/candidat',
  });
  const [step, setStep] = useState<1 | 2>(1);
  const [civility, setCivility] = useState<'MR' | 'MS' | 'MX'>('MR');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerificationPending, setShowVerificationPending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateStep1 = (): boolean => {
    if (!firstName.trim() || !lastName.trim()) {
      setError(isEn ? 'Please enter your first and last name' : 'Veuillez renseigner votre prénom et votre nom');
      return false;
    }
    if (!PHONE_E164.test(phone.trim())) {
      setError(isEn ? 'Invalid phone. International format required (e.g. +221701234567)' : 'Téléphone invalide. Format international requis (ex. +221701234567)');
      return false;
    }
    return true;
  };

  const goNext = () => {
    setError(null);
    if (validateStep1()) setStep(2);
  };

  const goBack = () => {
    setError(null);
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (email !== confirmEmail) {
      setError(isEn ? 'Email addresses do not match' : 'Les adresses email ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError(isEn ? 'Password must contain at least 6 characters' : 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        civility,
        firstName,
        lastName,
        phone,
        email,
        confirmEmail,
        password,
      });

      if (result.needsEmailVerification) {
        setRegisteredEmail(result.email);
        setShowVerificationPending(true);
      } else {
        navigate('/candidate/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : (isEn ? 'Registration error' : 'Erreur lors de l\'inscription'));
    } finally {
      setLoading(false);
    }
  };

  // Si la vérification email est en attente, afficher la page correspondante
  if (showVerificationPending) {
    return <EmailVerificationPending email={registeredEmail} />;
  }

  return (
    <div className="auth-page">
      <div className="auth-container auth-container--register">
        <Link to="/register" className="register-profile-back">
          <ChevronLeft size={18} aria-hidden />
          {isEn ? 'Choose another profile' : 'Choisir un autre profil'}
        </Link>
        <div className="auth-header auth-header--compact">
          <Briefcase size={36} />
          <h2>{isEn ? 'Candidate sign up' : 'Inscription Candidat'}</h2>
          <p>{isEn ? 'Create your SNJobConnect account' : 'Créez votre compte SNJobConnect'}</p>
        </div>

        <div className="register-stepper" aria-label={isEn ? 'Form progress' : 'Progression du formulaire'}>
          <div
            className={`register-stepper__segment ${step === 1 ? 'active' : ''} ${step === 2 ? 'done' : ''}`}
          >
            <span className="register-stepper__num">1</span>
            <span className="register-stepper__label">{isEn ? 'Identity' : 'Identité'}</span>
          </div>
          <div className={`register-stepper__bar ${step === 2 ? 'filled' : ''}`} aria-hidden />
          <div className={`register-stepper__segment ${step === 2 ? 'active' : ''}`}>
            <span className="register-stepper__num">2</span>
            <span className="register-stepper__label">{isEn ? 'Account' : 'Compte'}</span>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={step === 2 ? handleSubmit : (e) => e.preventDefault()}
          className="auth-form auth-form--register"
        >
          {step === 1 && (
            <>
              <div className="form-group">
                <label>{isEn ? 'Title *' : 'Civilité *'}</label>
                <select
                  value={civility}
                  onChange={(e) => setCivility(e.target.value as 'MR' | 'MS' | 'MX')}
                  className="form-control"
                  required
                >
                  <option value="MR">{isEn ? 'Mr' : 'Monsieur'}</option>
                  <option value="MS">{isEn ? 'Mrs/Ms' : 'Madame'}</option>
                  <option value="MX">{isEn ? 'Other' : 'Autre'}</option>
                </select>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>{isEn ? 'First name *' : 'Prénom *'}</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="form-control"
                    placeholder={isEn ? 'First name' : 'Prénom'}
                    required
                    autoComplete="given-name"
                  />
                </div>
                <div className="form-group">
                  <label>{isEn ? 'Last name *' : 'Nom *'}</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="form-control"
                    placeholder={isEn ? 'Last name' : 'Nom'}
                    required
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>{isEn ? 'Phone *' : 'Téléphone *'}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-control"
                  placeholder="+221701234567"
                  required
                  autoComplete="tel"
                />
                <small className="form-hint">{isEn ? 'International format (E.164)' : 'Format international (E.164)'}</small>
              </div>

              <button type="button" className="btn btn-primary btn-block" onClick={goNext}>
                {isEn ? 'Continue' : 'Continuer'}
                <ChevronRight size={18} aria-hidden />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                  placeholder="votre@email.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label>{isEn ? 'Confirm email *' : 'Confirmer l&apos;email *'}</label>
                <input
                  type="email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  className="form-control"
                  placeholder={isEn ? 'your@email.com' : 'votre@email.com'}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label>{isEn ? 'Password *' : 'Mot de passe *'}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  placeholder={isEn ? 'At least 6 characters' : 'Au moins 6 caractères'}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>

              <div className="register-form-actions">
                <button type="button" className="btn btn-outline" onClick={goBack} disabled={loading}>
                  <ChevronLeft size={18} aria-hidden />
                  {isEn ? 'Back' : 'Retour'}
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (isEn ? 'Signing up...' : 'Inscription…') : (isEn ? 'Sign up' : "S'inscrire")}
                </button>
              </div>
            </>
          )}
        </form>
        
        <div className="auth-footer">
          <p>{isEn ? 'Already have an account?' : 'Déjà un compte ?'} <Link to="/login">{isEn ? 'Log in' : 'Connectez-vous'}</Link></p>
          <p>
            <Link to="/register">{isEn ? 'Another account type (candidate or employer)' : 'Autre type de compte (candidat ou employeur)'}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
