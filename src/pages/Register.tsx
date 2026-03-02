import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, AlertCircle } from 'lucide-react';
import EmailVerificationPending from './EmailVerificationPending';

const Register = () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (email !== confirmEmail) {
      setError('Les adresses email ne correspondent pas');
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
      
      // Si la vérification email est requise, afficher la page de confirmation
      if (result.needsEmailVerification) {
        setRegisteredEmail(result.email);
        setShowVerificationPending(true);
      } else {
        // Sinon, rediriger vers le dashboard candidat
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
      <div className="auth-container">
        <div className="auth-header">
          <Briefcase size={40} />
          <h2>Inscription Candidat</h2>
          <p>Créez votre compte JobConnect</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Civilité *</label>
            <select
              value={civility}
              onChange={(e) => setCivility(e.target.value as any)}
              className="form-control"
              required
            >
              <option value="MR">Monsieur</option>
              <option value="MS">Madame</option>
              <option value="MX">Autre</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Prénom *</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="form-control"
              placeholder="Votre prénom"
              required
            />
          </div>

          <div className="form-group">
            <label>Nom *</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="form-control"
              placeholder="Votre nom"
              required
            />
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
            />
          </div>
          
          <div className="form-group">
            <label>Email *</label>
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
            <label>Confirmer l'email *</label>
            <input
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              className="form-control"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Mot de passe *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              placeholder="Votre mot de passe"
              required
              minLength={6}
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Déjà un compte ? <Link to="/login">Connectez-vous</Link></p>
          <p>Vous êtes un employeur ? <Link to="/employer/register">Inscrivez-vous ici</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
