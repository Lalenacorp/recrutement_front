import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Briefcase, AlertCircle, CheckCircle } from 'lucide-react';
import { authApi, ApiError } from '../api/authApi';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError('Lien invalide : paramètre token manquant.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(token, password, confirm);
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Briefcase size={40} />
          <h2>Nouveau mot de passe</h2>
          <p>Choisissez un mot de passe sécurisé pour votre compte</p>
        </div>

        {!token && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            <span>
              Ce lien est incomplet ou expiré.{' '}
              <Link to="/forgot-password">Demander un nouvel e-mail</Link>.
            </span>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {done && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <CheckCircle size={20} />
            <span>Mot de passe mis à jour. Redirection vers la connexion…</span>
          </div>
        )}

        {token && !done && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Nouveau mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                placeholder="Au moins 8 caractères"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="form-control"
                placeholder="Répétez le mot de passe"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
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

export default ResetPassword;
