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

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: 'ENTRY', label: 'Débutant (0–2 ans)' },
  { value: 'MID', label: 'Confirmé (2–5 ans)' },
  { value: 'SENIOR', label: 'Senior (5–10 ans)' },
  { value: 'LEAD', label: 'Lead / 10+ ans' },
];

const EDUCATION_OPTIONS: { value: EducationLevel; label: string }[] = [
  { value: 'NONE', label: 'Sans diplôme exigé' },
  { value: 'HIGH_SCHOOL', label: 'Bac' },
  { value: 'BACHELOR', label: 'Licence / Bachelor' },
  { value: 'MASTER', label: 'Master' },
  { value: 'DOCTORATE', label: 'Doctorat' },
  { value: 'OTHER', label: 'Autre' },
];

const CONTRACT_OPTIONS: { value: JobContractType; label: string }[] = [
  { value: 'FULL_TIME', label: 'Temps plein' },
  { value: 'PART_TIME', label: 'Temps partiel' },
  { value: 'CONTRACT', label: 'CDD / contrat' },
  { value: 'INTERNSHIP', label: 'Stage' },
  { value: 'TEMPORARY', label: 'Intérim / temporaire' },
];

function contractLabel(t: JobContractType): string {
  return CONTRACT_OPTIONS.find((o) => o.value === t)?.label ?? t;
}

