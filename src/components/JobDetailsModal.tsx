import React from 'react';
import { X, Briefcase, GraduationCap, Globe, Coins, FileText, Users } from 'lucide-react';
import type { JobDetails, EducationLevel, ExperienceLevel, JobContractType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { translateJobTitle } from '../utils/jobTitleTranslation';

interface JobDetailsModalProps {
  job: JobDetails;
  onClose: () => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, onClose }) => {
  const { language } = useLanguage();
  const isEn = language === 'en';
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

  const getExperienceLevelLabel = (level: ExperienceLevel): string => {
    switch (level) {
      case 'ENTRY': return isEn ? 'Entry (0-2 years)' : 'Débutant (0-2 ans)';
      case 'MID': return isEn ? 'Mid (2-5 years)' : 'Intermédiaire (2-5 ans)';
      case 'SENIOR': return isEn ? 'Senior (5-10 years)' : 'Senior (5-10 ans)';
      case 'LEAD': return isEn ? 'Lead (10+ years)' : 'Lead (10+ ans)';
      default: return level;
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content job-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{translateJobTitle(job.title, language)}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="job-details-grid">
            <div className="detail-card">
              <div className="detail-icon">
                <Briefcase size={20} />
              </div>
              <div>
                <h4>{isEn ? 'Company' : 'Entreprise'}</h4>
                <p>{job.companyName}</p>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <Users size={20} />
              </div>
              <div>
                <h4>{isEn ? 'Open positions' : 'Nombre de postes'}</h4>
                <p>{job.positionsCount} {isEn ? `position${job.positionsCount > 1 ? 's' : ''}` : `poste${job.positionsCount > 1 ? 's' : ''}`}</p>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <FileText size={20} />
              </div>
              <div>
                <h4>{isEn ? 'Contract type' : 'Type de contrat'}</h4>
                <p>{getContractTypeLabel(job.contractType)}</p>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <Coins size={20} aria-hidden />
              </div>
              <div>
                <h4>{isEn ? 'Salary' : 'Salaire'}</h4>
                <p>{formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryCurrency)}</p>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <Briefcase size={20} />
              </div>
              <div>
                <h4>{isEn ? 'Required experience' : 'Expérience requise'}</h4>
                <p>{getExperienceLevelLabel(job.experienceLevel)}</p>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <GraduationCap size={20} />
              </div>
              <div>
                <h4>{isEn ? 'Education level' : 'Niveau d\'études'}</h4>
                <p>{getEducationLevelLabel(job.educationLevel)}</p>
              </div>
            </div>
          </div>

          {job.requiredLanguages && job.requiredLanguages.length > 0 && (
            <div className="detail-section">
              <div className="section-header">
                <Globe size={20} />
                <h3>{isEn ? 'Required languages' : 'Langues requises'}</h3>
              </div>
              <div className="language-tags">
                {job.requiredLanguages.map(lang => (
                  <span key={lang} className="tag">{lang}</span>
                ))}
              </div>
            </div>
          )}

          <div className="detail-section">
            <h3>{isEn ? 'Job description' : 'Description du poste'}</h3>
            <p className="description-text">{job.jobDescription}</p>
          </div>

          <div className="detail-section">
            <h3>{isEn ? 'Candidate profile' : 'Profil recherché'}</h3>
            <p className="description-text">{job.profileDescription}</p>
          </div>

          <div className="detail-meta">
            <small>
              {isEn ? 'Created on' : 'Créé le'} {new Date(job.createdAt).toLocaleDateString(isEn ? 'en-US' : 'fr-FR')}
              {job.publishedAt && ` • ${isEn ? 'Published on' : 'Publié le'} ${new Date(job.publishedAt).toLocaleDateString(isEn ? 'en-US' : 'fr-FR')}`}
            </small>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>{isEn ? 'Close' : 'Fermer'}</button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;
