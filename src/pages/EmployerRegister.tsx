import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, AlertCircle } from 'lucide-react';
import { authApi, ApiError } from '../api/authApi';
import type { EmployerSignupRequest, CompanySector, CompanySize } from '../api/types';
import EmailVerificationPending from './EmailVerificationPending';

const EmployerRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [showVerificationPending, setShowVerificationPending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState<EmployerSignupRequest>({
    companyName: '',
    companyAddress: '',
    companyCity: '',
    companyPostalCode: '',
    companyCountryCode: 'SN',
    companySectors: [],
    companyDescription: '',
    companySize: 'SIZE_11_50',
    companyWebsite: '',
    civility: 'MR',
    firstName: '',
    lastName: '',
    jobTitle: '',
    linkedinUrl: '',
    phonePrimary: '',
    phoneSecondary: '',
    email: '',
    confirmEmail: '',
    password: '',
  });

  const companySectors: { value: CompanySector; label: string }[] = [
    { value: 'TECHNOLOGY', label: 'Technologie' },
    { value: 'FINANCE', label: 'Finance' },
    { value: 'HEALTHCARE', label: 'Santé' },
    { value: 'EDUCATION', label: 'Éducation' },
    { value: 'RETAIL', label: 'Commerce' },
    { value: 'MANUFACTURING', label: 'Industrie' },
    { value: 'CONSTRUCTION', label: 'Construction' },
    { value: 'TRANSPORTATION', label: 'Transport' },
    { value: 'HOSPITALITY', label: 'Hôtellerie' },
    { value: 'OTHER', label: 'Autre' },
  ];

  const companySizes: { value: CompanySize; label: string }[] = [
    { value: 'SIZE_1_10', label: '1-10 employés' },
    { value: 'SIZE_11_50', label: '11-50 employés' },
    { value: 'SIZE_51_200', label: '51-200 employés' },
    { value: 'SIZE_201_1000', label: '201-1000 employés' },
    { value: 'SIZE_1000_PLUS', label: '1000+ employés' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selected: CompanySector[] = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value as CompanySector);
      }
    }
    setFormData(prev => ({ ...prev, companySectors: selected }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validation
    if (formData.email !== formData.confirmEmail) {
      setError('Les adresses email ne correspondent pas');
      return;
    }

    if (formData.companySectors.length === 0) {
      setError('Veuillez sélectionner au moins un secteur d\'activité');
      return;
    }

    if (formData.companySectors.length > 5) {
      setError('Vous ne pouvez sélectionner que 5 secteurs maximum');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.registerEmployer(formData, logoFile || undefined);
      console.log('Inscription réussie:', response);
      
      setRegisteredEmail(response.email);
      setShowVerificationPending(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.errors) {
          setFieldErrors(err.errors);
        }
      } else {
        setError('Une erreur inattendue est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  if (showVerificationPending) {
    return <EmailVerificationPending email={registeredEmail} />;
  }

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: '700px' }}>
        <div className="auth-header">
          <Briefcase size={40} />
          <h2>Inscription Employeur</h2>
          <p>Créez votre compte pour publier des offres d'emploi</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Informations de l'entreprise */}
          <h3 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.2rem' }}>
            Informations de l'entreprise
          </h3>

          <div className="form-group">
            <label>Nom de l'entreprise *</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className={`form-control ${fieldErrors.companyName ? 'error' : ''}`}
              required
            />
            {fieldErrors.companyName && (
              <span className="field-error">{fieldErrors.companyName[0]}</span>
            )}
          </div>

          <div className="form-group">
            <label>Adresse *</label>
            <input
              type="text"
              name="companyAddress"
              value={formData.companyAddress}
              onChange={handleChange}
              className={`form-control ${fieldErrors.companyAddress ? 'error' : ''}`}
              required
            />
            {fieldErrors.companyAddress && (
              <span className="field-error">{fieldErrors.companyAddress[0]}</span>
            )}
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Ville *</label>
              <input
                type="text"
                name="companyCity"
                value={formData.companyCity}
                onChange={handleChange}
                className={`form-control ${fieldErrors.companyCity ? 'error' : ''}`}
                required
              />
              {fieldErrors.companyCity && (
                <span className="field-error">{fieldErrors.companyCity[0]}</span>
              )}
            </div>
            
            <div className="form-group">
              <label>Code postal *</label>
              <input
                type="text"
                name="companyPostalCode"
                value={formData.companyPostalCode}
                onChange={handleChange}
                className={`form-control ${fieldErrors.companyPostalCode ? 'error' : ''}`}
                required
              />
              {fieldErrors.companyPostalCode && (
                <span className="field-error">{fieldErrors.companyPostalCode[0]}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Pays *</label>
            <select
              name="companyCountryCode"
              value={formData.companyCountryCode}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="SN">Sénégal</option>
            </select>
          </div>

          <div className="form-group">
            <label>Secteurs d'activité * (1 à 5 secteurs)</label>
            <select
              multiple
              name="companySectors"
              value={formData.companySectors}
              onChange={handleSectorChange}
              className={`form-control ${fieldErrors.companySectors ? 'error' : ''}`}
              style={{ minHeight: '120px' }}
              required
            >
              {companySectors.map(sector => (
                <option key={sector.value} value={sector.value}>
                  {sector.label}
                </option>
              ))}
            </select>
            <small className="form-hint">Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs secteurs</small>
            {fieldErrors.companySectors && (
              <span className="field-error">{fieldErrors.companySectors[0]}</span>
            )}
          </div>

          <div className="form-group">
            <label>Taille de l'entreprise *</label>
            <select
              name="companySize"
              value={formData.companySize}
              onChange={handleChange}
              className="form-control"
              required
            >
              {companySizes.map(size => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description de l'entreprise *</label>
            <textarea
              name="companyDescription"
              value={formData.companyDescription}
              onChange={handleChange}
              className={`form-control ${fieldErrors.companyDescription ? 'error' : ''}`}
              rows={4}
              placeholder="Décrivez votre entreprise, ses activités, sa mission..."
              required
            />
            {fieldErrors.companyDescription && (
              <span className="field-error">{fieldErrors.companyDescription[0]}</span>
            )}
          </div>

          <div className="form-group">
            <label>Site web</label>
            <input
              type="url"
              name="companyWebsite"
              value={formData.companyWebsite}
              onChange={handleChange}
              className={`form-control ${fieldErrors.companyWebsite ? 'error' : ''}`}
              placeholder="https://www.example.com"
            />
            {fieldErrors.companyWebsite && (
              <span className="field-error">{fieldErrors.companyWebsite[0]}</span>
            )}
          </div>

          <div className="form-group">
            <label>Logo de l'entreprise (optionnel)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="form-control"
            />
            <small className="form-hint">Formats recommandés : PNG ou JPG, taille max. 2 Mo</small>
          </div>

          {/* Informations personnelles */}
          <h3 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.2rem' }}>
            Informations personnelles
          </h3>

          <div className="form-group">
            <label>Civilité *</label>
            <select
              name="civility"
              value={formData.civility}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="MR">Monsieur</option>
              <option value="MS">Madame</option>
              <option value="MX">Autre</option>
            </select>
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Prénom *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`form-control ${fieldErrors.firstName ? 'error' : ''}`}
                required
              />
              {fieldErrors.firstName && (
                <span className="field-error">{fieldErrors.firstName[0]}</span>
              )}
            </div>
            
            <div className="form-group">
              <label>Nom *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`form-control ${fieldErrors.lastName ? 'error' : ''}`}
                required
              />
              {fieldErrors.lastName && (
                <span className="field-error">{fieldErrors.lastName[0]}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Poste occupé *</label>
            <input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              className={`form-control ${fieldErrors.jobTitle ? 'error' : ''}`}
              placeholder="Directeur RH, CEO, Responsable recrutement..."
              required
            />
            {fieldErrors.jobTitle && (
              <span className="field-error">{fieldErrors.jobTitle[0]}</span>
            )}
          </div>

          <div className="form-group">
            <label>Téléphone principal *</label>
            <input
              type="tel"
              name="phonePrimary"
              value={formData.phonePrimary}
              onChange={handleChange}
              className={`form-control ${fieldErrors.phonePrimary ? 'error' : ''}`}
              placeholder="+221701234567"
              required
            />
            <small className="form-hint">Format international: +221...</small>
            {fieldErrors.phonePrimary && (
              <span className="field-error">{fieldErrors.phonePrimary[0]}</span>
            )}
          </div>

          <div className="form-group">
            <label>Téléphone secondaire</label>
            <input
              type="tel"
              name="phoneSecondary"
              value={formData.phoneSecondary}
              onChange={handleChange}
              className={`form-control ${fieldErrors.phoneSecondary ? 'error' : ''}`}
              placeholder="+221701234567"
            />
            {fieldErrors.phoneSecondary && (
              <span className="field-error">{fieldErrors.phoneSecondary[0]}</span>
            )}
          </div>

          <div className="form-group">
            <label>Profil LinkedIn</label>
            <input
              type="url"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleChange}
              className={`form-control ${fieldErrors.linkedinUrl ? 'error' : ''}`}
              placeholder="https://www.linkedin.com/in/..."
            />
            {fieldErrors.linkedinUrl && (
              <span className="field-error">{fieldErrors.linkedinUrl[0]}</span>
            )}
          </div>

          {/* Informations de connexion */}
          <h3 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.2rem' }}>
            Informations de connexion
          </h3>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-control ${fieldErrors.email ? 'error' : ''}`}
              placeholder="votre@email.com"
              required
            />
            {fieldErrors.email && (
              <span className="field-error">{fieldErrors.email[0]}</span>
            )}
          </div>

          <div className="form-group">
            <label>Confirmer l'email *</label>
            <input
              type="email"
              name="confirmEmail"
              value={formData.confirmEmail}
              onChange={handleChange}
              className={`form-control ${fieldErrors.confirmEmail ? 'error' : ''}`}
              placeholder="votre@email.com"
              required
            />
            {fieldErrors.confirmEmail && (
              <span className="field-error">{fieldErrors.confirmEmail[0]}</span>
            )}
          </div>

          <div className="form-group">
            <label>Mot de passe *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-control ${fieldErrors.password ? 'error' : ''}`}
              placeholder="Minimum 8 caractères"
              required
              minLength={8}
            />
            <small className="form-hint">Minimum 8 caractères</small>
            {fieldErrors.password && (
              <span className="field-error">{fieldErrors.password[0]}</span>
            )}
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Déjà un compte ? <Link to="/login">Connectez-vous</Link></p>
          <p>Vous êtes un candidat ? <Link to="/register">Inscrivez-vous ici</Link></p>
        </div>
      </div>
    </div>
  );
};

export default EmployerRegister;
