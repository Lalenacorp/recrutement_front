import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, AlertCircle, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { authApi, ApiError } from '../api/authApi';
import type { EmployerSignupRequest, CompanySector, CompanySize } from '../api/types';
import EmailVerificationPending from './EmailVerificationPending';

const PHONE_E164 = /^\+[1-9]\d{1,14}$/;

const EmployerRegister = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [showVerificationPending, setShowVerificationPending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [sectorsOpen, setSectorsOpen] = useState(false);
  const sectorDropdownRef = useRef<HTMLDivElement>(null);

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
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  useEffect(() => {
    if (!sectorsOpen) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (sectorDropdownRef.current && !sectorDropdownRef.current.contains(e.target as Node)) {
        setSectorsOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSectorsOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [sectorsOpen]);

  const toggleSector = (value: CompanySector) => {
    setFieldErrors(prev => {
      if (!prev.companySectors) return prev;
      const next = { ...prev };
      delete next.companySectors;
      return next;
    });
    setFormData(prev => {
      if (prev.companySectors.includes(value)) {
        return { ...prev, companySectors: prev.companySectors.filter(s => s !== value) };
      }
      if (prev.companySectors.length >= 5) return prev;
      return { ...prev, companySectors: [...prev.companySectors, value] };
    });
  };

  const sectorLabelsSummary = (): string => {
    if (formData.companySectors.length === 0) {
      return 'Cliquez pour choisir (1 à 5 secteurs)';
    }
    const labels = formData.companySectors.map(
      v => companySectors.find(s => s.value === v)?.label ?? v
    );
    const joined = labels.join(', ');
    return joined.length > 52 ? `${joined.slice(0, 50)}…` : joined;
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
  };

  const validateStep1 = (): boolean => {
    if (!formData.companyName.trim()) {
      setError('Indiquez le nom de l’entreprise');
      return false;
    }
    if (!formData.companyAddress.trim()) {
      setError('Indiquez l’adresse');
      return false;
    }
    if (!formData.companyCity.trim()) {
      setError('Indiquez la ville');
      return false;
    }
    if (!(formData.companyPostalCode ?? '').trim()) {
      setError('Indiquez le code postal');
      return false;
    }
    if (formData.companySectors.length === 0) {
      setError('Sélectionnez au moins un secteur d’activité');
      return false;
    }
    if (formData.companySectors.length > 5) {
      setError('Vous ne pouvez sélectionner que 5 secteurs maximum');
      return false;
    }
    if (!formData.companyDescription.trim()) {
      setError('Rédigez une description de l’entreprise');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Indiquez le prénom et le nom du contact');
      return false;
    }
    if (!(formData.jobTitle ?? '').trim()) {
      setError('Indiquez le poste occupé');
      return false;
    }
    const primary = (formData.phonePrimary ?? '').trim();
    if (!primary) {
      setError('Indiquez un téléphone principal');
      return false;
    }
    if (!PHONE_E164.test(primary)) {
      setError('Téléphone principal invalide. Format international requis (ex. +221701234567)');
      return false;
    }
    const secondary = (formData.phoneSecondary ?? '').trim();
    if (secondary && !PHONE_E164.test(secondary)) {
      setError('Téléphone secondaire invalide. Utilisez le même format international.');
      return false;
    }
    return true;
  };

  const goNext = () => {
    setError(null);
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const goBack = () => {
    setError(null);
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (formData.email !== formData.confirmEmail) {
      setError('Les adresses email ne correspondent pas');
      return;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.registerEmployer(formData, logoFile || undefined);
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

  const fieldErr = (name: string) => fieldErrors[name]?.[0];

  return (
    <div className="auth-page">
      <div className="auth-container auth-container--employer-register">
        <Link to="/register" className="register-profile-back">
          <ChevronLeft size={18} aria-hidden />
          Choisir un autre profil
        </Link>
        <div className="auth-header auth-header--compact">
          <Briefcase size={36} />
          <h2>Inscription Employeur</h2>
          <p>Créez votre compte pour publier des offres d’emploi</p>
        </div>

        <div className="employer-register-stepper" aria-label="Progression du formulaire">
          <div
            className={`employer-register-stepper__item ${step === 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}
          >
            <span className="employer-register-stepper__num">1</span>
            <span className="employer-register-stepper__label">Entreprise</span>
          </div>
          <div className={`employer-register-stepper__bar ${step >= 2 ? 'filled' : ''}`} aria-hidden />
          <div
            className={`employer-register-stepper__item ${step === 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}
          >
            <span className="employer-register-stepper__num">2</span>
            <span className="employer-register-stepper__label">Contact</span>
          </div>
          <div className={`employer-register-stepper__bar ${step >= 3 ? 'filled' : ''}`} aria-hidden />
          <div className={`employer-register-stepper__item ${step === 3 ? 'active' : ''}`}>
            <span className="employer-register-stepper__num">3</span>
            <span className="employer-register-stepper__label">Compte</span>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={step === 3 ? handleSubmit : (ev) => ev.preventDefault()}
          className="auth-form auth-form--register employer-register-form"
        >
          {step === 1 && (
            <>
              <p className="employer-register-step-intro">Informations sur votre structure</p>

              <div className="form-group">
                <label>Nom de l&apos;entreprise *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={`form-control ${fieldErrors.companyName ? 'error' : ''}`}
                  required
                />
                {fieldErr('companyName') && <span className="field-error">{fieldErr('companyName')}</span>}
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
                {fieldErr('companyAddress') && <span className="field-error">{fieldErr('companyAddress')}</span>}
              </div>

              <div className="form-grid-2 employer-register-address-row">
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
                  {fieldErr('companyCity') && <span className="field-error">{fieldErr('companyCity')}</span>}
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
                  {fieldErr('companyPostalCode') && (
                    <span className="field-error">{fieldErr('companyPostalCode')}</span>
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
                <label id="sectors-label">Secteurs d&apos;activité * (1 à 5)</label>
                <div
                  className={`sector-multiselect ${fieldErrors.companySectors ? 'sector-multiselect--error' : ''}`}
                  ref={sectorDropdownRef}
                >
                  <button
                    type="button"
                    className="sector-multiselect__trigger form-control"
                    onClick={() => setSectorsOpen(o => !o)}
                    aria-expanded={sectorsOpen}
                    aria-haspopup="listbox"
                    aria-labelledby="sectors-label"
                  >
                    <span
                      className={`sector-multiselect__value ${
                        formData.companySectors.length === 0 ? 'is-placeholder' : ''
                      }`}
                    >
                      {sectorLabelsSummary()}
                    </span>
                    <ChevronDown
                      size={20}
                      className={`sector-multiselect__chevron ${sectorsOpen ? 'open' : ''}`}
                      aria-hidden
                    />
                  </button>
                  {sectorsOpen && (
                    <div className="sector-multiselect__panel" role="listbox" aria-multiselectable>
                      {companySectors.map(sector => {
                        const checked = formData.companySectors.includes(sector.value);
                        const disabled = !checked && formData.companySectors.length >= 5;
                        return (
                          <label
                            key={sector.value}
                            className={`sector-multiselect__option ${disabled ? 'is-disabled' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={disabled}
                              onChange={() => toggleSector(sector.value)}
                            />
                            <span>{sector.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
                <small className="form-hint">Cochez jusqu&apos;à 5 secteurs</small>
                {fieldErr('companySectors') && <span className="field-error">{fieldErr('companySectors')}</span>}
              </div>

              <div className="form-group">
                <label>Taille de l&apos;entreprise *</label>
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
                <label>Description de l&apos;entreprise *</label>
                <textarea
                  name="companyDescription"
                  value={formData.companyDescription}
                  onChange={handleChange}
                  className={`form-control ${fieldErrors.companyDescription ? 'error' : ''}`}
                  rows={4}
                  placeholder="Activités, mission, valeurs…"
                  required
                />
                {fieldErr('companyDescription') && (
                  <span className="field-error">{fieldErr('companyDescription')}</span>
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
                {fieldErr('companyWebsite') && <span className="field-error">{fieldErr('companyWebsite')}</span>}
              </div>

              <div className="form-group">
                <label>Logo (optionnel)</label>
                <input type="file" accept="image/*" onChange={handleLogoChange} className="form-control" />
                <small className="form-hint">PNG ou JPG, max. 2 Mo recommandé</small>
              </div>

              <button type="button" className="btn btn-primary btn-block" onClick={goNext}>
                Continuer
                <ChevronRight size={18} aria-hidden />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <p className="employer-register-step-intro">Personne référente côté entreprise</p>

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

              <div className="form-grid-2">
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
                  {fieldErr('firstName') && <span className="field-error">{fieldErr('firstName')}</span>}
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
                  {fieldErr('lastName') && <span className="field-error">{fieldErr('lastName')}</span>}
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
                  placeholder="Directeur RH, CEO…"
                  required
                />
                {fieldErr('jobTitle') && <span className="field-error">{fieldErr('jobTitle')}</span>}
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
                <small className="form-hint">Format international (E.164)</small>
                {fieldErr('phonePrimary') && <span className="field-error">{fieldErr('phonePrimary')}</span>}
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
                {fieldErr('phoneSecondary') && <span className="field-error">{fieldErr('phoneSecondary')}</span>}
              </div>

              <div className="form-group">
                <label>Profil LinkedIn</label>
                <input
                  type="url"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                  className={`form-control ${fieldErrors.linkedinUrl ? 'error' : ''}`}
                  placeholder="https://www.linkedin.com/in/…"
                />
                {fieldErr('linkedinUrl') && <span className="field-error">{fieldErr('linkedinUrl')}</span>}
              </div>

              <div className="register-form-actions">
                <button type="button" className="btn btn-outline" onClick={goBack}>
                  <ChevronLeft size={18} aria-hidden />
                  Retour
                </button>
                <button type="button" className="btn btn-primary" onClick={goNext}>
                  Continuer
                  <ChevronRight size={18} aria-hidden />
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="employer-register-step-intro">Identifiants de connexion</p>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-control ${fieldErrors.email ? 'error' : ''}`}
                  placeholder="vous@entreprise.com"
                  required
                  autoComplete="email"
                />
                {fieldErr('email') && <span className="field-error">{fieldErr('email')}</span>}
              </div>

              <div className="form-group">
                <label>Confirmer l&apos;email *</label>
                <input
                  type="email"
                  name="confirmEmail"
                  value={formData.confirmEmail}
                  onChange={handleChange}
                  className={`form-control ${fieldErrors.confirmEmail ? 'error' : ''}`}
                  placeholder="vous@entreprise.com"
                  required
                  autoComplete="email"
                />
                {fieldErr('confirmEmail') && <span className="field-error">{fieldErr('confirmEmail')}</span>}
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
                  autoComplete="new-password"
                />
                <small className="form-hint">Minimum 8 caractères</small>
                {fieldErr('password') && <span className="field-error">{fieldErr('password')}</span>}
              </div>

              <div className="register-form-actions">
                <button type="button" className="btn btn-outline" onClick={goBack} disabled={loading}>
                  <ChevronLeft size={18} aria-hidden />
                  Retour
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Inscription…' : "S'inscrire"}
                </button>
              </div>
            </>
          )}
        </form>

        <div className="auth-footer">
          <p>Déjà un compte ? <Link to="/login">Connectez-vous</Link></p>
          <p>
            <Link to="/register">Autre type de compte (candidat ou employeur)</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployerRegister;
