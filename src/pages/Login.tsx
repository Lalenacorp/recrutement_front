import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, AlertCircle, Info } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const sessionExpired =
    Boolean((location.state as { sessionExpired?: boolean } | null)?.sessionExpired);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      
      // Récupérer le rôle de l'utilisateur depuis localStorage après la connexion
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === 'employer') {
          navigate('/employer/dashboard');
        } else if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/candidate/dashboard');
        }
      } else {
        // Par défaut, aller à la page d'accueil
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Briefcase size={40} />
          <h2>Connexion</h2>
          <p>Bienvenue sur JobConnect</p>
        </div>

        {sessionExpired && (
          <div className="alert alert-info" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <Info size={20} />
            <span>
              Votre session a expiré ou n&apos;est plus valide. Connectez-vous à nouveau pour continuer.
            </span>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        
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
            />
          </div>
          
          <div className="form-group">
            <div className="login-password-row">
              <label>Mot de passe</label>
              <Link to="/forgot-password" className="auth-link-inline">
                Mot de passe oublié ?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Pas encore de compte ? <Link to="/register">Inscrivez-vous</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
