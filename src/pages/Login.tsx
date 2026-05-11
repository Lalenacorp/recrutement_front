import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, AlertCircle, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSEO } from '../utils/useSEO';

const Login = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  useSEO({
    title: isEn ? 'Sign in' : 'Connexion',
    description: isEn
      ? 'Sign in to your SNJobConnect account to apply for jobs, track your applications and manage your profile.'
      : "Connectez-vous à votre compte SNJobConnect pour postuler aux offres, suivre vos candidatures et gérer votre profil.",
    path: '/login',
  });
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
      setError(err instanceof Error ? err.message : (isEn ? 'Login error' : 'Erreur de connexion'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Briefcase size={40} />
          <h2>{isEn ? 'Login' : 'Connexion'}</h2>
          <p>{isEn ? 'Welcome to SNJobConnect' : 'Bienvenue sur SNJobConnect'}</p>
        </div>

        {sessionExpired && (
          <div className="alert alert-info" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <Info size={20} />
            <span>
              {isEn
                ? 'Your session has expired or is no longer valid. Please log in again.'
                : 'Votre session a expiré ou n&apos;est plus valide. Connectez-vous à nouveau pour continuer.'}
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
              placeholder={isEn ? 'your@email.com' : 'votre@email.com'}
              required
            />
          </div>
          
          <div className="form-group">
            <div className="login-password-row">
              <label>{isEn ? 'Password' : 'Mot de passe'}</label>
              <Link to="/forgot-password" className="auth-link-inline">
                {isEn ? 'Forgot password?' : 'Mot de passe oublié ?'}
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
            {loading ? (isEn ? 'Signing in...' : 'Connexion...') : (isEn ? 'Sign in' : 'Se connecter')}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>{isEn ? "Don't have an account?" : 'Pas encore de compte ?'} <Link to="/register">{isEn ? 'Sign up' : 'Inscrivez-vous'}</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
