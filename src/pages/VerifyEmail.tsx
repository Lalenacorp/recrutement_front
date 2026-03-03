import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Token de vérification manquant');
        return;
      }

      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
        // Selon le chemin, on choisit les endpoints à essayer.
        // /api?token=... : lien générique, on tente d'abord employeur puis candidat.
        // /api/auth/verify-email?token=... : employeur uniquement.
        // /api/auth/verify-email-employee?token=... : candidat uniquement.
        const path = location.pathname;
        const endpoints: string[] =
          path === '/api'
            ? ['/api/auth/verify-email', '/api/auth/verify-email-employee']
            : path.includes('verify-email-employee')
            ? ['/api/auth/verify-email-employee']
            : ['/api/auth/verify-email'];

        let lastErrorMessage = 'Erreur lors de la vérification';

        for (const endpointPath of endpoints) {
          const response = await fetch(
            `${API_BASE_URL}${endpointPath}?token=${token}`,
            {
              method: 'GET',
            }
          );

          if (response.ok) {
            const contentType = response.headers.get('Content-Type') || '';
            let successMessage = 'Email vérifié avec succès. Vous pouvez maintenant vous connecter.';

            if (contentType.includes('application/json')) {
              const data = await response.json().catch(() => ({} as any));
              if (data && typeof data.message === 'string' && data.message.trim().length > 0) {
                successMessage = `${data.message} Vous pouvez maintenant vous connecter.`;
              }
            } else {
              const text = await response.text();
              if (text && text.trim().length > 0) {
                successMessage = `${text} Vous pouvez maintenant vous connecter.`;
              }
            }

            setStatus('success');
            setMessage(successMessage);
            return;
          }

          const errorData = await response.json().catch(() => ({}));
          if (errorData && typeof errorData.message === 'string' && errorData.message.trim().length > 0) {
            lastErrorMessage = errorData.message;
          }
        }

        setStatus('error');
        setMessage(lastErrorMessage);
      } catch (error) {
        setStatus('error');
        setMessage('Erreur de connexion au serveur');
      }
    };

    // En mode développement avec React.StrictMode, les effets peuvent être exécutés deux fois.
    // Ce flag permet d'éviter un deuxième appel qui ferait échouer un token à usage unique.
    if (hasVerifiedRef.current) {
      return;
    }
    hasVerifiedRef.current = true;

    verifyEmail();
  }, [token, location.pathname]);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          {status === 'loading' && <Loader size={60} className="spinner" />}
          {status === 'success' && <CheckCircle size={60} style={{ color: '#10b981' }} />}
          {status === 'error' && <XCircle size={60} style={{ color: '#ef4444' }} />}
          
          <h2>
            {status === 'loading' && 'Vérification en cours...'}
            {status === 'success' && 'Email vérifié !'}
            {status === 'error' && 'Vérification échouée'}
          </h2>
          
          <p>{message}</p>
        </div>

        {status === 'success' && (
          <div className="auth-footer">
            <Link to="/login" className="btn btn-primary">
              Se connecter
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="auth-footer">
            <Link to="/register" className="btn btn-primary">
              S'inscrire à nouveau
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
