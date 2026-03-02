import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmailVerificationPendingProps {
  email: string;
}

const EmailVerificationPending = ({ email }: EmailVerificationPendingProps) => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Mail size={60} style={{ color: '#3b82f6' }} />
          <h2>Vérifiez votre email</h2>
          <p>
            Un email de vérification a été envoyé à <strong>{email}</strong>
          </p>
        </div>

        <div className="verification-info">
          <div className="info-box">
            <h3>Étapes suivantes :</h3>
            <ol>
              <li>Ouvrez votre boîte de réception</li>
              <li>Cliquez sur le lien de vérification dans l'email</li>
              <li>Une fois vérifié, vous pourrez vous connecter</li>
            </ol>
          </div>

          <div className="info-box">
            <h3>Vous n'avez pas reçu l'email ?</h3>
            <ul>
              <li>Vérifiez votre dossier spam/courrier indésirable</li>
              <li>Le lien est valide pendant 48 heures</li>
              <li>Si besoin, inscrivez-vous à nouveau</li>
            </ul>
          </div>
        </div>

        <div className="auth-footer">
          <Link to="/login">Retour à la connexion</Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPending;
