import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Briefcase, CheckCircle, Clock, X, Lock } from 'lucide-react';
import type { ApplicationResponse, ApplicationStatus } from '../types';
import { applicationApi } from '../api/applicationApi';
import ChangePasswordForm from '../components/ChangePasswordForm';

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await applicationApi.getMyCandidateApplications();
      setApplications(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des candidatures');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'SUBMITTED':
        return <Clock size={20} className="status-icon pending" />;
      case 'REVIEWED':
        return <FileText size={20} className="status-icon reviewed" />;
      case 'ACCEPTED':
        return <CheckCircle size={20} className="status-icon accepted" />;
      case 'REJECTED':
        return <X size={20} className="status-icon rejected" />;
      case 'WITHDRAWN':
        return <X size={20} className="status-icon withdrawn" />;
    }
  };

  const getStatusText = (status: ApplicationStatus) => {
    switch (status) {
      case 'SUBMITTED':
        return 'En attente';
      case 'REVIEWED':
        return 'Examinée';
      case 'ACCEPTED':
        return 'Acceptée';
      case 'REJECTED':
        return 'Refusée';
      case 'WITHDRAWN':
        return 'Retirée';
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="container">
          <h1>Mon espace candidat</h1>
          <p>Bienvenue, {user?.name}</p>
        </div>
      </div>
      
      <div className="container">
        <div className="dashboard-content">
          {loading ? (
            <div className="loading-message">
              <div className="spinner"></div>
              <p>Chargement de vos candidatures...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button className="btn btn-primary" onClick={loadApplications}>
                Réessayer
              </button>
            </div>
          ) : (
            <>
              <div className="dashboard-stats">
                <div className="stat-card">
                  <Briefcase size={32} />
                  <div>
                    <h3>{applications.length}</h3>
                    <p>Candidatures</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <Clock size={32} />
                  <div>
                    <h3>{applications.filter(a => a.status === 'SUBMITTED').length}</h3>
                    <p>En attente</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <CheckCircle size={32} />
                  <div>
                    <h3>{applications.filter(a => a.status === 'ACCEPTED').length}</h3>
                    <p>Acceptées</p>
                  </div>
                </div>
              </div>
              
              <div className="dashboard-section">
                <h2>Mes candidatures</h2>
                
                {applications.length === 0 ? (
                  <div className="empty-state">
                    <Briefcase size={48} />
                    <p>Vous n'avez pas encore postulé à des offres</p>
                    <a href="/jobs" className="btn btn-primary">
                      Découvrir les offres
                    </a>
                  </div>
                ) : (
                  <div className="applications-list">
                    {applications.map(app => (
                      <div key={app.applicationId} className="application-card">
                        <div className="application-header">
                          {getStatusIcon(app.status)}
                          <div>
                            <h3>{app.jobTitle}</h3>
                            <p>{app.companyName}</p>
                          </div>
                        </div>
                        
                        <div className="application-meta">
                          <span className={`status-badge ${app.status.toLowerCase()}`}>
                            {getStatusText(app.status)}
                          </span>
                          <span className="application-date">
                            Postulé le {new Date(app.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        
                        {app.cvUrl && (
                          <div className="application-cv">
                            <FileText size={16} />
                            <a href={app.cvUrl} target="_blank" rel="noopener noreferrer">
                              Voir mon CV
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
          
          <div className="dashboard-section">
            <h2>Profil</h2>
            <div className="profile-card">
              <div className="profile-info">
                <h3>{user?.name}</h3>
                <p>{user?.email}</p>
              </div>
              <div className="profile-actions">
                <button className="btn btn-outline">Modifier le profil</button>
                <button 
                  className="btn btn-outline"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                >
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
    </div>
  );
};

export default CandidateDashboard;
