import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, AlertCircle, CheckCircle } from 'lucide-react';
import { authApi, ApiError } from '../api/authApi';

const ForgotPassword = () => {
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
          'Un e-mail contenant le lien pour réinitialiser votre mot de passe vient de vous être envoyé.'
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de joindre le serveur. Réessayez plus tard.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Briefcase size={40} />
          <h2>Mot de passe oublié</h2>
          <p>Indiquez l&apos;adresse e-mail de votre compte JobConnect</p>
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
                placeholder="votre@email.com"
                required
                autoComplete="email"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Envoi…' : 'Envoyer le lien de réinitialisation'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            <Link to="/login">Retour à la connexion</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
