import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
import { useLanguage } from '../context/LanguageContext';
import { useSEO } from '../utils/useSEO';

const SENEGAL_REGIONS = [
  'Dakar',
  'Diourbel',
  'Fatick',
  'Kaffrine',
  'Kaolack',
  'Kedougou',
  'Kolda',
  'Louga',
  'Matam',
  'Saint-Louis',
  'Sedhiou',
  'Tambacounda',
  'Thies',
  'Ziguinchor',
] as const;

type WorkMode = 'REMOTE' | 'HYBRID' | 'ON_SITE';

interface EmployerJobFormData {
  title: string;
  positionsCount: number;
  jobDescription: string;
  requirements: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  contractType: JobContractType;
  workMode: WorkMode;
  experienceLevel: ExperienceLevel;
  educationLevel: EducationLevel;
  skills: string[];
}

const EmployerDashboard = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const { user } = useAuth();

  useSEO({
    title: 'Espace employeur',
    description: "Tableau de bord employeur SNJobConnect — publiez vos offres d'emploi, gérez vos candidatures et suivez vos recrutements.",
    path: '/employer/dashboard',
    noIndex: true,
  });
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobDetails | null>(null);
  const [employerApplications, setEmployerApplications] = useState<ApplicationResponse[]>([]);

  const [formData, setFormData] = useState<EmployerJobFormData>({
    title: '',
    positionsCount: 1,
    jobDescription: '',
    requirements: '',
    location: 'Dakar',
    salaryMin: 0,
    salaryMax: 0,
    workMode: 'ON_SITE',
    experienceLevel: 'ENTRY',
    educationLevel: 'NONE',
    contractType: 'FULL_TIME',
    salaryCurrency: 'XOF',
    skills: [],
  });

  const [skillInput, setSkillInput] = useState('');

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
      const data = await applicationApi.getMyEmployerApplications();
      setEmployerApplications(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, isEn ? 'Error while loading applications' : 'Erreur lors du chargement des candidatures'));
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

    if (formData.salaryMax < formData.salaryMin) {
      setError(isEn ? 'Invalid salary range (max < min).' : 'La fourchette salariale est invalide (max < min).');
      return;
    }

    setLoading(true);

    try {
      const payload: JobCreateRequest = {
        title: formData.title,
        positionsCount: formData.positionsCount,
        jobDescription: formData.jobDescription,
        profileDescription: formData.requirements,
        experienceLevel: formData.experienceLevel,
        requiredLanguages: [],
        requiredSkills: formData.skills,
        educationLevel: formData.educationLevel,
        contractType: formData.contractType,
        salaryMin: formData.salaryMin,
        salaryMax: formData.salaryMax,
        salaryCurrency: formData.salaryCurrency,
        location: formData.location,
        remoteWorkType: formData.workMode,
      };

      const newJob = await employerJobApi.createJob(payload);
      setJobs([newJob, ...jobs]);
      setSuccess(isEn ? 'Job offer created as draft' : 'Offre créée avec succès en mode brouillon');
      setShowForm(false);
      resetForm();
    } catch (err: unknown) {
      setError(getErrorMessage(err, isEn ? 'Error while creating job offer' : "Erreur lors de la création de l'offre"));
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (jobId: number) => {
    try {
      const updatedJob = await employerJobApi.publishJob(jobId);
      setJobs(jobs.map((j) => (j.id === jobId ? updatedJob : j)));
      setSuccess(isEn ? 'Job offer published successfully' : 'Offre publiée avec succès');
    } catch (err: unknown) {
      setError(getErrorMessage(err, isEn ? 'Error while publishing' : 'Erreur lors de la publication'));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      positionsCount: 1,
      jobDescription: '',
      requirements: '',
      location: 'Dakar',
      salaryMin: 0,
      salaryMax: 0,
      workMode: 'ON_SITE',
      experienceLevel: 'ENTRY',
      educationLevel: 'NONE',
      contractType: 'FULL_TIME',
      salaryCurrency: 'XOF',
      skills: [],
    });
    setSkillInput('');
  };

  const addSkill = () => {
    const normalized = skillInput.trim();
    if (normalized && !formData.skills.includes(normalized)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, normalized],
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((item) => item !== skill),
    });
  };

  const handleViewDetails = async (jobId: number) => {
    setLoadingDetails(true);
    setError(null);
    try {
      const details = await employerJobApi.getJobDetails(jobId);
      setSelectedJob(details);
    } catch (err: unknown) {
      setError(getErrorMessage(err, isEn ? 'Error while loading details' : 'Erreur lors du chargement des détails'));
    } finally {
      setLoadingDetails(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="badge badge-secondary">{isEn ? 'Draft' : 'Brouillon'}</span>;
      case 'PUBLISHED':
        return <span className="badge badge-success">{isEn ? 'Published' : 'Publié'}</span>;
      case 'ARCHIVED':
        return <span className="badge badge-warning">{isEn ? 'Archived' : 'Archivé'}</span>;
      default:
        return null;
    }
  };

  const activeJobs = jobs.filter((j) => j.status === 'PUBLISHED');
  const drafts = jobs.filter((j) => j.status === 'DRAFT');
  const totalApplications = employerApplications.length;
  const applicationsPerJob = employerApplications.reduce<Record<number, number>>((acc, app) => {
    acc[app.jobId] = (acc[app.jobId] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="container">
          <h1>{isEn ? 'Employer space' : 'Espace employeur'}</h1>
          <p>{isEn ? 'Welcome' : 'Bienvenue'}, {user?.name}</p>
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
                <p>{isEn ? 'Active jobs' : 'Offres actives'}</p>
              </div>
            </div>

            <div className="stat-card">
              <Users size={32} />
              <div>
                <h3>{totalApplications}</h3>
                <p>{isEn ? 'Applications' : 'Nombre de candidatures'}</p>
              </div>
            </div>

            <div className="stat-card">
              <FileText size={32} />
              <div>
                <h3>{employerApplications.filter((app) => app.status === 'HIRED' || app.status === 'ACCEPTED').length}</h3>
                <p>{isEn ? 'Hired candidates' : 'Candidats embauchés'}</p>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>{isEn ? 'Employer dashboard' : 'Tableau de bord employeur'}</h2>
              <div className="job-actions">
                <Link className="btn btn-outline" to="/employer/applications">
                  {isEn ? 'Manage applications' : 'Gérer les candidatures'}
                </Link>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                  <PlusCircle size={18} />
                  {isEn ? 'Post a job offer' : 'Publier une offre d&apos;emploi'}
                </button>
              </div>
            </div>

            {showForm && (
              <div className="job-form">
                <h3>{isEn ? 'New job offer' : "Nouvelle offre d'emploi"}</h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>{isEn ? 'Job title *' : 'Titre du poste *'}</label>
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
                      <label>{isEn ? 'Number of openings *' : 'Nombre de postes *'}</label>
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
                    <label>{isEn ? 'Job description *' : 'Description du poste *'}</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={formData.jobDescription}
                      onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                      placeholder={isEn ? 'Describe responsibilities and missions...' : 'Décrivez les responsabilités et missions du poste...'}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{isEn ? 'Requirements *' : 'Exigences *'}</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      placeholder={isEn ? 'Ex: 3 years of experience, React, communication...' : 'Ex: 3 ans d\'experience, maitrise de React, communication...'}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{isEn ? 'Location *' : 'Localisation *'}</label>
                      <select
                        className="form-control"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                      >
                        {SENEGAL_REGIONS.map((region) => (
                          <option key={region} value={region}>
                            {region}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>{isEn ? 'Work mode *' : 'Type de travail *'}</label>
                      <select
                        className="form-control"
                        value={formData.workMode}
                        onChange={(e) => setFormData({ ...formData, workMode: e.target.value as WorkMode })}
                      >
                        <option value="ON_SITE">{isEn ? 'On-site' : 'Sur site'}</option>
                        <option value="HYBRID">{isEn ? 'Hybrid' : 'Hybride'}</option>
                        <option value="REMOTE">{isEn ? 'Remote' : 'Teletravail'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{isEn ? 'Experience level *' : 'Niveau d\'expérience *'}</label>
                      <select
                        className="form-control"
                        value={formData.experienceLevel}
                        onChange={(e) =>
                          setFormData({ ...formData, experienceLevel: e.target.value as ExperienceLevel })
                        }
                      >
                        <option value="ENTRY">{isEn ? 'Entry (0-2 years)' : 'Débutant (0-2 ans)'}</option>
                        <option value="MID">{isEn ? 'Mid (2-5 years)' : 'Intermédiaire (2-5 ans)'}</option>
                        <option value="SENIOR">{isEn ? 'Senior (5-10 years)' : 'Senior (5-10 ans)'}</option>
                        <option value="LEAD">Lead (10+ ans)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>{isEn ? 'Education level *' : 'Niveau d\'études requis *'}</label>
                      <select
                        className="form-control"
                        value={formData.educationLevel}
                        onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value as EducationLevel })}
                      >
                        <option value="NONE">{isEn ? 'No degree required' : 'Aucun diplôme requis'}</option>
                        <option value="HIGH_SCHOOL">{isEn ? 'High school' : 'Bac'}</option>
                        <option value="BACHELOR">{isEn ? 'Bachelor' : 'Licence'}</option>
                        <option value="MASTER">Master</option>
                        <option value="DOCTORATE">{isEn ? 'PhD' : 'Doctorat'}</option>
                        <option value="OTHER">{isEn ? 'Other' : 'Autre'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{isEn ? 'Required skills' : 'Competences requises'}</label>
                    <div className="language-input">
                      <input
                        type="text"
                        className="form-control"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        placeholder={isEn ? 'Add a skill' : 'Ajouter une competence'}
                        maxLength={60}
                      />
                      <button type="button" className="btn btn-sm btn-outline" onClick={addSkill}>
                        {isEn ? 'Add' : 'Ajouter'}
                      </button>
                    </div>
                    <div className="language-tags">
                      {formData.skills.map((skill) => (
                        <span key={skill} className="tag">
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)}>
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{isEn ? 'Contract type *' : 'Type de contrat *'}</label>
                      <select
                        className="form-control"
                        value={formData.contractType}
                        onChange={(e) => setFormData({ ...formData, contractType: e.target.value as JobContractType })}
                      >
                        <option value="FULL_TIME">{isEn ? 'Full time' : 'Temps plein'}</option>
                        <option value="PART_TIME">{isEn ? 'Part time' : 'Temps partiel'}</option>
                        <option value="CONTRACT">{isEn ? 'Contract' : 'Contrat'}</option>
                        <option value="INTERNSHIP">{isEn ? 'Internship' : 'Stage'}</option>
                        <option value="TEMPORARY">{isEn ? 'Temporary' : 'Temporaire'}</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>{isEn ? 'Currency *' : 'Devise *'}</label>
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

                  <div className="form-row">
                    <div className="form-group">
                      <label>{isEn ? 'Minimum salary *' : 'Fourchette salariale min *'}</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.salaryMin}
                        onChange={(e) => setFormData({ ...formData, salaryMin: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>{isEn ? 'Maximum salary *' : 'Fourchette salariale max *'}</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.salaryMax}
                        onChange={(e) => setFormData({ ...formData, salaryMax: parseFloat(e.target.value) || 0 })}
                        min={formData.salaryMin}
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                      {isEn ? 'Cancel' : 'Annuler'}
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? (isEn ? 'Creating...' : 'Création...') : (isEn ? 'Create draft' : 'Créer le brouillon')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="dashboard-subsection">
              <h3>{isEn ? 'Active job offers' : 'Tableau des offres actives'}</h3>
              {activeJobs.length === 0 ? (
                <p className="empty-state">{isEn ? 'No active job offers yet' : 'Aucune offre active pour le moment'}</p>
              ) : (
                <div className="dashboard-table-wrapper">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>{isEn ? 'Offer' : 'Offre'}</th>
                        <th>{isEn ? 'Company' : 'Entreprise'}</th>
                        <th>{isEn ? 'Published date' : 'Date de publication'}</th>
                        <th>{isEn ? 'Applications' : 'Candidatures'}</th>
                        <th>{isEn ? 'Status' : 'Statut'}</th>
                        <th>{isEn ? 'Action' : 'Action'}</th>
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
                            <div className="job-actions">
                              <Link className="btn btn-sm btn-outline" to={`/employer/applications?jobId=${job.id}`}>
                                {isEn ? 'View candidates' : 'Voir candidats'}
                              </Link>
                              <button
                                className="btn btn-sm btn-outline"
                                onClick={() => handleViewDetails(job.id)}
                                disabled={loadingDetails}
                              >
                                {loadingDetails ? (isEn ? 'Loading...' : 'Chargement...') : (isEn ? 'View' : 'Voir')}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
              <h3>{isEn ? 'Drafts to publish' : 'Brouillons à publier'}</h3>
              {drafts.length === 0 ? (
                <p className="empty-state">{isEn ? 'No pending drafts.' : 'Aucun brouillon en attente.'}</p>
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
                          {isEn ? 'Publish' : 'Publier'}
                        </button>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => handleViewDetails(job.id)}
                          disabled={loadingDetails}
                        >
                          {loadingDetails ? (isEn ? 'Loading...' : 'Chargement...') : (isEn ? 'View' : 'Voir')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-section">
            <h2>{isEn ? 'Profile' : 'Profil'}</h2>
            <div className="profile-card">
              <div className="profile-info">
                <h3>{user?.name}</h3>
                <p>{user?.email}</p>
              </div>
              <div className="profile-actions">
                <button className="btn btn-outline">{isEn ? 'Edit profile' : 'Modifier le profil'}</button>
                <button className="btn btn-outline" onClick={() => setShowPasswordForm(!showPasswordForm)}>
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

      {selectedJob && <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </div>
  );
};

export default EmployerDashboard;
