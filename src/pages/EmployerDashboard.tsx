import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Briefcase, Lock, Send, FileText, Users, Search } from 'lucide-react';
import type {
  JobResponse,
  JobCreateRequest,
  JobDetails,
  EducationLevel,
  ExperienceLevel,
  JobContractType,
  ApplicationResponse,
} from '../types';
import { employerJobApi } from '../api/employerJobApi';
import { applicationApi } from '../api/applicationApi';
import ChangePasswordForm from '../components/ChangePasswordForm';
import JobDetailsModal from '../components/JobDetailsModal';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobDetails | null>(null);
  const [employerApplications, setEmployerApplications] = useState<ApplicationResponse[]>([]);

  const [formData, setFormData] = useState<JobCreateRequest>({
    title: '',
    positionsCount: 1,
    jobDescription: '',
    profileDescription: '',
    experienceLevel: 'ENTRY',
    requiredLanguages: [],
    educationLevel: 'NONE',
    contractType: 'FULL_TIME',
    salaryAmount: 0,
    salaryCurrency: 'XOF',
  });

  const [languageInput, setLanguageInput] = useState('');

  const getErrorMessage = (err: unknown, fallback: string): string => {
    if (err instanceof Error && err.message) return err.message;
    return fallback;
  };

  const loadJobs = useCallback(async () => {
    try {
      const data = await employerJobApi.listMyJobs();
      setJobs(data);
    } catch (err: unknown) {
      console.error('Erreur lors du chargement des offres:', err);
    }
  }, []);

  const loadApplications = useCallback(async () => {
    try {
      setLoadingApplications(true);
      const data = await applicationApi.getMyEmployerApplications();
      setEmployerApplications(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erreur lors du chargement des candidatures'));
    } finally {
      setLoadingApplications(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
    loadApplications();
  }, [loadJobs, loadApplications]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const newJob = await employerJobApi.createJob(formData);
      setJobs([newJob, ...jobs]);
      setSuccess('Offre créée avec succès en mode brouillon');
      setShowForm(false);
      resetForm();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erreur lors de la création de l'offre"));
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (jobId: number) => {
    try {
      const updatedJob = await employerJobApi.publishJob(jobId);
      setJobs(jobs.map((j) => (j.id === jobId ? updatedJob : j)));
      setSuccess('Offre publiée avec succès');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erreur lors de la publication'));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      positionsCount: 1,
      jobDescription: '',
      profileDescription: '',
      experienceLevel: 'ENTRY',
      requiredLanguages: [],
      educationLevel: 'NONE',
      contractType: 'FULL_TIME',
      salaryAmount: 0,
      salaryCurrency: 'XOF',
    });
    setLanguageInput('');
  };

  const addLanguage = () => {
    if (languageInput && !formData.requiredLanguages.includes(languageInput)) {
      setFormData({
        ...formData,
        requiredLanguages: [...formData.requiredLanguages, languageInput],
      });
      setLanguageInput('');
    }
  };

  const removeLanguage = (lang: string) => {
    setFormData({
      ...formData,
      requiredLanguages: formData.requiredLanguages.filter((l) => l !== lang),
    });
  };

  const handleViewDetails = async (jobId: number) => {
    setLoadingDetails(true);
    setError(null);
    try {
      const details = await employerJobApi.getJobDetails(jobId);
      setSelectedJob(details);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erreur lors du chargement des détails'));
    } finally {
      setLoadingDetails(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="badge badge-secondary">Brouillon</span>;
      case 'PUBLISHED':
        return <span className="badge badge-success">Publié</span>;
      case 'ARCHIVED':
        return <span className="badge badge-warning">Archivé</span>;
      default:
        return null;
    }
  };

  const getApplicationStatusLabel = (status: 'SUBMITTED' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED') => {
    switch (status) {
      case 'SUBMITTED':
        return 'Nouvelle';
      case 'REVIEWED':
        return 'Examinée';
      case 'ACCEPTED':
        return 'Acceptée';
      case 'REJECTED':
        return 'Refusée';
      default:
        return status;
    }
  };

  const activeJobs = jobs.filter((j) => j.status === 'PUBLISHED');
  const drafts = jobs.filter((j) => j.status === 'DRAFT');
  const totalApplications = employerApplications.length;
  const recentApplications = employerApplications.slice(0, 5);
  const applicationsPerJob = employerApplications.reduce<Record<number, number>>((acc, app) => {
    acc[app.jobId] = (acc[app.jobId] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="container">
          <h1>Espace employeur</h1>
          <p>Bienvenue, {user?.name}</p>
        </div>
      </div>

      <div className="container">
        <div className="dashboard-content">
          {error && (
            <div className="alert alert-error">
              {error}
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}
          {success && (
            <div className="alert alert-success">
              {success}
              <button onClick={() => setSuccess(null)}>×</button>
            </div>
          )}

          <div className="dashboard-stats">
            <div className="stat-card">
              <Briefcase size={32} />
              <div>
                <h3>{activeJobs.length}</h3>
                <p>Offres actives</p>
              </div>
            </div>

            <div className="stat-card">
              <Users size={32} />
              <div>
                <h3>{totalApplications}</h3>
                <p>Nombre de candidatures</p>
              </div>
            </div>

            <div className="stat-card">
              <FileText size={32} />
              <div>
                <h3>{recentApplications.length}</h3>
                <p>Candidatures récentes</p>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Tableau de bord employeur</h2>
              <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                <PlusCircle size={18} />
                Publier une offre d&apos;emploi
              </button>
            </div>

            {showForm && (
              <div className="job-form">
                <h3>Nouvelle offre d'emploi</h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Titre du poste *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        maxLength={150}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Nombre de postes *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.positionsCount}
                        onChange={(e) => setFormData({ ...formData, positionsCount: parseInt(e.target.value, 10) })}
                        min="1"
                        max="1000"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description du poste *</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={formData.jobDescription}
                      onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                      placeholder="Décrivez les responsabilités et missions du poste..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description du profil recherché *</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={formData.profileDescription}
                      onChange={(e) => setFormData({ ...formData, profileDescription: e.target.value })}
                      placeholder="Décrivez le profil idéal du candidat..."
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Niveau d'expérience *</label>
                      <select
                        className="form-control"
                        value={formData.experienceLevel}
                        onChange={(e) =>
                          setFormData({ ...formData, experienceLevel: e.target.value as ExperienceLevel })
                        }
                      >
                        <option value="ENTRY">Débutant (0-2 ans)</option>
                        <option value="MID">Intermédiaire (2-5 ans)</option>
                        <option value="SENIOR">Senior (5-10 ans)</option>
                        <option value="LEAD">Lead (10+ ans)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Niveau d'études requis *</label>
                      <select
                        className="form-control"
                        value={formData.educationLevel}
                        onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value as EducationLevel })}
                      >
                        <option value="NONE">Aucun diplôme requis</option>
                        <option value="HIGH_SCHOOL">Bac</option>
                        <option value="BACHELOR">Licence</option>
                        <option value="MASTER">Master</option>
                        <option value="DOCTORATE">Doctorat</option>
                        <option value="OTHER">Autre</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Langues requises (ex: fr, en, ar)</label>
                    <div className="language-input">
                      <input
                        type="text"
                        className="form-control"
                        value={languageInput}
                        onChange={(e) => setLanguageInput(e.target.value.toLowerCase())}
                        placeholder="Ajouter une langue (code ISO)"
                        maxLength={5}
                      />
                      <button type="button" className="btn btn-sm btn-outline" onClick={addLanguage}>
                        Ajouter
                      </button>
                    </div>
                    <div className="language-tags">
                      {formData.requiredLanguages.map((lang) => (
                        <span key={lang} className="tag">
                          {lang}
                          <button type="button" onClick={() => removeLanguage(lang)}>
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Type de contrat *</label>
                      <select
                        className="form-control"
                        value={formData.contractType}
                        onChange={(e) => setFormData({ ...formData, contractType: e.target.value as JobContractType })}
                      >
                        <option value="FULL_TIME">Temps plein</option>
                        <option value="PART_TIME">Temps partiel</option>
                        <option value="CONTRACT">Contrat</option>
                        <option value="INTERNSHIP">Stage</option>
                        <option value="TEMPORARY">Temporaire</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Devise *</label>
                      <select
                        className="form-control"
                        value={formData.salaryCurrency}
                        onChange={(e) => setFormData({ ...formData, salaryCurrency: e.target.value })}
                      >
                        <option value="XOF">XOF (Franc CFA)</option>
                        <option value="EUR">EUR (Euro)</option>
                        <option value="USD">USD (Dollar)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Salaire proposé *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.salaryAmount}
                      onChange={(e) => setFormData({ ...formData, salaryAmount: parseFloat(e.target.value) })}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                      Annuler
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Création...' : 'Créer le brouillon'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="dashboard-subsection">
              <h3>Tableau des offres actives</h3>
              {activeJobs.length === 0 ? (
                <p className="empty-state">Aucune offre active pour le moment</p>
              ) : (
                <div className="dashboard-table-wrapper">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Offre</th>
                        <th>Entreprise</th>
                        <th>Date de publication</th>
                        <th>Candidatures</th>
                        <th>Statut</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeJobs.map((job) => (
                        <tr key={job.id}>
                          <td>{job.title}</td>
                          <td>{job.companyName}</td>
                          <td>{job.publishedAt ? new Date(job.publishedAt).toLocaleDateString('fr-FR') : '—'}</td>
                          <td>{applicationsPerJob[job.id] ?? 0}</td>
                          <td>{getStatusBadge(job.status)}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline"
                              onClick={() => handleViewDetails(job.id)}
                              disabled={loadingDetails}
                            >
                              {loadingDetails ? 'Chargement...' : 'Voir'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="dashboard-subsection">
              <h3>Candidatures récentes</h3>
              {loadingApplications ? (
                <p className="empty-state">Chargement des candidatures...</p>
              ) : recentApplications.length === 0 ? (
                <p className="empty-state">Aucune candidature récente disponible pour l&apos;instant.</p>
              ) : (
                <div className="jobs-list">
                  {recentApplications.map((application) => (
                    <div key={application.applicationId} className="job-item">
                      <div>
                        <h3>
                          {[application.candidateFirstName, application.candidateLastName]
                            .filter(Boolean)
                            .join(' ') || application.candidateEmail || 'Candidat'}
                        </h3>
                        <p>{application.jobTitle}</p>
                        <small>Reçue le {new Date(application.createdAt).toLocaleDateString('fr-FR')}</small>
                      </div>
                      <div className="job-actions">
                        <span className="badge badge-info">{getApplicationStatusLabel(application.status)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dashboard-subsection">
              <h3>Aperçu de la recherche de candidats</h3>
              {activeJobs.length === 0 ? (
                <p className="empty-state">Publiez une offre pour démarrer la recherche de candidats.</p>
              ) : (
                <div className="candidate-search-overview">
                  {activeJobs.slice(0, 4).map((job) => (
                    <div key={job.id} className="candidate-search-card">
                      <div className="candidate-search-card-header">
                        <Search size={18} />
                        <h4>{job.title}</h4>
                      </div>
                      <p>
                        Recherche en cours pour le poste &quot;{job.title}&quot; ({applicationsPerJob[job.id] ?? 0}{' '}
                        candidature{(applicationsPerJob[job.id] ?? 0) > 1 ? 's' : ''} reçue
                        {(applicationsPerJob[job.id] ?? 0) > 1 ? 's' : ''}).
                      </p>
                      <small>Entreprise: {job.companyName}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dashboard-subsection">
              <h3>Brouillons à publier</h3>
              {drafts.length === 0 ? (
                <p className="empty-state">Aucun brouillon en attente.</p>
              ) : (
                <div className="jobs-list">
                  {drafts.map((job) => (
                    <div key={job.id} className="job-item">
                      <div>
                        <h3>{job.title}</h3>
                        <p>{job.companyName}</p>
                      </div>
                      <div className="job-actions">
                        {getStatusBadge(job.status)}
                        <button className="btn btn-sm btn-primary" onClick={() => handlePublish(job.id)}>
                          <Send size={14} />
                          Publier
                        </button>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => handleViewDetails(job.id)}
                          disabled={loadingDetails}
                        >
                          {loadingDetails ? 'Chargement...' : 'Voir'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-section">
            <h2>Profil</h2>
            <div className="profile-card">
              <div className="profile-info">
                <h3>{user?.name}</h3>
                <p>{user?.email}</p>
              </div>
              <div className="profile-actions">
                <button className="btn btn-outline">Modifier le profil</button>
                <button className="btn btn-outline" onClick={() => setShowPasswordForm(!showPasswordForm)}>
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

      {selectedJob && <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </div>
  );
};

export default EmployerDashboard;
