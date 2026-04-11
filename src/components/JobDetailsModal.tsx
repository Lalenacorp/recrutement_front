import React from 'react';
import { X, Briefcase, GraduationCap, Globe, Coins, FileText, Users } from 'lucide-react';
import type { JobDetails, EducationLevel, ExperienceLevel, JobContractType } from '../types';

interface JobDetailsModalProps {
  job: JobDetails;
  onClose: () => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, onClose }) => {
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

  const getExperienceLevelLabel = (level: ExperienceLevel): string => {
    switch (level) {
      case 'ENTRY': return 'Débutant (0-2 ans)';
      case 'MID': return 'Intermédiaire (2-5 ans)';
      case 'SENIOR': return 'Senior (5-10 ans)';
      case 'LEAD': return 'Lead (10+ ans)';
      default: return level;
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

  const formatSalary = (amount: number, currency: string): string => {
    return `${amount.toLocaleString('fr-FR')} ${currency}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content job-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{job.title}</h2>
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
                <h4>Entreprise</h4>
                <p>{job.companyName}</p>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <Users size={20} />
              </div>
              <div>
                <h4>Nombre de postes</h4>
                <p>{job.positionsCount} poste{job.positionsCount > 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <FileText size={20} />
              </div>
              <div>
                <h4>Type de contrat</h4>
                <p>{getContractTypeLabel(job.contractType)}</p>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <Coins size={20} aria-hidden />
              </div>
              <div>
                <h4>Salaire</h4>
                <p>{formatSalary(job.salaryAmount, job.salaryCurrency)}</p>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <Briefcase size={20} />
              </div>
              <div>
                <h4>Expérience requise</h4>
                <p>{getExperienceLevelLabel(job.experienceLevel)}</p>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <GraduationCap size={20} />
              </div>
              <div>
                <h4>Niveau d'études</h4>
                <p>{getEducationLevelLabel(job.educationLevel)}</p>
              </div>
            </div>
          </div>

          {job.requiredLanguages && job.requiredLanguages.length > 0 && (
            <div className="detail-section">
              <div className="section-header">
                <Globe size={20} />
                <h3>Langues requises</h3>
              </div>
              <div className="language-tags">
                {job.requiredLanguages.map(lang => (
                  <span key={lang} className="tag">{lang}</span>
                ))}
              </div>
            </div>
          )}

          <div className="detail-section">
            <h3>Description du poste</h3>
            <p className="description-text">{job.jobDescription}</p>
          </div>

          <div className="detail-section">
            <h3>Profil recherché</h3>
            <p className="description-text">{job.profileDescription}</p>
          </div>

          <div className="detail-meta">
            <small>
              Créé le {new Date(job.createdAt).toLocaleDateString('fr-FR')}
              {job.publishedAt && ` • Publié le ${new Date(job.publishedAt).toLocaleDateString('fr-FR')}`}
            </small>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;
