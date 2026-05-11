import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, AlertCircle, CheckCircle } from 'lucide-react';
import { authApi, ApiError } from '../api/authApi';
import { useLanguage } from '../context/LanguageContext';
import { useSEO } from '../utils/useSEO';

const ForgotPassword = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  useSEO({
    title: isEn ? 'Forgot password' : 'Mot de passe oublié',
    description: isEn
      ? 'Reset your SNJobConnect password.'
      : 'Réinitialisez votre mot de passe SNJobConnect.',
    path: '/forgot-password',
    noIndex: true,
  });
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const { message } = await authApi.requestPasswordReset(email.trim());
      setSuccessMessage(
        message ||
          (isEn
            ? 'An email with the password reset link has just been sent to you.'
            : 'Un e-mail contenant le lien pour réinitialiser votre mot de passe vient de vous être envoyé.')
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : (isEn ? 'Unable to reach the server. Please try again later.' : 'Impossible de joindre le serveur. Réessayez plus tard.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Briefcase size={40} />
          <h2>{isEn ? 'Forgot password' : 'Mot de passe oublié'}</h2>
          <p>{isEn ? 'Enter the email address for your SNJobConnect account' : 'Indiquez l&apos;adresse e-mail de votre compte SNJobConnect'}</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <CheckCircle size={20} />
            <span>{successMessage}</span>
          </div>
        )}

        {!successMessage && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                placeholder={isEn ? 'your@email.com' : 'votre@email.com'}
                required
                autoComplete="email"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? (isEn ? 'Sending...' : 'Envoi…') : (isEn ? 'Send reset link' : 'Envoyer le lien de réinitialisation')}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            <Link to="/login">{isEn ? 'Back to login' : 'Retour à la connexion'}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
