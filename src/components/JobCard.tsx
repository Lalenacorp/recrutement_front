import { Clock, DollarSign, Building2, Briefcase, GraduationCap } from 'lucide-react';
import type { JobDetails, JobContractType, ExperienceLevel, EducationLevel } from '../types';
import { useNavigate } from 'react-router-dom';

interface JobCardProps {
  job: JobDetails;
}

const JobCard = ({ job }: JobCardProps) => {
  const navigate = useNavigate();

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
      case 'ENTRY': return 'Débutant';
      case 'MID': return 'Intermédiaire';
      case 'SENIOR': return 'Senior';
      case 'LEAD': return 'Lead';
      default: return level;
    }
  };

  const getEducationLevelLabel = (level: EducationLevel): string => {
    switch (level) {
      case 'NONE': return 'Aucun diplôme';
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

  return (
    <div className="job-card" onClick={() => navigate(`/jobs/${job.id}`)}>
      <div className="job-card-header">
        <div className="job-logo">
          <Building2 size={32} />
        </div>
        <div className="job-info">
          <h3>{job.title}</h3>
          <p className="company">{job.companyName}</p>
        </div>
      </div>
      
      <div className="job-card-details">
        <div className="detail">
          <Clock size={16} />
          <span>{getContractTypeLabel(job.contractType)}</span>
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
          <DollarSign size={16} />
          <span>{formatSalary(job.salaryAmount, job.salaryCurrency)}</span>
        </div>
      </div>
      
      <div className="job-meta">
        <span className="positions-count">{job.positionsCount} poste{job.positionsCount > 1 ? 's' : ''}</span>
        <span className="published-date">
          {job.publishedAt && `Publié le ${new Date(job.publishedAt).toLocaleDateString('fr-FR')}`}
        </span>
      </div>
      
      <button className="btn btn-primary">Voir les détails</button>
    </div>
  );
};

export default JobCard;
