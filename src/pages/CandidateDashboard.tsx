import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, Briefcase, CheckCircle, Clock, X, Lock, Sparkles } from 'lucide-react';
import type {
  ApplicationResponse,
  ApplicationStatus,
  CvOptimizationResponse,
  EducationLevel,
  ExperienceLevel,
  JobContractType,
  JobMatchItem,
} from '../types';
import { applicationApi } from '../api/applicationApi';
import { jobMatchingApi } from '../api/jobMatchingApi';
import ChangePasswordForm from '../components/ChangePasswordForm';
import { useLanguage } from '../context/LanguageContext';
import { translateJobTitle } from '../utils/jobTitleTranslation';
import { useSEO } from '../utils/useSEO';

const CandidateDashboard = () => {
  useSEO({
    title: 'Espace candidat',
    description: 'Tableau de bord candidat SNJobConnect — suivez vos candidatures, gérez votre CV et trouvez les offres adaptées à votre profil.',
    path: '/candidate/dashboard',
    noIndex: true,
  });
  const { language } = useLanguage();
  const isEn = language === 'en';
  const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
    { value: 'ENTRY', label: isEn ? 'Entry (0-2 years)' : 'Débutant (0–2 ans)' },
    { value: 'MID', label: isEn ? 'Mid (2-5 years)' : 'Confirmé (2–5 ans)' },
    { value: 'SENIOR', label: isEn ? 'Senior (5-10 years)' : 'Senior (5–10 ans)' },
    { value: 'LEAD', label: isEn ? 'Lead / 10+ years' : 'Lead / 10+ ans' },
  ];
  const EDUCATION_OPTIONS: { value: EducationLevel; label: string }[] = [
    { value: 'NONE', label: isEn ? 'No degree required' : 'Sans diplôme exigé' },
    { value: 'HIGH_SCHOOL', label: isEn ? 'High school' : 'Bac' },
    { value: 'BACHELOR', label: isEn ? 'Bachelor' : 'Licence / Bachelor' },
    { value: 'MASTER', label: 'Master' },
    { value: 'DOCTORATE', label: isEn ? 'PhD' : 'Doctorat' },
    { value: 'OTHER', label: isEn ? 'Other' : 'Autre' },
  ];
  const CONTRACT_OPTIONS: { value: JobContractType; label: string }[] = [
    { value: 'FULL_TIME', label: isEn ? 'Full time' : 'Temps plein' },
    { value: 'PART_TIME', label: isEn ? 'Part time' : 'Temps partiel' },
    { value: 'CONTRACT', label: isEn ? 'Contract' : 'CDD / contrat' },
    { value: 'INTERNSHIP', label: isEn ? 'Internship' : 'Stage' },
    { value: 'TEMPORARY', label: isEn ? 'Temporary' : 'Intérim / temporaire' },
  ];
  const contractLabel = (t: JobContractType): string => CONTRACT_OPTIONS.find((o) => o.value === t)?.label ?? t;
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [matches, setMatches] = useState<JobMatchItem[]>([]);
  const [matchLoading, setMatchLoading] = useState(true);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileForm, setProfileForm] = useState<{
    experience: ExperienceLevel | '';
    education: EducationLevel | '';
    contracts: Set<JobContractType>;
    keywords: string;
    cvTextForMatching: string;
  }>({
    experience: '',
    education: '',
    contracts: new Set(),
    keywords: '',
    cvTextForMatching: '',
  });
  const [profileComplete, setProfileComplete] = useState(false);
  const [cvOptimizerOpenForJobId, setCvOptimizerOpenForJobId] = useState<number | null>(null);
  const [cvSourceText, setCvSourceText] = useState('');
  const [cvOptimizing, setCvOptimizing] = useState(false);
  const [cvOptimizeError, setCvOptimizeError] = useState<string | null>(null);
  const [cvOptimizeResult, setCvOptimizeResult] = useState<CvOptimizationResponse | null>(null);

  const loadMatching = useCallback(async () => {
    try {
      setMatchLoading(true);
      setMatchError(null);
      const [profile, list] = await Promise.all([
        jobMatchingApi.getMatchingProfile(),
        jobMatchingApi.getJobMatches(),
      ]);
      setProfileComplete(profile.profileComplete);
      setProfileForm({
        experience: profile.profileExperienceLevel ?? '',
        education: profile.profileEducationLevel ?? '',
        contracts: new Set(profile.preferredContractTypes ?? []),
        keywords: profile.jobMatchKeywords ?? '',
        cvTextForMatching: profile.cvTextForMatching ?? '',
      });
      setMatches(list);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (isEn ? 'Error while loading matching' : 'Erreur lors du chargement du matching');
      setMatchError(msg);
    } finally {
      setMatchLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    loadMatching();
  }, [loadMatching]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await applicationApi.getMyCandidateApplications();
      setApplications(data);
    } catch (err: any) {
      setError(err.message || (isEn ? 'Error while loading applications' : 'Erreur lors du chargement des candidatures'));
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'SUBMITTED':
        return <Clock size={20} className="status-icon pending" />;
      case 'REVIEWED':
        return <FileText size={20} className="status-icon reviewed" />;
      case 'ACCEPTED':
        return <CheckCircle size={20} className="status-icon accepted" />;
      case 'REJECTED':
        return <X size={20} className="status-icon rejected" />;
      case 'WITHDRAWN':
        return <X size={20} className="status-icon withdrawn" />;
    }
  };

  const saveMatchingProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      setMatchError(null);
      const updated = await jobMatchingApi.updateMatchingProfile({
        profileExperienceLevel: profileForm.experience || null,
        profileEducationLevel: profileForm.education || null,
        preferredContractTypes: [...profileForm.contracts],
        jobMatchKeywords: profileForm.keywords.trim() || null,
        cvTextForMatching: profileForm.cvTextForMatching.trim() || null,
      });
      setProfileComplete(updated.profileComplete);
      const list = await jobMatchingApi.getJobMatches();
      setMatches(list);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (isEn ? 'Error while saving' : 'Erreur lors de l’enregistrement');
      setMatchError(msg);
    } finally {
      setProfileSaving(false);
    }
  };

  const toggleContract = (value: JobContractType) => {
    setProfileForm((prev) => {
      const next = new Set(prev.contracts);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return { ...prev, contracts: next };
    });
  };

  const openCvOptimizer = (jobId: number) => {
    setCvOptimizerOpenForJobId(jobId);
    setCvOptimizeError(null);
    setCvOptimizeResult(null);
  };

  const closeCvOptimizer = () => {
    setCvOptimizerOpenForJobId(null);
    setCvOptimizing(false);
    setCvOptimizeError(null);
    setCvOptimizeResult(null);
  };

  const runCvOptimization = async (jobId: number) => {
    if (!cvSourceText.trim()) {
      setCvOptimizeError(isEn ? 'Paste your current CV text before optimization.' : 'Collez le texte actuel de votre CV avant de lancer l’optimisation.');
      return;
    }
    try {
      setCvOptimizing(true);
      setCvOptimizeError(null);
      const result = await jobMatchingApi.optimizeCvForJob(jobId, cvSourceText);
      setCvOptimizeResult(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (isEn ? 'Error during AI optimization' : 'Erreur pendant l’optimisation IA');
      setCvOptimizeError(msg);
    } finally {
      setCvOptimizing(false);
    }
  };

  const getStatusText = (status: ApplicationStatus) => {
    switch (status) {
      case 'SUBMITTED':
        return isEn ? 'Pending' : 'En attente';
      case 'REVIEWED':
        return isEn ? 'Reviewed' : 'Examinée';
      case 'ACCEPTED':
        return isEn ? 'Accepted' : 'Acceptée';
      case 'REJECTED':
        return isEn ? 'Rejected' : 'Refusée';
      case 'WITHDRAWN':
        return isEn ? 'Withdrawn' : 'Retirée';
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="container">
          <h1>{isEn ? 'My candidate space' : 'Mon espace candidat'}</h1>
          <p>{isEn ? 'Welcome' : 'Bienvenue'}, {user?.name}</p>
        </div>
      </div>
      
      <div className="container">
        <div className="dashboard-content">
          <div className="dashboard-section matching-section">
                <div className="section-header">
                  <h2>
                    <Sparkles size={28} className="matching-section-icon" aria-hidden />
                    {isEn ? 'Recommended jobs' : 'Offres pour vous'}
                  </h2>
                </div>
                {!profileComplete && (
                  <p className="matching-hint">
                    {isEn
                      ? 'Fill at least your experience and education below for better matching scores.'
                      : 'Renseignez au minimum votre expérience et votre formation ci-dessous pour des scores de correspondance plus fiables.'}
                  </p>
                )}

                <form className="matching-profile-form" onSubmit={saveMatchingProfile}>
                  <h3 className="matching-subtitle">{isEn ? 'Matching profile' : 'Profil de matching'}</h3>
                  <div className="matching-form-grid">
                    <label className="matching-field">
                      <span>{isEn ? 'Experience level' : 'Niveau d&apos;expérience'}</span>
                      <select
                        value={profileForm.experience}
                        onChange={(ev) =>
                          setProfileForm((p) => ({
                            ...p,
                            experience: (ev.target.value || '') as ExperienceLevel | '',
                          }))
                        }
                      >
                        <option value="">{isEn ? '— Not specified —' : '— Non renseigné —'}</option>
                        {EXPERIENCE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="matching-field">
                      <span>{isEn ? 'Education' : 'Formation'}</span>
                      <select
                        value={profileForm.education}
                        onChange={(ev) =>
                          setProfileForm((p) => ({
                            ...p,
                            education: (ev.target.value || '') as EducationLevel | '',
                          }))
                        }
                      >
                        <option value="">{isEn ? '— Not specified —' : '— Non renseigné —'}</option>
                        {EDUCATION_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <fieldset className="matching-contracts">
                    <legend>{isEn ? 'Preferred contract types' : 'Types de contrat recherchés'}</legend>
                    <div className="matching-contract-chips">
                      {CONTRACT_OPTIONS.map((o) => (
                        <label key={o.value} className="matching-chip">
                          <input
                            type="checkbox"
                            checked={profileForm.contracts.has(o.value)}
                            onChange={() => toggleContract(o.value)}
                          />
                          <span>{o.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <label className="matching-field matching-keywords">
                    <span>{isEn ? 'Keywords (skills, sectors...)' : 'Mots-clés (compétences, secteurs…)'}</span>
                    <textarea
                      rows={3}
                      maxLength={500}
                      placeholder={isEn ? 'e.g. Java, sales, logistics' : 'ex. Java, commercial, logistique'}
                      value={profileForm.keywords}
                      onChange={(ev) => setProfileForm((p) => ({ ...p, keywords: ev.target.value }))}
                    />
                  </label>
                  <label className="matching-field matching-keywords">
                    <span>{isEn ? 'CV content for matching' : 'Contenu CV pour le matching'}</span>
                    <textarea
                      rows={7}
                      maxLength={20000}
                      placeholder={isEn ? 'Paste your CV text to compare with job descriptions' : 'Collez ici le texte de votre CV pour comparer avec les descriptions des offres'}
                      value={profileForm.cvTextForMatching}
                      onChange={(ev) => setProfileForm((p) => ({ ...p, cvTextForMatching: ev.target.value }))}
                    />
                  </label>
                  <div className="matching-form-actions">
                    <button type="submit" className="btn btn-primary" disabled={profileSaving}>
                      {profileSaving ? (isEn ? 'Saving...' : 'Enregistrement…') : (isEn ? 'Save and refresh offers' : 'Enregistrer et actualiser les offres')}
                    </button>
                  </div>
                </form>

                {matchError && (
                  <div className="error-message matching-error">
                    <p>{matchError}</p>
                    <button type="button" className="btn btn-primary" onClick={() => loadMatching()}>
                      {isEn ? 'Retry' : 'Réessayer'}
                    </button>
                  </div>
                )}

                {matchLoading && !matchError ? (
                  <div className="loading-message matching-loading">
                    <div className="spinner" />
                    <p>{isEn ? 'Loading recommendations...' : 'Chargement des recommandations…'}</p>
                  </div>
                ) : !matchError && matches.length === 0 ? (
                  <div className="empty-state matching-empty">
                    <Briefcase size={48} />
                    <p>{isEn ? 'No recommendations for now (or you already applied everywhere).' : 'Aucune offre à vous proposer pour le moment (ou vous avez déjà postulé partout).'}</p>
                    <Link to="/jobs" className="btn btn-primary">
                      {isEn ? 'See all jobs' : 'Voir toutes les offres'}
                    </Link>
                  </div>
                ) : !matchError ? (
                  <ul className="job-match-list">
                    {matches.map((m) => (
                      <li key={m.jobId} className="job-match-card">
                        <div className="job-match-card-top">
                          <div>
                            <h3>{translateJobTitle(m.title, language)}</h3>
                            <p className="job-match-company">{m.companyName}</p>
                          </div>
                          <span className="match-score-pill" title="Correspondance estimée">
                            {m.matchPercent}%
                          </span>
                        </div>
                        <p className="job-match-meta">
                          {contractLabel(m.contractType)} · {m.salaryMin.toLocaleString(isEn ? 'en-US' : 'fr-FR')} -{' '}
                          {m.salaryMax.toLocaleString(isEn ? 'en-US' : 'fr-FR')} {m.salaryCurrency}
                          {m.publishedAt
                            ? ` · ${isEn ? 'Published on' : 'Publiée le'} ${new Date(m.publishedAt).toLocaleDateString(isEn ? 'en-US' : 'fr-FR')}`
                            : ''}
                        </p>
                        {m.matchHighlights.length > 0 && (
                          <ul className="match-highlights">
                            {m.matchHighlights.map((line, i) => (
                              <li key={`${m.jobId}-${i}`}>{line}</li>
                            ))}
                          </ul>
                        )}
                        <Link to={`/jobs/${m.jobId}`} className="btn btn-outline job-match-cta">
                          {isEn ? 'View offer' : 'Voir l&apos;offre'}
                        </Link>
                       {/*  <button
                          type="button"
                          className="btn btn-primary job-match-cta"
                          onClick={() => openCvOptimizer(m.jobId)}
                        >
                          {isEn ? 'Optimize my CV with AI' : 'Optimiser mon CV avec IA'}
                        </button> */}

                        {cvOptimizerOpenForJobId === m.jobId && (
                          <div className="cv-optimizer-panel">
                            <h4>{isEn ? 'AI optimization for' : 'Optimisation IA pour'} {translateJobTitle(m.title, language)}</h4>
                            <p className="cv-optimizer-help">
                              {isEn
                                ? 'Paste your current CV text. The tool will suggest an optimized version for this job.'
                                : 'Collez votre CV actuel en texte. L&apos;outil propose une version optimisée pour cette offre.'}
                            </p>
                            <label className="matching-field">
                              <span>{isEn ? 'My current CV (text)' : 'Mon CV actuel (texte)'}</span>
                              <textarea
                                rows={10}
                                maxLength={20000}
                                value={cvSourceText}
                                onChange={(ev) => setCvSourceText(ev.target.value)}
                                placeholder={isEn ? 'Paste your CV content here' : 'Copiez-collez ici le contenu de votre CV'}
                              />
                            </label>
                            <div className="cv-optimizer-actions">
                              <button
                                type="button"
                                className="btn btn-primary"
                                disabled={cvOptimizing}
                                onClick={() => runCvOptimization(m.jobId)}
                              >
                                {cvOptimizing ? (isEn ? 'Optimizing...' : 'Optimisation…') : (isEn ? 'Start optimization' : 'Lancer l’optimisation')}
                              </button>
                              <button type="button" className="btn btn-outline" onClick={closeCvOptimizer}>
                                {isEn ? 'Close' : 'Fermer'}
                              </button>
                            </div>

                            {cvOptimizeError && <p className="cv-optimizer-error">{cvOptimizeError}</p>}

                            {cvOptimizeResult && (
                              <div className="cv-optimizer-result">
                                <label className="matching-field">
                                  <span>{isEn ? 'Optimized CV' : 'CV optimisé'}</span>
                                  <textarea readOnly rows={12} value={cvOptimizeResult.optimizedCvText} />
                                </label>
                                {cvOptimizeResult.keyImprovements.length > 0 && (
                                  <ul className="match-highlights">
                                    {cvOptimizeResult.keyImprovements.map((line, idx) => (
                                      <li key={`${cvOptimizeResult.jobId}-improvement-${idx}`}>{line}</li>
                                    ))}
                                  </ul>
                                )}
                                <p className="cv-optimizer-disclaimer">{cvOptimizeResult.disclaimer}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : null}
          </div>

          {loading ? (
            <div className="loading-message">
              <div className="spinner"></div>
              <p>{isEn ? 'Loading your applications...' : 'Chargement de vos candidatures...'}</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button className="btn btn-primary" onClick={loadApplications}>
                {isEn ? 'Retry' : 'Réessayer'}
              </button>
            </div>
          ) : (
            <>
              <div className="dashboard-stats">
                <div className="stat-card">
                  <Briefcase size={32} />
                  <div>
                    <h3>{applications.length}</h3>
                    <p>{isEn ? 'Applications' : 'Candidatures'}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <Clock size={32} />
                  <div>
                    <h3>{applications.filter((a) => a.status === 'SUBMITTED').length}</h3>
                    <p>{isEn ? 'Pending' : 'En attente'}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <CheckCircle size={32} />
                  <div>
                    <h3>{applications.filter((a) => a.status === 'ACCEPTED').length}</h3>
                    <p>{isEn ? 'Accepted' : 'Acceptées'}</p>
                  </div>
                </div>
              </div>

              <div className="dashboard-section">
                <h2>{isEn ? 'My applications' : 'Mes candidatures'}</h2>
                
                {applications.length === 0 ? (
                  <div className="empty-state">
                    <Briefcase size={48} />
                    <p>{isEn ? "You haven't applied to any jobs yet" : "Vous n'avez pas encore postulé à des offres"}</p>
                    <a href="/jobs" className="btn btn-primary">
                      {isEn ? 'Browse jobs' : 'Découvrir les offres'}
                    </a>
                  </div>
                ) : (
                  <div className="applications-list">
                    {applications.map(app => (
                      <div key={app.applicationId} className="application-card">
                        <div className="application-header">
                          {getStatusIcon(app.status)}
                          <div>
                            <h3>{translateJobTitle(app.jobTitle, language)}</h3>
                            <p>{app.companyName}</p>
                          </div>
                        </div>
                        
                        <div className="application-meta">
                          <span className={`status-badge ${app.status.toLowerCase()}`}>
                            {getStatusText(app.status)}
                          </span>
                          <span className="application-date">
                            {isEn ? 'Applied on' : 'Postulé le'} {new Date(app.createdAt).toLocaleDateString(isEn ? 'en-US' : 'fr-FR')}
                          </span>
                        </div>
                        
                        {app.coverLetter && (
                          <div className="application-cover-letter">
                            <strong>{isEn ? 'Cover letter' : 'Lettre de motivation'}</strong>
                            <p className="cover-letter-preview">{app.coverLetter}</p>
                          </div>
                        )}

                        {app.cvUrl && (
                          <div className="application-cv">
                            <FileText size={16} />
                            <a href={app.cvUrl} target="_blank" rel="noopener noreferrer">
                              {isEn ? 'View my CV' : 'Voir mon CV'}
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="dashboard-section">
            <h2>{isEn ? 'Profile' : 'Profil'}</h2>
            <div className="profile-card">
              <div className="profile-info">
                <h3>{user?.name}</h3>
                <p>{user?.email}</p>
              </div>
              <div className="profile-actions">
                <button className="btn btn-outline">{isEn ? 'Edit profile' : 'Modifier le profil'}</button>
                <button 
                  className="btn btn-outline"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                >
                  <Lock size={18} />
                  {showPasswordForm ? (isEn ? 'Hide' : 'Masquer') : (isEn ? 'Change password' : 'Changer le mot de passe')}
                </button>
              </div>
            </div>
            
            {showPasswordForm && (
              <div className="password-form-container">
                <ChangePasswordForm />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
