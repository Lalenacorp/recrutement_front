import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import type { JobDetails as JobDetailsType, JobContractType, ExperienceLevel, EducationLevel } from '../types';
import { jobApi } from '../api/jobApi';
import ApplicationFormModal from '../components/ApplicationFormModal';
import { Clock, Coins, Building2, CheckCircle, ArrowLeft, Briefcase, GraduationCap, Users, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translateJobTitle } from '../utils/jobTitleTranslation';
import { useSEO } from '../utils/useSEO';

const JobDetails = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [job, setJob] = useState<JobDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  const seoTitle = job
    ? `${translateJobTitle(job.title, language)} — ${job.companyName}`
    : isEn
      ? 'Job offer'
      : "Offre d'emploi";
  const seoDescription = job
    ? (job.jobDescription || job.profileDescription || '').slice(0, 200) +
      ((job.jobDescription || job.profileDescription || '').length > 200 ? '…' : '')
    : isEn
      ? 'Discover the details of this job offer on SNJobConnect.'
      : "Découvrez les détails de cette offre d'emploi sur SNJobConnect.";

  useSEO({
    title: seoTitle,
    description: seoDescription || (isEn ? 'Job offer on SNJobConnect.' : "Offre d'emploi sur SNJobConnect."),
    path: id ? `/jobs/${id}` : '/jobs',
    type: 'article',
    jsonLd: job
      ? {
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          title: translateJobTitle(job.title, language),
          description: job.jobDescription,
          datePosted: job.publishedAt,
          employmentType: job.contractType,
          hiringOrganization: {
            '@type': 'Organization',
            name: job.companyName,
            sameAs: 'https://snjobconnect.com/',
          },
          jobLocation: {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'SN',
            },
          },
          baseSalary:
            job.salaryMin || job.salaryMax
              ? {
                  '@type': 'MonetaryAmount',
                  currency: job.salaryCurrency || 'XOF',
                  value: {
                    '@type': 'QuantitativeValue',
                    minValue: job.salaryMin,
                    maxValue: job.salaryMax,
                    unitText: 'MONTH',
                  },
                }
              : undefined,
          url: `https://snjobconnect.com/jobs/${job.id}`,
        }
      : undefined,
  });

  useEffect(() => {
    loadJobDetails();
  }, [id]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('apply') === '1') {
      setShowApplicationModal(true);
    }
  }, [location.search]);

  const loadJobDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await jobApi.getJobDetails(Number(id));
      setJob(data);
    } catch (err: any) {
      setError(err.message || (isEn ? 'Error while loading details' : 'Erreur lors du chargement des détails'));
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const getContractTypeLabel = (type: JobContractType): string => {
    switch (type) {
      case 'FULL_TIME': return isEn ? 'Full time' : 'Temps plein';
      case 'PART_TIME': return isEn ? 'Part time' : 'Temps partiel';
      case 'CONTRACT': return isEn ? 'Contract' : 'Contrat';
      case 'INTERNSHIP': return isEn ? 'Internship' : 'Stage';
      case 'TEMPORARY': return isEn ? 'Temporary' : 'Temporaire';
      default: return type;
    }
  };

  const getExperienceLevelLabel = (level: ExperienceLevel): string => {
    switch (level) {
      case 'ENTRY': return isEn ? 'Entry level (0-2 years)' : 'Débutant (0-2 ans)';
      case 'MID': return isEn ? 'Mid level (2-5 years)' : 'Intermédiaire (2-5 ans)';
      case 'SENIOR': return 'Senior (5-10 ans)';
      case 'LEAD': return 'Lead (10+ ans)';
      default: return level;
    }
  };

  const getEducationLevelLabel = (level: EducationLevel): string => {
    switch (level) {
      case 'NONE': return isEn ? 'No degree required' : 'Aucun diplôme requis';
      case 'HIGH_SCHOOL': return isEn ? 'High school' : 'Bac';
      case 'BACHELOR': return isEn ? 'Bachelor' : 'Licence';
      case 'MASTER': return 'Master';
      case 'DOCTORATE': return isEn ? 'PhD' : 'Doctorat';
      case 'OTHER': return isEn ? 'Other' : 'Autre';
      default: return level;
    }
  };

  const formatSalaryRange = (
    min: number | undefined,
    max: number | undefined,
    currency: string | undefined
  ): string => {
    const safeCurrency = currency || 'XOF';
    if (typeof min === 'number' && typeof max === 'number') {
      return `${min.toLocaleString(isEn ? 'en-US' : 'fr-FR')} - ${max.toLocaleString(isEn ? 'en-US' : 'fr-FR')} ${safeCurrency}`;
    }
    if (typeof min === 'number') {
      return `${min.toLocaleString(isEn ? 'en-US' : 'fr-FR')} ${safeCurrency}`;
    }
    if (typeof max === 'number') {
      return `${max.toLocaleString(isEn ? 'en-US' : 'fr-FR')} ${safeCurrency}`;
    }
    return isEn ? 'Salary not specified' : 'Salaire non precise';
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
          <p>{isEn ? 'Loading details...' : 'Chargement des détails...'}</p>
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
            {isEn ? 'Retry' : 'Réessayer'}
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container">
        <div className="error-message">
          <p>{isEn ? 'Job not found' : 'Offre non trouvée'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/jobs')}>
            {isEn ? 'Back to jobs' : 'Retour aux offres'}
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
          {isEn ? 'Back to jobs' : 'Retour aux offres'}
        </button>
        
        <div className="job-details-container">
          <div className="job-details-main">
            <div className="job-header-full">
              <div className="job-logo-large">
                <Building2 size={48} />
              </div>
              <div>
                <h1>{translateJobTitle(job.title, language)}</h1>
                <h2>{job.companyName}</h2>
                <div className="job-badges">
                  <span className="badge badge-primary">{getContractTypeLabel(job.contractType)}</span>
                  {job.positionsCount > 1 && (
                    <span className="badge badge-info">{job.positionsCount} {isEn ? 'positions available' : 'postes disponibles'}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="job-meta-grid">
              <div className="meta-item">
                <Briefcase size={18} />
                <div>
                  <strong>{isEn ? 'Experience' : 'Expérience'}</strong>
                  <span>{getExperienceLevelLabel(job.experienceLevel)}</span>
                </div>
              </div>
              <div className="meta-item">
                <GraduationCap size={18} />
                <div>
                  <strong>{isEn ? 'Education' : 'Formation'}</strong>
                  <span>{getEducationLevelLabel(job.educationLevel)}</span>
                </div>
              </div>
              <div className="meta-item">
                <Coins size={18} aria-hidden />
                <div>
                  <strong>{isEn ? 'Salary' : 'Salaire'}</strong>
                  <span>{formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
                </div>
              </div>
              <div className="meta-item">
                <Clock size={18} />
                <div>
                  <strong>{isEn ? 'Contract type' : 'Type de contrat'}</strong>
                  <span>{getContractTypeLabel(job.contractType)}</span>
                </div>
              </div>
            </div>
            
            <div className="job-section">
              <h3>{isEn ? 'Job description' : 'Description du poste'}</h3>
              <p className="job-description-full">{job.jobDescription}</p>
            </div>
            
            <div className="job-section">
              <h3>{isEn ? 'Candidate profile' : 'Profil recherché'}</h3>
              <p className="job-description-full">{job.profileDescription}</p>
            </div>

            {job.requiredLanguages && job.requiredLanguages.length > 0 && (
              <div className="job-section">
                <h3>{isEn ? 'Required languages' : 'Langues requises'}</h3>
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
                    {isEn ? 'Published on' : 'Publié le'} {new Date(job.publishedAt).toLocaleDateString(isEn ? 'en-US' : 'fr-FR', {
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
                  <h3>{isEn ? 'Application sent!' : 'Candidature envoyée !'}</h3>
                  <p>{isEn ? 'Your application has been sent to the employer.' : 'Votre candidature a été transmise à l\'employeur. Vous recevrez une réponse prochainement.'}</p>
                </div>
              ) : (
                <>
                  <h3>{isEn ? 'Interested in this job?' : 'Intéressé par ce poste ?'}</h3>
                  <p>{isEn ? 'Apply now and boost your career' : 'Postulez maintenant et donnez un nouvel élan à votre carrière'}</p>
                  <button className="btn btn-primary btn-block" onClick={handleApply}>
                    {isEn ? 'Apply now' : 'Postuler maintenant'}
                  </button>
                </>
              )}
            </div>
            
            <div className="company-info">
              <h3>{isEn ? 'About the company' : 'À propos de l\'entreprise'}</h3>
              <div className="company-logo">
                <Building2 size={32} />
              </div>
              <h4>{job.companyName}</h4>
              {job.positionsCount > 1 && (
                <div className="info-highlight">
                  <Users size={16} />
                  <span>{job.positionsCount} {isEn ? 'positions to fill' : 'postes à pourvoir'}</span>
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
          jobTitle={translateJobTitle(job.title, language)}
          companyName={job.companyName}
          onClose={() => setShowApplicationModal(false)}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
};

export default JobDetails;
