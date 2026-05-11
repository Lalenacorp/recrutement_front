import { useState } from 'react';
import { X, Upload, CheckCircle } from 'lucide-react';
import { applicationApi } from '../api/applicationApi';
import type { ApplicationRequest } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ApplicationFormModalProps {
  jobId: number;
  jobTitle: string;
  companyName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ApplicationFormModal = ({ jobId, jobTitle, companyName, onClose, onSuccess }: ApplicationFormModalProps) => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [formData, setFormData] = useState<ApplicationRequest>({
    jobId,
    civility: 'MR',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    coverLetter: '',
  });
  
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(isEn ? 'CV file must not exceed 5 MB' : 'Le fichier CV ne doit pas dépasser 5 MB');
        return;
      }
      // Vérifier le type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError(isEn ? 'Unsupported file format. Use PDF or Word (.doc, .docx)' : 'Format de fichier non accepté. Utilisez PDF ou Word (.doc, .docx)');
        return;
      }
      setCvFile(file);
      setError(null);
    }
  };

  const validatePhone = (phone: string): boolean => {
    // Format E.164: +[country code][number]
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError(isEn ? 'Please provide first and last name' : 'Veuillez renseigner votre nom et prénom');
      return;
    }

    if (!formData.email.includes('@')) {
      setError(isEn ? 'Invalid email address' : 'Adresse email invalide');
      return;
    }

    if (!validatePhone(formData.phone)) {
      setError(isEn ? 'Invalid phone number. Expected format: +221701234567' : 'Numéro de téléphone invalide. Format attendu: +221701234567');
      return;
    }

    const letter = formData.coverLetter?.trim() ?? '';
    if (letter.length > 8000) {
      setError(isEn ? 'Cover letter cannot exceed 8000 characters' : 'La lettre de motivation ne peut pas dépasser 8000 caractères');
      return;
    }

    try {
      setLoading(true);
      await applicationApi.submitApplication(formData, cvFile || undefined);
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || (isEn ? 'Error while submitting your application' : 'Erreur lors de la soumission de votre candidature'));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content application-modal" onClick={(e) => e.stopPropagation()}>
          <div className="success-confirmation">
            <CheckCircle size={64} className="success-icon" />
            <h2>{isEn ? 'Application sent!' : 'Candidature envoyée !'}</h2>
            <p>{isEn ? 'Your application for' : 'Votre candidature pour le poste de'} <strong>{jobTitle}</strong> {isEn ? 'at' : 'chez'} <strong>{companyName}</strong> {isEn ? 'has been submitted successfully.' : 'a été transmise avec succès.'}</p>
            <p className="text-muted">{isEn ? 'You will receive an email response.' : 'Vous recevrez une réponse par email.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content application-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEn ? 'Apply to this job' : 'Postuler à cette offre'}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="job-info-banner">
            <h3>{jobTitle}</h3>
            <p>{companyName}</p>
          </div>

          <form onSubmit={handleSubmit} className="application-form">
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="civility">{isEn ? 'Title *' : 'Civilité *'}</label>
              <select
                id="civility"
                name="civility"
                value={formData.civility}
                onChange={handleInputChange}
                required
                className="form-control"
              >
                <option value="MR">M.</option>
                <option value="MS">{isEn ? 'Mrs/Ms' : 'Mme/Mlle'}</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">{isEn ? 'First name *' : 'Prénom *'}</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder={isEn ? 'Your first name' : 'Votre prénom'}
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">{isEn ? 'Last name *' : 'Nom *'}</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder={isEn ? 'Your last name' : 'Votre nom'}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">{isEn ? 'Email *' : 'Email *'}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="form-control"
                placeholder={isEn ? 'your.email@example.com' : 'votre.email@exemple.com'}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">{isEn ? 'Phone *' : 'Téléphone *'}</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="form-control"
                placeholder="+221701234567"
              />
              <small className="form-hint">{isEn ? 'International format (e.g. +221701234567)' : 'Format international (ex: +221701234567)'}</small>
            </div>

            <div className="form-group">
              <label htmlFor="coverLetter">{isEn ? 'Cover letter (optional)' : 'Lettre de motivation (optionnel)'}</label>
              <textarea
                id="coverLetter"
                name="coverLetter"
                value={formData.coverLetter ?? ''}
                onChange={handleInputChange}
                className="form-control"
                rows={8}
                placeholder={isEn ? 'Introduce yourself and explain why you are interested in this job...' : 'Présentez-vous et expliquez votre intérêt pour ce poste…'}
                maxLength={8000}
              />
              <small className="form-hint">
                {(formData.coverLetter ?? '').length} / 8000 {isEn ? 'characters' : 'caractères'}
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="cv">{isEn ? 'Resume (optional)' : 'CV (optionnel)'}</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="cv"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <label htmlFor="cv" className="file-input-label">
                  <Upload size={20} />
                  {cvFile ? cvFile.name : (isEn ? 'Choose a file' : 'Choisir un fichier')}
                </label>
              </div>
              <small className="form-hint">{isEn ? 'PDF or Word, max 5 MB' : 'PDF ou Word, max 5 MB'}</small>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                {isEn ? 'Cancel' : 'Annuler'}
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (isEn ? 'Sending...' : 'Envoi en cours...') : (isEn ? 'Submit application' : 'Envoyer ma candidature')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationFormModal;
