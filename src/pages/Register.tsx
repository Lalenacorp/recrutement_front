import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import EmailVerificationPending from './EmailVerificationPending';

const PHONE_E164 = /^\+[1-9]\d{1,14}$/;

const Register = () => {
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
      setError('Veuillez renseigner votre prénom et votre nom');
      return false;
    }
    if (!PHONE_E164.test(phone.trim())) {
      setError('Téléphone invalide. Format international requis (ex. +221701234567)');
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
      setError('Les adresses email ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
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
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription');
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
          Choisir un autre profil
        </Link>
        <div className="auth-header auth-header--compact">
          <Briefcase size={36} />
          <h2>Inscription Candidat</h2>
          <p>Créez votre compte JobConnect</p>
        </div>

        <div className="register-stepper" aria-label="Progression du formulaire">
          <div
            className={`register-stepper__segment ${step === 1 ? 'active' : ''} ${step === 2 ? 'done' : ''}`}
          >
            <span className="register-stepper__num">1</span>
            <span className="register-stepper__label">Identité</span>
          </div>
          <div className={`register-stepper__bar ${step === 2 ? 'filled' : ''}`} aria-hidden />
          <div className={`register-stepper__segment ${step === 2 ? 'active' : ''}`}>
            <span className="register-stepper__num">2</span>
            <span className="register-stepper__label">Compte</span>
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
                <label>Civilité *</label>
                <select
                  value={civility}
                  onChange={(e) => setCivility(e.target.value as 'MR' | 'MS' | 'MX')}
                  className="form-control"
                  required
                >
                  <option value="MR">Monsieur</option>
                  <option value="MS">Madame</option>
                  <option value="MX">Autre</option>
                </select>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Prénom *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="form-control"
                    placeholder="Prénom"
                    required
                    autoComplete="given-name"
                  />
                </div>
                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="form-control"
                    placeholder="Nom"
                    required
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Téléphone *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-control"
                  placeholder="+221701234567"
                  required
                  autoComplete="tel"
                />
                <small className="form-hint">Format international (E.164)</small>
              </div>

              <button type="button" className="btn btn-primary btn-block" onClick={goNext}>
                Continuer
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
                <label>Confirmer l&apos;email *</label>
                <input
                  type="email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  className="form-control"
                  placeholder="votre@email.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label>Mot de passe *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  placeholder="Au moins 6 caractères"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>

              <div className="register-form-actions">
                <button type="button" className="btn btn-outline" onClick={goBack} disabled={loading}>
                  <ChevronLeft size={18} aria-hidden />
                  Retour
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Inscription…' : "S'inscrire"}
                </button>
              </div>
            </>
          )}
        </form>
        
        <div className="auth-footer">
          <p>Déjà un compte ? <Link to="/login">Connectez-vous</Link></p>
          <p>
            <Link to="/register">Autre type de compte (candidat ou employeur)</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
