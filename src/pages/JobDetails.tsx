import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { JobDetails as JobDetailsType, JobContractType, ExperienceLevel, EducationLevel } from '../types';
import { jobApi } from '../api/jobApi';
import ApplicationFormModal from '../components/ApplicationFormModal';
import { Clock, DollarSign, Building2, CheckCircle, ArrowLeft, Briefcase, GraduationCap, Users, Globe } from 'lucide-react';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  useEffect(() => {
    loadJobDetails();
  }, [id]);

  const loadJobDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await jobApi.getJobDetails(Number(id));
      setJob(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des détails');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const getContractTypeLabel = (type: JobContractType): string => {
    switch (type) {
      case 'FULL_TIME': return 'Temps plein';
      case 'PART_TIME': return 'Temps partiel';
      case 'CONTRACT': return 'Contrat';
      case 'INTERNSHIP': return 'Stage';
      case 'TEMPORARY': return 'Temporaire';
      default: return type;
    }
  };

  const getExperienceLevelLabel = (level: ExperienceLevel): string => {
    switch (level) {
      case 'ENTRY': return 'Débutant (0-2 ans)';
      case 'MID': return 'Intermédiaire (2-5 ans)';
      case 'SENIOR': return 'Senior (5-10 ans)';
      case 'LEAD': return 'Lead (10+ ans)';
      default: return level;
    }
  };

  const getEducationLevelLabel = (level: EducationLevel): string => {
    switch (level) {
      case 'NONE': return 'Aucun diplôme requis';
      case 'HIGH_SCHOOL': return 'Bac';
      case 'BACHELOR': return 'Licence';
      case 'MASTER': return 'Master';
      case 'DOCTORATE': return 'Doctorat';
      case 'OTHER': return 'Autre';
      default: return level;
    }
  };

  const formatSalary = (amount: number, currency: string): string => {
    return `${amount.toLocaleString('fr-FR')} ${currency}`;
  };

  const handleApply = () => {
    setShowApplicationModal(true);
  };

  const handleApplicationSuccess = () => {
    setApplied(true);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadJobDetails}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container">
        <div className="error-message">
          <p>Offre non trouvée</p>
          <button className="btn btn-primary" onClick={() => navigate('/jobs')}>
            Retour aux offres
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="job-details-page">
      <div className="container">
        <button className="btn-back" onClick={() => navigate('/jobs')}>
          <ArrowLeft size={20} />
          Retour aux offres
        </button>
        
        <div className="job-details-container">
          <div className="job-details-main">
            <div className="job-header-full">
              <div className="job-logo-large">
                <Building2 size={48} />
              </div>
              <div>
                <h1>{job.title}</h1>
                <h2>{job.companyName}</h2>
                <div className="job-badges">
                  <span className="badge badge-primary">{getContractTypeLabel(job.contractType)}</span>
                  {job.positionsCount > 1 && (
                    <span className="badge badge-info">{job.positionsCount} postes disponibles</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="job-meta-grid">
              <div className="meta-item">
                <Briefcase size={18} />
                <div>
                  <strong>Expérience</strong>
                  <span>{getExperienceLevelLabel(job.experienceLevel)}</span>
                </div>
              </div>
              <div className="meta-item">
                <GraduationCap size={18} />
                <div>
                  <strong>Formation</strong>
                  <span>{getEducationLevelLabel(job.educationLevel)}</span>
                </div>
              </div>
              <div className="meta-item">
                <DollarSign size={18} />
                <div>
                  <strong>Salaire</strong>
                  <span>{formatSalary(job.salaryAmount, job.salaryCurrency)}</span>
                </div>
              </div>
              <div className="meta-item">
                <Clock size={18} />
                <div>
                  <strong>Type de contrat</strong>
                  <span>{getContractTypeLabel(job.contractType)}</span>
                </div>
              </div>
            </div>
            
            <div className="job-section">
              <h3>Description du poste</h3>
              <p className="job-description-full">{job.jobDescription}</p>
            </div>
            
            <div className="job-section">
              <h3>Profil recherché</h3>
              <p className="job-description-full">{job.profileDescription}</p>
            </div>

            {job.requiredLanguages && job.requiredLanguages.length > 0 && (
              <div className="job-section">
                <h3>Langues requises</h3>
                <div className="language-tags">
                  {job.requiredLanguages.map((lang, index) => (
                    <span key={index} className="language-tag">
                      <Globe size={14} />
                      {lang.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="job-section">
              <div className="job-dates">
                {job.publishedAt && (
                  <p className="text-muted">
                    Publié le {new Date(job.publishedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="job-details-sidebar">
            <div className="apply-card">
              {applied ? (
                <div className="applied-message">
                  <CheckCircle size={48} className="success-icon" />
                  <h3>Candidature envoyée !</h3>
                  <p>Votre candidature a été transmise à l'employeur. Vous recevrez une réponse prochainement.</p>
                </div>
              ) : (
                <>
                  <h3>Intéressé par ce poste ?</h3>
                  <p>Postulez maintenant et donnez un nouvel élan à votre carrière</p>
                  <button className="btn btn-primary btn-block" onClick={handleApply}>
                    Postuler maintenant
                  </button>
                </>
              )}
            </div>
            
            <div className="company-info">
              <h3>À propos de l'entreprise</h3>
              <div className="company-logo">
                <Building2 size={32} />
              </div>
              <h4>{job.companyName}</h4>
              {job.positionsCount > 1 && (
                <div className="info-highlight">
                  <Users size={16} />
                  <span>{job.positionsCount} postes à pourvoir</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de candidature */}
      {showApplicationModal && job && (
        <ApplicationFormModal
          jobId={job.id}
          jobTitle={job.title}
          companyName={job.companyName}
          onClose={() => setShowApplicationModal(false)}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
};

export default JobDetails;