const CandidateDashboard = () => {
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
  }>({
    experience: '',
    education: '',
    contracts: new Set(),
    keywords: '',
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
      });
      setMatches(list);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du chargement du matching';
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
      setError(err.message || 'Erreur lors du chargement des candidatures');
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
      });
      setProfileComplete(updated.profileComplete);
      const list = await jobMatchingApi.getJobMatches();
      setMatches(list);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de l’enregistrement';
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
      setCvOptimizeError('Collez le texte actuel de votre CV avant de lancer l’optimisation.');
      return;
    }
    try {
      setCvOptimizing(true);
      setCvOptimizeError(null);
      const result = await jobMatchingApi.optimizeCvForJob(jobId, cvSourceText);
      setCvOptimizeResult(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur pendant l’optimisation IA';
      setCvOptimizeError(msg);
    } finally {
      setCvOptimizing(false);
    }
  };

  const getStatusText = (status: ApplicationStatus) => {
    switch (status) {
      case 'SUBMITTED':
        return 'En attente';
      case 'REVIEWED':
        return 'Examinée';
      case 'ACCEPTED':
        return 'Acceptée';
      case 'REJECTED':
        return 'Refusée';
      case 'WITHDRAWN':
        return 'Retirée';
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="container">
          <h1>Mon espace candidat</h1>
          <p>Bienvenue, {user?.name}</p>
        </div>
      </div>
      
      <div className="container">
        <div className="dashboard-content">
          <div className="dashboard-section matching-section">
                <div className="section-header">
                  <h2>
                    <Sparkles size={28} className="matching-section-icon" aria-hidden />
                    Offres pour vous
                  </h2>
                </div>
                {!profileComplete && (
                  <p className="matching-hint">
                    Renseignez au minimum votre expérience et votre formation ci-dessous pour des scores de
                    correspondance plus fiables.
                  </p>
                )}

                <form className="matching-profile-form" onSubmit={saveMatchingProfile}>
                  <h3 className="matching-subtitle">Profil de matching</h3>
                  <div className="matching-form-grid">
                    <label className="matching-field">
                      <span>Niveau d&apos;expérience</span>
                      <select
                        value={profileForm.experience}
                        onChange={(ev) =>
                          setProfileForm((p) => ({
                            ...p,
                            experience: (ev.target.value || '') as ExperienceLevel | '',
                          }))
                        }
                      >
                        <option value="">— Non renseigné —</option>
                        {EXPERIENCE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="matching-field">
                      <span>Formation</span>
                      <select
                        value={profileForm.education}
                        onChange={(ev) =>
                          setProfileForm((p) => ({
                            ...p,
                            education: (ev.target.value || '') as EducationLevel | '',
                          }))
                        }
                      >
                        <option value="">— Non renseigné —</option>
                        {EDUCATION_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <fieldset className="matching-contracts">
                    <legend>Types de contrat recherchés</legend>
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
                    <span>Mots-clés (compétences, secteurs…)</span>
                    <textarea
                      rows={3}
                      maxLength={500}
                      placeholder="ex. Java, commercial, logistique"
                      value={profileForm.keywords}
                      onChange={(ev) => setProfileForm((p) => ({ ...p, keywords: ev.target.value }))}
                    />
                  </label>
                  <div className="matching-form-actions">
                    <button type="submit" className="btn btn-primary" disabled={profileSaving}>
                      {profileSaving ? 'Enregistrement…' : 'Enregistrer et actualiser les offres'}
                    </button>
                  </div>
                </form>

                {matchError && (
                  <div className="error-message matching-error">
                    <p>{matchError}</p>
                    <button type="button" className="btn btn-primary" onClick={() => loadMatching()}>
                      Réessayer
                    </button>
                  </div>
                )}

                {matchLoading && !matchError ? (
                  <div className="loading-message matching-loading">
                    <div className="spinner" />
                    <p>Chargement des recommandations…</p>
                  </div>
                ) : !matchError && matches.length === 0 ? (
                  <div className="empty-state matching-empty">
                    <Briefcase size={48} />
                    <p>Aucune offre à vous proposer pour le moment (ou vous avez déjà postulé partout).</p>
                    <Link to="/jobs" className="btn btn-primary">
                      Voir toutes les offres
                    </Link>
                  </div>
                ) : !matchError ? (
                  <ul className="job-match-list">
                    {matches.map((m) => (
                      <li key={m.jobId} className="job-match-card">
                        <div className="job-match-card-top">
                          <div>
                            <h3>{m.title}</h3>
                            <p className="job-match-company">{m.companyName}</p>
                          </div>
                          <span className="match-score-pill" title="Correspondance estimée">
                            {m.matchPercent}%
                          </span>
                        </div>
                        <p className="job-match-meta">
                          {contractLabel(m.contractType)} · {m.salaryAmount.toLocaleString('fr-FR')}{' '}
                          {m.salaryCurrency}
                          {m.publishedAt
                            ? ` · Publiée le ${new Date(m.publishedAt).toLocaleDateString('fr-FR')}`
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
                          Voir l&apos;offre
                        </Link>
                        <button
                          type="button"
                          className="btn btn-primary job-match-cta"
                          onClick={() => openCvOptimizer(m.jobId)}
                        >
                          Optimiser mon CV avec IA
                        </button>

                        {cvOptimizerOpenForJobId === m.jobId && (
                          <div className="cv-optimizer-panel">
                            <h4>Optimisation IA pour {m.title}</h4>
                            <p className="cv-optimizer-help">
                              Collez votre CV actuel en texte. L&apos;outil propose une version optimisée pour
                              cette offre.
                            </p>
                            <label className="matching-field">
                              <span>Mon CV actuel (texte)</span>
                              <textarea
                                rows={10}
                                maxLength={20000}
                                value={cvSourceText}
                                onChange={(ev) => setCvSourceText(ev.target.value)}
                                placeholder="Copiez-collez ici le contenu de votre CV"
                              />
                            </label>
                            <div className="cv-optimizer-actions">
                              <button
                                type="button"
                                className="btn btn-primary"
                                disabled={cvOptimizing}
                                onClick={() => runCvOptimization(m.jobId)}
                              >
                                {cvOptimizing ? 'Optimisation…' : 'Lancer l’optimisation'}
                              </button>
                              <button type="button" className="btn btn-outline" onClick={closeCvOptimizer}>
                                Fermer
                              </button>
                            </div>

                            {cvOptimizeError && <p className="cv-optimizer-error">{cvOptimizeError}</p>}

                            {cvOptimizeResult && (
                              <div className="cv-optimizer-result">
                                <label className="matching-field">
                                  <span>CV optimisé</span>
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
              <p>Chargement de vos candidatures...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button className="btn btn-primary" onClick={loadApplications}>
                Réessayer
              </button>
            </div>
          ) : (
            <>
              <div className="dashboard-stats">
                <div className="stat-card">
                  <Briefcase size={32} />
                  <div>
                    <h3>{applications.length}</h3>
                    <p>Candidatures</p>
                  </div>
                </div>

                <div className="stat-card">
                  <Clock size={32} />
                  <div>
                    <h3>{applications.filter((a) => a.status === 'SUBMITTED').length}</h3>
                    <p>En attente</p>
                  </div>
                </div>

                <div className="stat-card">
                  <CheckCircle size={32} />
                  <div>
                    <h3>{applications.filter((a) => a.status === 'ACCEPTED').length}</h3>
                    <p>Acceptées</p>
                  </div>
                </div>
              </div>

              <div className="dashboard-section">
                <h2>Mes candidatures</h2>
                
                {applications.length === 0 ? (
                  <div className="empty-state">
                    <Briefcase size={48} />
                    <p>Vous n'avez pas encore postulé à des offres</p>
                    <a href="/jobs" className="btn btn-primary">
                      Découvrir les offres
                    </a>
                  </div>
                ) : (
                  <div className="applications-list">
                    {applications.map(app => (
                      <div key={app.applicationId} className="application-card">
                        <div className="application-header">
                          {getStatusIcon(app.status)}
                          <div>
                            <h3>{app.jobTitle}</h3>
                            <p>{app.companyName}</p>
                          </div>
                        </div>
                        
                        <div className="application-meta">
                          <span className={`status-badge ${app.status.toLowerCase()}`}>
                            {getStatusText(app.status)}
                          </span>
                          <span className="application-date">
                            Postulé le {new Date(app.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        
                        {app.coverLetter && (
                          <div className="application-cover-letter">
                            <strong>Lettre de motivation</strong>
                            <p className="cover-letter-preview">{app.coverLetter}</p>
                          </div>
                        )}

                        {app.cvUrl && (
                          <div className="application-cv">
                            <FileText size={16} />
                            <a href={app.cvUrl} target="_blank" rel="noopener noreferrer">
                              Voir mon CV
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
            <h2>Profil</h2>
            <div className="profile-card">
              <div className="profile-info">
                <h3>{user?.name}</h3>
                <p>{user?.email}</p>
              </div>
              <div className="profile-actions">
                <button className="btn btn-outline">Modifier le profil</button>
                <button 
                  className="btn btn-outline"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                >
                  <Lock size={18} />
                  {showPasswordForm ? 'Masquer' : 'Changer le mot de passe'}
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
