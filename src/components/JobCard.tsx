import { Clock, Coins, Building2, Briefcase, GraduationCap, MapPin, Wifi, Bookmark } from 'lucide-react';
import type { JobDetails, JobContractType, ExperienceLevel, EducationLevel, RemoteWorkType } from '../types';
import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translateJobTitle } from '../utils/jobTitleTranslation';

interface JobCardProps {
  job: JobDetails;
  isSaved: boolean;
  onToggleSave: (jobId: number) => void;
}

const JobCard = ({ job, isSaved, onToggleSave }: JobCardProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isEn = language === 'en';

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
      case 'ENTRY': return isEn ? 'Entry level' : 'Débutant';
      case 'MID': return isEn ? 'Mid level' : 'Intermédiaire';
      case 'SENIOR': return 'Senior';
      case 'LEAD': return 'Lead';
      default: return level;
    }
  };

  const getEducationLevelLabel = (level: EducationLevel): string => {
    switch (level) {
      case 'NONE': return isEn ? 'No degree' : 'Aucun diplôme';
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

  const getRemoteWorkLabel = (type?: RemoteWorkType): string => {
    switch (type) {
      case 'ON_SITE': return isEn ? 'On-site' : 'Sur site';
      case 'HYBRID': return isEn ? 'Hybrid' : 'Hybride';
      case 'REMOTE': return isEn ? 'Remote' : '100% télétravail';
      default: return isEn ? 'Not specified' : 'Non précisé';
    }
  };

  const goToDetails = () => {
    navigate(`/jobs/${job.id}`);
  };

  const handleSave = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggleSave(job.id);
  };

  const handleApply = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    navigate(`/jobs/${job.id}?apply=1`);
  };

  return (
    <div className="job-card" onClick={goToDetails}>
      <div className="job-card-header">
        <div className="job-logo">
          <Building2 size={32} />
        </div>
        <div className="job-info">
          <h3>{translateJobTitle(job.title, language)}</h3>
          <p className="company">{job.companyName}</p>
        </div>
      </div>
      
      <div className="job-card-details">
        <div className="detail">
          <Clock size={16} />
          <span>{getContractTypeLabel(job.contractType)}</span>
        </div>
        <div className="detail">
          <MapPin size={16} />
          <span>{job.location || (isEn ? 'Location not specified' : 'Localisation non précisée')}</span>
        </div>
        <div className="detail">
          <Wifi size={16} />
          <span>{getRemoteWorkLabel(job.remoteWorkType)}</span>
        </div>
        <div className="detail">
          <Briefcase size={16} />
          <span>{getExperienceLevelLabel(job.experienceLevel)}</span>
        </div>
        <div className="detail">
          <GraduationCap size={16} />
          <span>{getEducationLevelLabel(job.educationLevel)}</span>
        </div>
        <div className="detail">
          <Coins size={16} aria-hidden />
          <span>{formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
        </div>
      </div>
      
      <div className="job-meta">
        <span className="positions-count">{job.positionsCount} {isEn ? `position${job.positionsCount > 1 ? 's' : ''}` : `poste${job.positionsCount > 1 ? 's' : ''}`}</span>
        <span className="published-date">
          {job.publishedAt && `${isEn ? 'Published on' : 'Publié le'} ${new Date(job.publishedAt).toLocaleDateString(isEn ? 'en-US' : 'fr-FR')}`}
        </span>
      </div>

      <div className="job-card-actions">
        <button type="button" className="btn btn-outline" onClick={goToDetails}>
          {isEn ? 'View details' : 'Voir les détails'}
        </button>
        <button
          type="button"
          className={`btn ${isSaved ? 'btn-secondary' : 'btn-outline'}`}
          onClick={handleSave}
        >
          <Bookmark size={16} />
          {isSaved ? (isEn ? 'Saved' : 'Offre enregistrée') : (isEn ? 'Save job' : 'Enregistrer l’offre')}
        </button>
        <button type="button" className="btn btn-primary" onClick={handleApply}>
          {isEn ? 'Apply' : 'Postuler'}
        </button>
      </div>
    </div>
  );
};

export default JobCard;
