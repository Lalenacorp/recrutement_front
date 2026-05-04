import { useEffect } from 'react';
import { Building2, ExternalLink, MapPin, Users } from 'lucide-react';
import type { PartnerCompany } from '../data/partnerCompanies';

type PartnerCompanyModalProps = {
  company: PartnerCompany | null;
  onClose: () => void;
};

const PartnerCompanyModal = ({ company, onClose }: PartnerCompanyModalProps) => {
  useEffect(() => {
    if (!company) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [company, onClose]);

  if (!company) return null;

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="modal-content partner-company-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="partner-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="partner-modal-title">{company.name}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="partner-modal-hero">
            <div className="partner-modal-icon" aria-hidden>
              <Building2 size={40} />
            </div>
            <div className="partner-modal-meta">
              <p>
                <Building2 size={18} aria-hidden />
                <span>{company.sector}</span>
              </p>
              <p>
                <MapPin size={18} aria-hidden />
                <span>{company.location}</span>
              </p>
              <p>
                <Users size={18} aria-hidden />
                <span>{company.size}</span>
              </p>
            </div>
          </div>
          <p className="partner-modal-description">{company.description}</p>
          {company.website && (
            <a
              className="partner-modal-link"
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              Site web
              <ExternalLink size={16} aria-hidden />
            </a>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerCompanyModal;
