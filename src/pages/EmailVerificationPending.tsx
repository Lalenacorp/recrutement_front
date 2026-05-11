import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

interface EmailVerificationPendingProps {
  email: string;
}

const EmailVerificationPending = ({ email }: EmailVerificationPendingProps) => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Mail size={60} style={{ color: '#3b82f6' }} />
          <h2>{isEn ? 'Verify your email' : 'Vérifiez votre email'}</h2>
          <p>
            {isEn ? 'A verification email has been sent to' : 'Un email de vérification a été envoyé à'} <strong>{email}</strong>
          </p>
        </div>

        <div className="verification-info">
          <div className="info-box">
            <h3>{isEn ? 'Next steps:' : 'Étapes suivantes :'}</h3>
            <ol>
              <li>{isEn ? 'Open your inbox' : 'Ouvrez votre boîte de réception'}</li>
              <li>{isEn ? 'Click the verification link in the email' : "Cliquez sur le lien de vérification dans l'email"}</li>
              <li>{isEn ? 'Once verified, you can log in' : 'Une fois vérifié, vous pourrez vous connecter'}</li>
            </ol>
          </div>

          <div className="info-box">
            <h3>{isEn ? "Didn't receive the email?" : "Vous n'avez pas reçu l'email ?"}</h3>
            <ul>
              <li>{isEn ? 'Check your spam/junk folder' : 'Vérifiez votre dossier spam/courrier indésirable'}</li>
              <li>{isEn ? 'The link is valid for 48 hours' : 'Le lien est valide pendant 48 heures'}</li>
              <li>{isEn ? 'If needed, sign up again' : 'Si besoin, inscrivez-vous à nouveau'}</li>
            </ul>
          </div>
        </div>

        <div className="auth-footer">
          <Link to="/login">{isEn ? 'Back to login' : 'Retour à la connexion'}</Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPending;
