import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  Trophy, 
  Calendar, 
  TrendingUp,
  Building2,
  CheckCircle,
  Clock,
  PlusCircle,
  Lock,
  Eye,
  Archive,
  Send,
  CheckCircle2,
  XCircle,
  GraduationCap
} from 'lucide-react';
import {
  adminApi,
  type PlatformStats,
  type AdminUserSummary,
  type PreInscriptionSummary,
  type PreInscriptionDetail,
  type PreInscriptionStatus,
} from '../api/adminApi';
import { createContest, listContestsAdmin, publishContest, archiveContest } from '../api/contestApi';
import { createEvent, listEventsAdmin, publishEvent, archiveEvent, updateEvent, deleteEvent } from '../api/eventApi';
import type { ContestResponse, EventResponse } from '../types';
import ChangePasswordForm from '../components/ChangePasswordForm';
import ConfirmModal from '../components/ConfirmModal';

type MenuItem = 'dashboard' | 'users' | 'contests' | 'events' | 'preinscriptions';
type ContentType = 'contest' | 'event';

const PRE_INSCRIPTION_FIELD_LABELS: Record<string, string> = {
  dateInscription: "Date d'inscription",
  nom: 'Nom',
  prenom: 'Prénom',
  dateNaissance: 'Date de naissance',
  sexe: 'Sexe',
  lieuNaissance: 'Lieu de naissance',
  adresse: 'Adresse',
  numeroPasseport: 'N° passeport',
  telephone: 'Téléphone',
  email: 'Email',
  telephoneUrgence: 'Tél. urgence',
  situationMatrimoniale: 'Situation matrimoniale',
  dernierDiplome: 'Dernier diplôme obtenu',
  nomPere: 'Nom et prénom du père',
  nomMere: 'Nom et prénom de la mère',
  connuCCA: 'Connaissance de CCA',
  formationSouhaitee: 'Formation souhaitée',
  lyceeNom: 'Lycée — nom',
  lyceeDiplome: 'Lycée — diplôme',
  lyceeSerie: 'Lycée — série',
  lyceePeriode: 'Lycée — période',
  universiteNom: 'Université — nom',
  universiteDiplome: 'Université — diplôme',
  universiteFiliere: 'Université — filière',
  universitePeriode: 'Université — période',
  admissionCanada: 'Admission Canada (antécédent)',
  admissionCanadaEtablissement: 'Admission — établissement',
  admissionCanadaAnnee: 'Admission — année',
  formationChoisie: 'Formation choisie (précision)',
  aideAdmission: 'Aide pour admission',
  dejaVisaCanada: 'Déjà déposé un visa Canada',
  visaCanadaAnnee: 'Visa — année',
  visaRefusRaison: 'Visa — raison du refus',
};

function formatPreInscriptionFieldValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<MenuItem>('dashboard');
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showContentForm, setShowContentForm] = useState(false);
  const [contentType, setContentType] = useState<ContentType>('contest');
  
  // États pour la gestion des utilisateurs
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState<'all' | 'employee' | 'employer'>('all');
  const [userSearch, setUserSearch] = useState('');

  // États pour la gestion des concours
  const [contests, setContests] = useState<ContestResponse[]>([]);
  const [loadingContests, setLoadingContests] = useState(false);
  const [contestError, setContestError] = useState<string | null>(null);
  
  // États pour la gestion des événements
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);

  const [preInscriptions, setPreInscriptions] = useState<PreInscriptionSummary[]>([]);
  const [loadingPreInscriptions, setLoadingPreInscriptions] = useState(false);
  const [preInscriptionError, setPreInscriptionError] = useState<string | null>(null);
  const [preInscriptionFilter, setPreInscriptionFilter] = useState<'all' | PreInscriptionStatus>('all');
  const [preInscriptionDetail, setPreInscriptionDetail] = useState<PreInscriptionDetail | null>(null);
  const [preInscriptionDetailOpen, setPreInscriptionDetailOpen] = useState(false);
  const [loadingPreInscriptionDetail, setLoadingPreInscriptionDetail] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    registrationUrl: '',
    coverImageUrl: '',
    startDate: '',
    endDate: '',
    locationName: '',
    city: '',
    countryCode: '',
    online: false,
    onlineUrl: '',
    capacity: '',
    registrationRequired: false,
  });

  type ConfirmState = {
    open: boolean;
    title?: string;
    message: string;
    onConfirm?: () => void | Promise<void>;
    loading?: boolean;
  };

  const [confirmState, setConfirmState] = useState<ConfirmState>({ open: false, message: '' });

  const openConfirm = (message: string, onConfirm?: () => void | Promise<void>, title?: string) => {
    setConfirmState({ open: true, message, onConfirm, title });
  };

  const performConfirm = async () => {
    if (!confirmState.onConfirm) {
      setConfirmState({ open: false, message: '' });
      return;
    }
    try {
      setConfirmState((s) => ({ ...s, loading: true }));
      await confirmState.onConfirm();
    } catch (err) {
      console.error('Erreur lors de l action confirmée:', err);
    } finally {
      setConfirmState({ open: false, message: '' });
    }
  };

  // Charger les stats au montage du composant
  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (activeMenu === 'contests') {
      loadContests();
    } else if (activeMenu === 'events') {
      loadEvents();
    } else if (activeMenu === 'users') {
      loadUsers(userFilter);
    } else if (activeMenu === 'preinscriptions') {
      loadPreInscriptions();
    }
  }, [activeMenu, userFilter]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getPlatformStats();
      setStats(data);
    } catch (err: any) {
      // Si erreur 401, rediriger vers login
      if (err.statusCode === 401) {
        navigate('/login');
        return;
      }
      setError(err.message || 'Erreur lors du chargement des statistiques');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadContests = async () => {
    try {
      setLoadingContests(true);
      setContestError(null);
      const data = await listContestsAdmin();
      setContests(data);
    } catch (err: any) {
      setContestError(err.message || 'Erreur lors du chargement des concours');
      console.error('Erreur:', err);
    } finally {
      setLoadingContests(false);
    }
  };

  const loadUsers = async (filter: 'all' | 'employee' | 'employer') => {
    try {
      setLoadingUsers(true);
      setUsersError(null);
      const data = await adminApi.getUsers(filter);
      setUsers(data);
    } catch (err: any) {
      setUsersError(err.message || 'Erreur lors du chargement des utilisateurs');
      console.error('Erreur lors du chargement des utilisateurs:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (contentType === 'contest') {
      try {
        setLoadingContests(true);
        await createContest({
          title: formData.title,
          description: formData.description,
          registrationUrl: formData.registrationUrl || undefined,
          coverImageUrl: formData.coverImageUrl || undefined,
        });
        
        // Recharger la liste des concours
        await loadContests();
        
        // Fermer le formulaire et réinitialiser
        setShowContentForm(false);
        resetFormData();
      } catch (err: any) {
        alert('Erreur: ' + (err.message || 'Impossible de créer le concours'));
      } finally {
        setLoadingContests(false);
      }
    } else if (contentType === 'event') {
      try {
        setLoadingEvents(true);
        
        // Convertir les dates en ISO 8601
        const startAtISO = formData.startDate ? new Date(formData.startDate).toISOString() : '';
        const endAtISO = formData.endDate ? new Date(formData.endDate).toISOString() : undefined;

        const payload = {
          title: formData.title,
          description: formData.description,
          startAt: startAtISO,
          endAt: endAtISO,
          locationName: formData.locationName || undefined,
          city: formData.city || undefined,
          countryCode: formData.countryCode || undefined,
          online: formData.online,
          onlineUrl: formData.onlineUrl || undefined,
          capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
          registrationRequired: formData.registrationRequired,
          coverImageUrl: formData.coverImageUrl || undefined,
        };

        if (editingEventId) {
          await updateEvent(editingEventId, payload);
        } else {
          await createEvent(payload);
        }
        
        // Recharger la liste des événements
        await loadEvents();
        
        // Fermer le formulaire et réinitialiser
        setShowContentForm(false);
        setEditingEventId(null);
        resetFormData();
      } catch (err: any) {
        alert(
          'Erreur: ' +
          (err.message ||
            (editingEventId ? 'Impossible de mettre à jour l\'événement' : 'Impossible de créer l\'événement'))
        );
      } finally {
        setLoadingEvents(false);
      }
    }
  };

  const resetFormData = () => {
    setFormData({
      title: '',
      description: '',
      registrationUrl: '',
      coverImageUrl: '',
      startDate: '',
      endDate: '',
      locationName: '',
      city: '',
      countryCode: '',
      online: false,
      onlineUrl: '',
      capacity: '',
      registrationRequired: false,
    });
  };

  const openEventEdit = (ev: EventResponse) => {
    setContentType('event');
    setActiveMenu('events');
    setShowContentForm(true);
    setEditingEventId(ev.id as number);
    setFormData({
      title: ev.title,
      description: ev.description,
      registrationUrl: '',
      coverImageUrl: ev.coverImageUrl || '',
      startDate: ev.startAt ? new Date(ev.startAt).toISOString().slice(0, 16) : '',
      endDate: ev.endAt ? new Date(ev.endAt).toISOString().slice(0, 16) : '',
      locationName: ev.locationName || '',
      city: ev.city || '',
      countryCode: ev.countryCode || '',
      online: ev.online,
      onlineUrl: ev.onlineUrl || '',
      capacity: ev.capacity ? String(ev.capacity) : '',
      registrationRequired: ev.registrationRequired,
    });
  };

  const handleDeleteEvent = (eventId: number) => {
    openConfirm(
      'Êtes-vous sûr de vouloir supprimer définitivement cet événement ? Cette action est irréversible.',
      async () => {
        try {
          setLoadingEvents(true);
          await deleteEvent(eventId);
          await loadEvents();
        } catch (err: any) {
          alert('Erreur: ' + (err.message || 'Impossible de supprimer l\'événement'));
        } finally {
          setLoadingEvents(false);
        }
      },
      'Supprimer l\'événement'
    );
  };

  const handlePublishContest = async (contestId: number) => {
    openConfirm('Êtes-vous sûr de vouloir publier ce concours ?', async () => {
      try {
        setLoadingContests(true);
        await publishContest(contestId);
        await loadContests();
      } catch (err: any) {
        alert('Erreur: ' + (err.message || 'Impossible de publier le concours'));
      } finally {
        setLoadingContests(false);
      }
    }, 'Publier le concours');
  };

  const handleArchiveContest = async (contestId: number) => {
    openConfirm('Êtes-vous sûr de vouloir archiver ce concours ?', async () => {
      try {
        setLoadingContests(true);
        await archiveContest(contestId);
        await loadContests();
      } catch (err: any) {
        alert('Erreur: ' + (err.message || 'Impossible d\'archiver le concours'));
      } finally {
        setLoadingContests(false);
      }
    }, 'Archiver le concours');
  };

  const loadEvents = async () => {
    try {
      setLoadingEvents(true);
      setEventError(null);
      const data = await listEventsAdmin();
      setEvents(data);
    } catch (err: any) {
      setEventError(err.message || 'Erreur lors du chargement des événements');
      console.error('Erreur:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const loadPreInscriptions = async () => {
    try {
      setLoadingPreInscriptions(true);
      setPreInscriptionError(null);
      const data = await adminApi.listPreInscriptions();
      setPreInscriptions(data);
    } catch (err: any) {
      setPreInscriptionError(err.message || 'Erreur lors du chargement des pré-inscriptions');
      console.error(err);
    } finally {
      setLoadingPreInscriptions(false);
    }
  };

  const openPreInscriptionDetail = async (id: number) => {
    setPreInscriptionDetailOpen(true);
    setPreInscriptionDetail(null);
    setLoadingPreInscriptionDetail(true);
    try {
      const detail = await adminApi.getPreInscription(id);
      setPreInscriptionDetail(detail);
    } catch (err: any) {
      alert(err.message || 'Impossible de charger la fiche');
      setPreInscriptionDetailOpen(false);
    } finally {
      setLoadingPreInscriptionDetail(false);
    }
  };

  const closePreInscriptionDetail = () => {
    setPreInscriptionDetailOpen(false);
    setPreInscriptionDetail(null);
  };

  const handlePreInscriptionStatusChange = async (id: number, status: PreInscriptionStatus) => {
    try {
      const updated = await adminApi.updatePreInscriptionStatus(id, status);
      setPreInscriptions((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
      setPreInscriptionDetail((d) =>
        d && d.id === id ? { ...d, status, updatedAt: updated.updatedAt } : d
      );
    } catch (err: any) {
      alert(err.message || 'Mise à jour impossible');
    }
  };

  const preInscriptionStatusLabel = (s: PreInscriptionStatus) => {
    if (s === 'PENDING') return 'En attente';
    if (s === 'CONTACTED') return 'Contacté';
    return 'Archivé';
  };

  const handlePublishEvent = async (eventId: number) => {
    openConfirm('Êtes-vous sûr de vouloir publier cet événement ?', async () => {
      try {
        setLoadingEvents(true);
        await publishEvent(eventId);
        await loadEvents();
      } catch (err: any) {
        alert('Erreur: ' + (err.message || 'Impossible de publier l\'événement'));
      } finally {
        setLoadingEvents(false);
      }
    }, 'Publier l\'événement');
  };

  const handleArchiveEvent = async (eventId: number) => {
    openConfirm('Êtes-vous sûr de vouloir archiver cet événement ?', async () => {
      try {
        setLoadingEvents(true);
        await archiveEvent(eventId);
        await loadEvents();
      } catch (err: any) {
        alert('Erreur: ' + (err.message || 'Impossible d\'archiver l\'événement'));
      } finally {
        setLoadingEvents(false);
      }
    }, 'Archiver l\'événement');
  };

  const renderDashboard = () => {
    if (loading) {
      return (
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Chargement des statistiques...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-message">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadStats}>
            Réessayer
          </button>
        </div>
      );
    }

    if (!stats) return null;

    return (
      <div className="admin-dashboard-content">
        <div className="dashboard-header-section">
          <h1>Tableau de bord</h1>
          <p className="text-muted">Vue d'ensemble de la plateforme</p>
        </div>

        {/* Statistiques principales */}
        <div className="stats-grid">
          <div className="stat-card-modern">
            <div className="stat-icon users">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Utilisateurs totaux</p>
              <h2 className="stat-value">{stats.totalUsers}</h2>
              <p className="stat-detail">
                {stats.totalCandidates} candidats • {stats.totalEmployers} employeurs
              </p>
            </div>
          </div>

          <div className="stat-card-modern">
            <div className="stat-icon jobs">
              <Briefcase size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Offres d'emploi</p>
              <h2 className="stat-value">{stats.totalJobOffers}</h2>
              <p className="stat-detail">{stats.publishedJobs} publiées</p>
            </div>
          </div>

          <div className="stat-card-modern">
            <div className="stat-icon applications">
              <FileText size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Candidatures</p>
              <h2 className="stat-value">{stats.totalApplications}</h2>
              <p className="stat-detail">{stats.activeApplications} actives</p>
            </div>
          </div>

          <div className="stat-card-modern">
            <div className="stat-icon success">
              <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Taux de réussite</p>
              <h2 className="stat-value">
                {stats.totalApplications > 0 
                  ? Math.round((stats.acceptedApplications / stats.totalApplications) * 100) 
                  : 0}%
              </h2>
              <p className="stat-detail">{stats.acceptedApplications} acceptées</p>
            </div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Répartition des utilisateurs</h3>
            <div className="bar-chart">
              <div className="bar-item">
                <div className="bar-label">Candidats</div>
                <div className="bar-container">
                  <div 
                    className="bar bar-primary" 
                    style={{ width: `${(stats.totalCandidates / stats.totalUsers) * 100}%` }}
                  >
                    <span className="bar-value">{stats.totalCandidates}</span>
                  </div>
                </div>
              </div>
              <div className="bar-item">
                <div className="bar-label">Employeurs</div>
                <div className="bar-container">
                  <div 
                    className="bar bar-secondary" 
                    style={{ width: `${(stats.totalEmployers / stats.totalUsers) * 100}%` }}
                  >
                    <span className="bar-value">{stats.totalEmployers}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="chart-card">
            <h3>État des candidatures</h3>
            <div className="bar-chart">
              <div className="bar-item">
                <div className="bar-label">Actives</div>
                <div className="bar-container">
                  <div 
                    className="bar bar-warning" 
                    style={{ width: `${stats.totalApplications > 0 ? (stats.activeApplications / stats.totalApplications) * 100 : 0}%` }}
                  >
                    <span className="bar-value">{stats.activeApplications}</span>
                  </div>
                </div>
              </div>
              <div className="bar-item">
                <div className="bar-label">Acceptées</div>
                <div className="bar-container">
                  <div 
                    className="bar bar-success" 
                    style={{ width: `${stats.totalApplications > 0 ? (stats.acceptedApplications / stats.totalApplications) * 100 : 0}%` }}
                  >
                    <span className="bar-value">{stats.acceptedApplications}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activité récente */}
        <div className="activity-card">
          <h3>Activité de la plateforme</h3>
          <div className="activity-grid">
            <div className="activity-item">
              <div className="activity-icon">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="activity-title">Croissance mensuelle</p>
                <p className="activity-value">+{Math.round((stats.totalUsers / 12))} nouveaux utilisateurs/mois</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <Building2 size={20} />
              </div>
              <div>
                <p className="activity-title">Entreprises actives</p>
                <p className="activity-value">{stats.totalEmployers} employeurs</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <Clock size={20} />
              </div>
              <div>
                <p className="activity-title">En attente de traitement</p>
                <p className="activity-value">{stats.activeApplications} candidatures</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderForm = () => (
    <div className="admin-form">
      <h3>
        {contentType === 'contest' && 'Nouveau concours'}
        {contentType === 'event' && 'Nouvel événement'}
      </h3>
      
      <form onSubmit={handleContentSubmit}>
        <div className="form-group">
          <label>Titre *</label>
          <input
            type="text"
            className="form-control"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description *</label>
          <textarea
            className="form-control"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>
        
        {contentType === 'contest' && (
          <>
            <div className="form-group">
              <label>URL d'inscription</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://example.com/register"
                value={formData.registrationUrl}
                onChange={(e) => setFormData({...formData, registrationUrl: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>URL de l'image de couverture</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://example.com/image.jpg"
                value={formData.coverImageUrl}
                onChange={(e) => setFormData({...formData, coverImageUrl: e.target.value})}
              />
            </div>
          </>
        )}
        
        {contentType === 'event' && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Date de début *</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Date de fin</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>
            
            <div className="form-group">
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.online}
                    onChange={(e) => setFormData({...formData, online: e.target.checked})}
                  />
                  <span>Événement en ligne</span>
                </label>
              </div>
            </div>
            
            {formData.online && (
              <div className="form-group">
                <label>URL de l'événement en ligne</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://meet.google.com/..."
                  value={formData.onlineUrl}
                  onChange={(e) => setFormData({...formData, onlineUrl: e.target.value})}
                />
              </div>
            )}
            
            {!formData.online && (
              <>
                <div className="form-group">
                  <label>Nom du lieu</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Centre de conférences..."
                    value={formData.locationName}
                    onChange={(e) => setFormData({...formData, locationName: e.target.value})}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Ville</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Dakar"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Code pays (ISO-2)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="SN"
                      maxLength={2}
                      value={formData.countryCode}
                      onChange={(e) => setFormData({...formData, countryCode: e.target.value.toUpperCase()})}
                    />
                  </div>
                </div>
              </>
            )}
            
            <div className="form-row">
              <div className="form-group">
                <label>Capacité (nombre de participants)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="100"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <div className="checkbox-group" style={{ marginTop: '1.8rem' }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.registrationRequired}
                      onChange={(e) => setFormData({...formData, registrationRequired: e.target.checked})}
                    />
                    <span>Inscription requise</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label>URL de l'image de couverture</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://example.com/event.jpg"
                value={formData.coverImageUrl}
                onChange={(e) => setFormData({...formData, coverImageUrl: e.target.value})}
              />
            </div>
          </>
        )}
        
        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={() => setShowContentForm(false)}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary" disabled={loadingContests}>
            {loadingContests ? 'Création...' : 'Créer (brouillon)'}
          </button>
        </div>
      </form>
    </div>
  );

  // Vérification de l'authentification avant le rendu
  const token = localStorage.getItem('token');
  if (!user || user.role !== 'admin' || !token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <p>{user?.name}</p>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveMenu('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Tableau de bord</span>
          </button>

          <button 
            className={`nav-item ${activeMenu === 'users' ? 'active' : ''}`}
            onClick={() => setActiveMenu('users')}
          >
            <Users size={20} />
            <span>Utilisateurs</span>
          </button>

          <div className="nav-divider"></div>

          <button 
            className={`nav-item ${activeMenu === 'contests' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('contests'); setContentType('contest'); }}
          >
            <Trophy size={20} />
            <span>Concours</span>
          </button>

          <button 
            className={`nav-item ${activeMenu === 'events' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('events'); setContentType('event'); }}
          >
            <Calendar size={20} />
            <span>Événements</span>
          </button>

          <button
            className={`nav-item ${activeMenu === 'preinscriptions' ? 'active' : ''}`}
            onClick={() => setActiveMenu('preinscriptions')}
          >
            <GraduationCap size={20} />
            <span>Pré-inscriptions Canada</span>
          </button>

        </nav>

        <div className="sidebar-footer">
          <button 
            className="sidebar-action-btn"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            <Lock size={18} />
            <span>Paramètres</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {activeMenu === 'dashboard' && renderDashboard()}
        
        {(activeMenu === 'contests' || activeMenu === 'events') && (
          <div className="admin-dashboard-content">
            <div className="dashboard-header-section">
              <div>
                <h1>
                  {activeMenu === 'contests' && 'Gestion des concours'}
                  {activeMenu === 'events' && 'Gestion des événements'}
                </h1>
                <p className="text-muted">Créer et gérer le contenu de la plateforme</p>
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setEditingEventId(null);
                  resetFormData();
                  setShowContentForm(!showContentForm);
                }}
              >
                <PlusCircle size={18} />
                {activeMenu === 'events' ? 'Nouvel événement' : 'Ajouter'}
              </button>
            </div>

            {showContentForm && renderForm()}

            {/* Liste des concours */}
            {activeMenu === 'contests' && (
              <div className="content-list">
                {loadingContests && (
                  <div className="loading-message">
                    <div className="spinner"></div>
                    <p>Chargement des concours...</p>
                  </div>
                )}

                {contestError && (
                  <div className="error-message">
                    <p>{contestError}</p>
                    <button className="btn btn-primary" onClick={loadContests}>
                      Réessayer
                    </button>
                  </div>
                )}

                {!loadingContests && !contestError && contests.length === 0 && (
                  <div className="empty-state">
                    <Trophy size={48} />
                    <p>Aucun concours pour le moment</p>
                    <button className="btn btn-primary" onClick={() => setShowContentForm(true)}>
                      Créer le premier concours
                    </button>
                  </div>
                )}

                {!loadingContests && !contestError && contests.length > 0 && (
                  <>
                    {contests.map((contest) => (
                      <div key={contest.id} className="content-item-card">
                        <div className="contest-main-info">
                          {contest.coverImageUrl && (
                            <img 
                              src={contest.coverImageUrl} 
                              alt={contest.title} 
                              className="contest-cover-thumbnail"
                            />
                          )}
                          <div>
                            <div className="contest-header-row">
                              <h3>{contest.title}</h3>
                              <span className={`status-badge status-${contest.status.toLowerCase()}`}>
                                {contest.status === 'DRAFT' && 'Brouillon'}
                                {contest.status === 'PUBLISHED' && 'Publié'}
                                {contest.status === 'ARCHIVED' && 'Archivé'}
                              </span>
                            </div>
                            <p className="text-muted contest-description">{contest.description}</p>
                            <p className="text-muted contest-meta">
                              Créé le {new Date(contest.createdAt).toLocaleDateString('fr-FR')}
                              {contest.registrationUrl && (
                                <> • <a href={contest.registrationUrl} target="_blank" rel="noopener noreferrer" className="contest-link">
                                  Lien d'inscription
                                </a></>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="content-item-actions">
                          {contest.status === 'DRAFT' && (
                            <button 
                              className="btn btn-sm btn-success"
                              onClick={() => handlePublishContest(contest.id)}
                              title="Publier le concours"
                            >
                              <Send size={16} />
                              Publier
                            </button>
                          )}
                          {contest.status === 'PUBLISHED' && (
                            <button 
                              className="btn btn-sm btn-outline"
                              onClick={() => handleArchiveContest(contest.id)}
                              title="Archiver le concours"
                            >
                              <Archive size={16} />
                              Archiver
                            </button>
                          )}
                          {contest.status === 'ARCHIVED' && (
                            <button 
                              className="btn btn-sm btn-outline"
                              disabled
                            >
                              <Eye size={16} />
                              Archivé
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Events management */}
            {activeMenu === 'events' && (
              <div className="content-list">
                {loadingEvents && (
                  <div className="loading-message">
                    <div className="spinner"></div>
                    <p>Chargement des événements...</p>
                  </div>
                )}

                {eventError && (
                  <div className="error-message">
                    <p>{eventError}</p>
                    <button className="btn btn-primary" onClick={loadEvents}>
                      Réessayer
                    </button>
                  </div>
                )}

                {!loadingEvents && !eventError && events.length === 0 && (
                  <div className="empty-state">
                    <Calendar size={48} />
                    <p>Aucun événement pour le moment</p>
                    <button className="btn btn-primary" onClick={() => setShowContentForm(true)}>
                      Créer le premier événement
                    </button>
                  </div>
                )}

                {!loadingEvents && !eventError && events.length > 0 && (
                  <>
                    {events.map((ev) => (
                      <div key={ev.id} className="content-item-card">
                        <div className="contest-main-info">
                          {ev.coverImageUrl && (
                            <img src={ev.coverImageUrl} alt={ev.title} className="contest-cover-thumbnail" />
                          )}
                          <div>
                            <div className="contest-header-row">
                              <h3>{ev.title}</h3>
                              <span className={`status-badge status-${ev.status.toLowerCase()}`}>
                                {ev.status === 'DRAFT' && 'Brouillon'}
                                {ev.status === 'PUBLISHED' && 'Publié'}
                                {ev.status === 'ARCHIVED' && 'Archivé'}
                              </span>
                            </div>
                            <p className="text-muted contest-description">{ev.description}</p>
                            <p className="text-muted contest-meta">
                              {ev.online ? (
                                'En ligne' + (ev.onlineUrl ? ` • ${ev.onlineUrl}` : '')
                              ) : (
                                `${ev.locationName ? ev.locationName + ' • ' : ''}${ev.city || ''}`
                              )}
                              {ev.startAt && (
                                <> • {new Date(ev.startAt).toLocaleString('fr-FR')}</>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="content-item-actions">
                          {ev.status === 'DRAFT' && (
                            <button className="btn btn-sm btn-success" onClick={() => handlePublishEvent(ev.id as number)}>
                              <Send size={16} />
                              Publier
                            </button>
                          )}
                          {ev.status === 'PUBLISHED' && (
                            <button className="btn btn-sm btn-outline" onClick={() => handleArchiveEvent(ev.id as number)}>
                              <Archive size={16} />
                              Archiver
                            </button>
                          )}
                          {ev.status === 'ARCHIVED' && (
                            <button className="btn btn-sm btn-outline" disabled>
                              <Eye size={16} />
                              Archivé
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => openEventEdit(ev)}
                          >
                            Modifier
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteEvent(ev.id as number)}
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

          </div>
        )}

        {activeMenu === 'preinscriptions' && (
          <div className="admin-dashboard-content">
            <div className="dashboard-header-section">
              <div>
                <h1>Pré-inscriptions — études Canada (CCA)</h1>
                <p className="text-muted">
                  Fiches envoyées depuis la page publique ; mettez à jour le statut après contact ou
                  clôture du dossier.
                </p>
              </div>
              <button type="button" className="btn btn-outline" onClick={() => loadPreInscriptions()}>
                Actualiser
              </button>
            </div>

            <div className="users-filters">
              <div className="users-filter-tabs">
                <button
                  type="button"
                  className={`btn btn-sm ${preInscriptionFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setPreInscriptionFilter('all')}
                >
                  Tous
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${preInscriptionFilter === 'PENDING' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setPreInscriptionFilter('PENDING')}
                >
                  En attente
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${preInscriptionFilter === 'CONTACTED' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setPreInscriptionFilter('CONTACTED')}
                >
                  Contactés
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${preInscriptionFilter === 'ARCHIVED' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setPreInscriptionFilter('ARCHIVED')}
                >
                  Archivés
                </button>
              </div>
            </div>

            {loadingPreInscriptions && (
              <div className="loading-message">
                <div className="spinner"></div>
                <p>Chargement des pré-inscriptions…</p>
              </div>
            )}

            {preInscriptionError && !loadingPreInscriptions && (
              <div className="error-message">
                <p>{preInscriptionError}</p>
                <button type="button" className="btn btn-primary" onClick={() => loadPreInscriptions()}>
                  Réessayer
                </button>
              </div>
            )}

            {!loadingPreInscriptions && !preInscriptionError && (
              <>
                {preInscriptions.filter((p) => preInscriptionFilter === 'all' || p.status === preInscriptionFilter)
                  .length === 0 ? (
                  <div className="empty-state">
                    <GraduationCap size={48} />
                    <p>Aucune pré-inscription pour ce filtre</p>
                  </div>
                ) : (
                  <div className="users-table-wrapper">
                    <table className="users-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Nom</th>
                          <th>Email</th>
                          <th>Téléphone</th>
                          <th>Formation</th>
                          <th>Statut</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {preInscriptions
                          .filter((p) => preInscriptionFilter === 'all' || p.status === preInscriptionFilter)
                          .map((p) => (
                            <tr key={p.id}>
                              <td>{new Date(p.createdAt).toLocaleString('fr-FR')}</td>
                              <td>
                                {p.prenom} {p.nom}
                              </td>
                              <td>{p.email}</td>
                              <td>{p.telephone}</td>
                              <td className="preinscription-preview-cell">
                                {p.formationPreview || '—'}
                              </td>
                              <td>
                                <select
                                  className="form-control preinscription-status-select"
                                  value={p.status}
                                  onChange={(e) =>
                                    handlePreInscriptionStatusChange(
                                      p.id,
                                      e.target.value as PreInscriptionStatus
                                    )
                                  }
                                  aria-label={`Statut pour ${p.prenom} ${p.nom}`}
                                >
                                  <option value="PENDING">{preInscriptionStatusLabel('PENDING')}</option>
                                  <option value="CONTACTED">{preInscriptionStatusLabel('CONTACTED')}</option>
                                  <option value="ARCHIVED">{preInscriptionStatusLabel('ARCHIVED')}</option>
                                </select>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline"
                                  onClick={() => openPreInscriptionDetail(p.id)}
                                >
                                  <Eye size={16} />
                                  Fiche
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeMenu === 'users' && (
          <div className="admin-dashboard-content">
            <div className="dashboard-header-section">
              <div>
                <h1>Gestion des utilisateurs</h1>
                <p className="text-muted">Voir et gérer les comptes candidats et employeurs</p>
              </div>
            </div>

            <div className="users-filters">
              <div className="users-filter-tabs">
                <button
                  className={`btn btn-sm ${userFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setUserFilter('all')}
                >
                  Tous
                </button>
                <button
                  className={`btn btn-sm ${userFilter === 'employee' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setUserFilter('employee')}
                >
                  Candidats
                </button>
                <button
                  className={`btn btn-sm ${userFilter === 'employer' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setUserFilter('employer')}
                >
                  Employeurs
                </button>
              </div>
              <div className="users-search">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher par nom, email ou entreprise..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            </div>

            {loadingUsers && (
              <div className="loading-message">
                <div className="spinner"></div>
                <p>Chargement des utilisateurs...</p>
              </div>
            )}

            {usersError && !loadingUsers && (
              <div className="error-message">
                <p>{usersError}</p>
                <button className="btn btn-primary" onClick={() => loadUsers(userFilter)}>
                  Réessayer
                </button>
              </div>
            )}

            {!loadingUsers && !usersError && (
              <>
                {users.length === 0 ? (
                  <div className="empty-state">
                    <Users size={48} />
                    <p>Aucun utilisateur trouvé pour ce filtre</p>
                  </div>
                ) : (
                  <div className="users-table-wrapper">
                    <table className="users-table">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Nom</th>
                          <th>Email</th>
                          <th>Téléphone</th>
                          <th>Entreprise</th>
                          <th>Vérifié</th>
                          <th>Inscription</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users
                          .filter((u) => {
                            if (!userSearch.trim()) return true;
                            const query = userSearch.toLowerCase();
                            const fullName = `${u.firstName ?? ''} ${u.lastName ?? ''}`.toLowerCase();
                            const company = (u.companyName ?? '').toLowerCase();
                            return (
                              u.email.toLowerCase().includes(query) ||
                              fullName.includes(query) ||
                              company.includes(query)
                            );
                          })
                          .map((user) => (
                            <tr key={`${user.type}-${user.id}`}>
                              <td>
                                <span className={`badge badge-${user.type === 'EMPLOYEE' ? 'info' : 'secondary'}`}>
                                  {user.type === 'EMPLOYEE' ? 'Candidat' : 'Employeur'}
                                </span>
                              </td>
                              <td>{`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || '-'}</td>
                              <td>{user.email}</td>
                              <td>{user.phone || '-'}</td>
                              <td>{user.companyName || (user.type === 'EMPLOYEE' ? '—' : '-')}</td>
                              <td>
                                {user.emailVerified ? (
                                  <span className="status-chip status-success">
                                    <CheckCircle2 size={16} />
                                    Vérifié
                                  </span>
                                ) : (
                                  <span className="status-chip status-warning">
                                    <XCircle size={16} />
                                    Non vérifié
                                  </span>
                                )}
                              </td>
                              <td>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {preInscriptionDetailOpen && (
          <div className="modal-overlay" onClick={closePreInscriptionDetail}>
            <div
              className="modal-content admin-preinscription-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>
                  {preInscriptionDetail
                    ? `Fiche #${preInscriptionDetail.id} — ${preInscriptionDetail.prenom} ${preInscriptionDetail.nom}`
                    : 'Chargement…'}
                </h2>
                <button type="button" className="modal-close" onClick={closePreInscriptionDetail}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                {loadingPreInscriptionDetail && (
                  <div className="loading-message">
                    <div className="spinner"></div>
                    <p>Chargement de la fiche…</p>
                  </div>
                )}
                {!loadingPreInscriptionDetail && preInscriptionDetail && (
                  <>
                    <div className="preinscription-modal-meta">
                      <p>
                        <strong>Reçue le</strong>{' '}
                        {new Date(preInscriptionDetail.createdAt).toLocaleString('fr-FR')}
                      </p>
                      <p>
                        <strong>Statut</strong>{' '}
                        <select
                          className="form-control preinscription-status-select"
                          value={preInscriptionDetail.status}
                          onChange={(e) =>
                            handlePreInscriptionStatusChange(
                              preInscriptionDetail.id,
                              e.target.value as PreInscriptionStatus
                            )
                          }
                        >
                          <option value="PENDING">{preInscriptionStatusLabel('PENDING')}</option>
                          <option value="CONTACTED">{preInscriptionStatusLabel('CONTACTED')}</option>
                          <option value="ARCHIVED">{preInscriptionStatusLabel('ARCHIVED')}</option>
                        </select>
                      </p>
                    </div>
                    <dl className="admin-preinscription-detail-dl">
                      {Object.keys(preInscriptionDetail.details || {})
                        .sort()
                        .map((key) => (
                          <div key={key} className="admin-preinscription-detail-row">
                            <dt>{PRE_INSCRIPTION_FIELD_LABELS[key] || key}</dt>
                            <dd>{formatPreInscriptionFieldValue(preInscriptionDetail.details[key])}</dd>
                          </div>
                        ))}
                    </dl>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal mot de passe */}
        {/* Confirmation modal (global pour actions de publication / archivage) */}
        <ConfirmModal
          open={confirmState.open}
          title={confirmState.title}
          message={confirmState.message}
          loading={confirmState.loading}
          confirmLabel="OK"
          cancelLabel="Annuler"
          onConfirm={performConfirm}
          onCancel={() => setConfirmState({ open: false, message: '' })}
        />

        {showPasswordForm && (
          <div className="modal-overlay" onClick={() => setShowPasswordForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Changer le mot de passe</h2>
                <button className="modal-close" onClick={() => setShowPasswordForm(false)}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <ChangePasswordForm />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
