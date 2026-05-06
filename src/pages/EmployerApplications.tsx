import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationApi } from '../api/applicationApi';
import type { ApplicationResponse, ApplicationStatus } from '../types';

const EmployerApplications = () => {
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingApplicationId, setUpdatingApplicationId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getErrorMessage = (err: unknown, fallback: string): string => {
    if (err instanceof Error && err.message) return err.message;
    return fallback;
  };

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await applicationApi.getMyEmployerApplications();
      setApplications(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erreur lors du chargement des candidatures'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const getApplicationStatusLabel = (status: ApplicationStatus) => {
    switch (status) {
      case 'SUBMITTED':
        return 'Nouvelle';
      case 'REVIEWED':
        return 'Examinée';
      case 'INTERVIEW':
        return 'Entretien';
      case 'ACCEPTED':
        return 'Acceptée';
      case 'HIRED':
        return 'Embauchée';
      case 'REJECTED':
        return 'Refusée';
      case 'WITHDRAWN':
        return 'Retirée';
      default:
        return status;
    }
  };

  const getStatusClassName = (status: ApplicationStatus) => {
    switch (status) {
      case 'REVIEWED':
        return 'status-badge reviewed';
      case 'INTERVIEW':
        return 'status-badge interview';
      case 'ACCEPTED':
      case 'HIRED':
        return 'status-badge hired';
      case 'REJECTED':
        return 'status-badge rejected';
      case 'WITHDRAWN':
        return 'status-badge withdrawn';
      default:
        return 'status-badge submitted';
    }
  };

  const handleUpdateApplicationStatus = async (application: ApplicationResponse, status: ApplicationStatus) => {
    if (application.status === status) {
      return;
    }

    setError(null);
    setSuccess(null);
    setUpdatingApplicationId(application.applicationId);
    try {
      const updated = await applicationApi.updateEmployerApplicationStatus(application.applicationId, status);
      setApplications((prev) =>
        prev.map((item) => (item.applicationId === updated.applicationId ? { ...item, ...updated } : item))
      );
      setSuccess(`Statut mis à jour: ${getApplicationStatusLabel(status)}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Impossible de modifier le statut de la candidature'));
    } finally {
      setUpdatingApplicationId(null);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="container">
          <h1>Gestion des candidatures</h1>
          <p>Suivez et mettez à jour les candidatures de vos offres.</p>
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

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Candidatures reçues</h2>
              <Link className="btn btn-outline" to="/employer/dashboard">
                Retour au dashboard
              </Link>
            </div>

            {loading ? (
              <p className="empty-state">Chargement des candidatures...</p>
            ) : applications.length === 0 ? (
              <p className="empty-state">Aucune candidature reçue pour le moment.</p>
            ) : (
              <div className="dashboard-table-wrapper">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Nom du candidat</th>
                      <th>Lien vers le CV</th>
                      <th>Compétences</th>
                      <th>Statut de la candidature</th>
                      <th>Date de candidature</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((application) => {
                      const candidateName =
                        [application.candidateFirstName, application.candidateLastName].filter(Boolean).join(' ') ||
                        application.candidateEmail ||
                        'Candidat';

                      return (
                        <tr key={application.applicationId}>
                          <td>{candidateName}</td>
                          <td>
                            {application.cvUrl ? (
                              <a href={application.cvUrl} target="_blank" rel="noreferrer">
                                Voir le CV
                              </a>
                            ) : (
                              'Non disponible'
                            )}
                          </td>
                          <td>{application.candidateSkills || 'Non renseignées'}</td>
                          <td>
                            <span className={getStatusClassName(application.status)}>
                              {getApplicationStatusLabel(application.status)}
                            </span>
                          </td>
                          <td>{new Date(application.createdAt).toLocaleDateString('fr-FR')}</td>
                          <td>
                            <div className="application-status-actions">
                              <button
                                className="btn btn-sm btn-outline"
                                onClick={() => handleUpdateApplicationStatus(application, 'REVIEWED')}
                                disabled={updatingApplicationId === application.applicationId}
                              >
                                Examiné
                              </button>
                              <button
                                className="btn btn-sm btn-outline"
                                onClick={() => handleUpdateApplicationStatus(application, 'INTERVIEW')}
                                disabled={updatingApplicationId === application.applicationId}
                              >
                                Entretien
                              </button>
                              <button
                                className="btn btn-sm btn-outline"
                                onClick={() => handleUpdateApplicationStatus(application, 'REJECTED')}
                                disabled={updatingApplicationId === application.applicationId}
                              >
                                Rejeté
                              </button>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleUpdateApplicationStatus(application, 'HIRED')}
                                disabled={updatingApplicationId === application.applicationId}
                              >
                                Embauché
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerApplications;
