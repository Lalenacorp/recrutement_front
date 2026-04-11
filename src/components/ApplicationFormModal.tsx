import { useState } from 'react';
import { X, Upload, CheckCircle } from 'lucide-react';
import { applicationApi } from '../api/applicationApi';
import type { ApplicationRequest } from '../types';

interface ApplicationFormModalProps {
  jobId: number;
  jobTitle: string;
  companyName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ApplicationFormModal = ({ jobId, jobTitle, companyName, onClose, onSuccess }: ApplicationFormModalProps) => {
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
        setError('Le fichier CV ne doit pas dépasser 5 MB');
        return;
      }
      // Vérifier le type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Format de fichier non accepté. Utilisez PDF ou Word (.doc, .docx)');
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
      setError('Veuillez renseigner votre nom et prénom');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Adresse email invalide');
      return;
    }

    if (!validatePhone(formData.phone)) {
      setError('Numéro de téléphone invalide. Format attendu: +221701234567');
      return;
    }

    const letter = formData.coverLetter?.trim() ?? '';
    if (letter.length > 8000) {
      setError('La lettre de motivation ne peut pas dépasser 8000 caractères');
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
      setError(err.message || 'Erreur lors de la soumission de votre candidature');
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
            <h2>Candidature envoyée !</h2>
            <p>Votre candidature pour le poste de <strong>{jobTitle}</strong> chez <strong>{companyName}</strong> a été transmise avec succès.</p>
            <p className="text-muted">Vous recevrez une réponse par email.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content application-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Postuler à cette offre</h2>
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
              <label htmlFor="civility">Civilité *</label>
              <select
                id="civility"
                name="civility"
                value={formData.civility}
                onChange={handleInputChange}
                required
                className="form-control"
              >
                <option value="MR">M.</option>
                <option value="MS">Mme/Mlle</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">Prénom *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder="Votre prénom"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Nom *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="form-control"
                placeholder="votre.email@exemple.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Téléphone *</label>
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
              <small className="form-hint">Format international (ex: +221701234567)</small>
            </div>

            <div className="form-group">
              <label htmlFor="coverLetter">Lettre de motivation (optionnel)</label>
              <textarea
                id="coverLetter"
                name="coverLetter"
                value={formData.coverLetter ?? ''}
                onChange={handleInputChange}
                className="form-control"
                rows={8}
                placeholder="Présentez-vous et expliquez votre intérêt pour ce poste…"
                maxLength={8000}
              />
              <small className="form-hint">
                {(formData.coverLetter ?? '').length} / 8000 caractères
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="cv">CV (optionnel)</label>
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
                  {cvFile ? cvFile.name : 'Choisir un fichier'}
                </label>
              </div>
              <small className="form-hint">PDF ou Word, max 5 MB</small>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                Annuler
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Envoi en cours...' : 'Envoyer ma candidature'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationFormModal;
