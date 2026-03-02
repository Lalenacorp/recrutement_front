import { useState, useEffect } from 'react';
import { Trophy, Calendar, Sparkles, Target, Award, Users, Gift, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { listPublicContests } from '../api/contestApi';
import type { ContestResponse } from '../types';

const Contests = () => {
  const [contests, setContests] = useState<ContestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming'>('all');

  useEffect(() => {
    loadContests();
  }, []);

  const loadContests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listPublicContests();
      setContests(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des concours');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const getContestStatus = (contest: ContestResponse) => {
    // Utiliser le status du contest directement
    if (contest.status === 'PUBLISHED') return 'active';
    if (contest.status === 'DRAFT') return 'upcoming';
    return 'ended';
  };

  const filteredContests = contests.filter(contest => {
    if (filter === 'all') return true;
    const status = getContestStatus(contest);
    return status === filter;
  });

  const stats = {
    total: contests.length,
    active: contests.filter(c => getContestStatus(c) === 'active').length,
    upcoming: contests.filter(c => getContestStatus(c) === 'upcoming').length,
    participants: contests.length * 127 // Exemple
  };

  if (loading) {
    return (
      <div className="contests-page">
        <div className="contests-header">
          <div className="container">
            <div className="contests-header-content">
              <div className="header-badge">
                <Sparkles size={16} />
                <span>Concours & Défis</span>
              </div>
              <h1>Montrez vos talents</h1>
              <p className="header-subtitle">Participez à nos concours et gagnez des récompenses</p>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Chargement des concours...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contests-page">
        <div className="contests-header">
          <div className="container">
            <div className="contests-header-content">
              <div className="header-badge">
                <Sparkles size={16} />
                <span>Concours & Défis</span>
              </div>
              <h1>Montrez vos talents</h1>
              <p className="header-subtitle">Participez à nos concours et gagnez des récompenses</p>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="error-message">
            <p>{error}</p>
            <button className="btn btn-primary" onClick={loadContests}>
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="contests-page">
      {/* Enhanced Header */}
      <div className="contests-header">
        <div className="container">
          <div className="contests-header-content">
            <div className="header-badge">
              <Sparkles size={16} />
              <span>Concours & Défis</span>
            </div>
            <h1>Montrez vos talents</h1>
            <p className="header-subtitle">
              Participez à {contests.length} concours et gagnez des récompenses exceptionnelles
            </p>

            {/* Filters */}
            <div className="contests-filters">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                <Trophy size={18} />
                Tous les concours
              </button>
              <button 
                className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                onClick={() => setFilter('active')}
              >
                <Target size={18} />
                En cours ({stats.active})
              </button>
              <button 
                className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
                onClick={() => setFilter('upcoming')}
              >
                <Clock size={18} />
                À venir ({stats.upcoming})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="contests-stats-bar">
        <div className="container">
          <div className="stats-bar-content">
            <div className="stat-badge">
              <Trophy size={18} />
              <span><strong>{stats.total}</strong> Concours</span>
            </div>
            <div className="stat-badge">
              <Target size={18} />
              <span><strong>{stats.active}</strong> En cours</span>
            </div>
            <div className="stat-badge">
              <Gift size={18} />
              <span><strong>50+</strong> Récompenses</span>
            </div>
            <div className="stat-badge">
              <Users size={18} />
              <span><strong>{stats.participants.toLocaleString()}</strong> Participants</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container">
        {filteredContests.length === 0 ? (
          <div className="empty-state">
            <Trophy size={48} />
            <h3>Aucun concours {filter !== 'all' ? (filter === 'active' ? 'en cours' : 'à venir') : 'disponible'}</h3>
            <p>
              {filter !== 'all' 
                ? 'Essayez de changer de filtre pour voir d\'autres concours'
                : 'Revenez bientôt pour découvrir nos prochains concours !'}
            </p>
            {filter !== 'all' && (
              <button className="btn btn-primary" onClick={() => setFilter('all')}>
                Voir tous les concours
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="results-header">
              <h2 className="results-count">
                {filteredContests.length} concours {filter === 'active' ? 'en cours' : filter === 'upcoming' ? 'à venir' : 'disponibles'}
              </h2>
            </div>

            <div className="contests-grid">
              {filteredContests.map(contest => {
                const status = getContestStatus(contest);
                const createdDate = new Date(contest.createdAt);

                return (
                  <div key={contest.id} className="contest-card">
                    {/* Status Badge */}
                    <div className={`contest-status-badge ${status}`}>
                      {status === 'active' && (
                        <>
                          <TrendingUp size={14} />
                          <span>En cours</span>
                        </>
                      )}
                      {status === 'upcoming' && (
                        <>
                          <Clock size={14} />
                          <span>Bientôt</span>
                        </>
                      )}
                      {status === 'ended' && (
                        <>
                          <Award size={14} />
                          <span>Terminé</span>
                        </>
                      )}
                    </div>

                    {contest.coverImageUrl ? (
                      <div className="contest-cover">
                        <img src={contest.coverImageUrl} alt={contest.title} />
                      </div>
                    ) : (
                      <div className="contest-icon">
                        <Trophy size={48} />
                      </div>
                    )}
                    
                    <h3>{contest.title}</h3>
                    <p className="contest-description">{contest.description}</p>
                    
                    <div className="contest-details">
                      <div className="contest-detail">
                        <Calendar size={16} />
                        <span>
                          Publié le {createdDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>

                      {status === 'active' && (
                        <div className="contest-detail highlight">
                          <TrendingUp size={16} />
                          <span>Inscriptions ouvertes</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="contest-card-actions">
                      <Link 
                        to={`/contests/${contest.id}`} 
                        className={`btn ${status === 'active' ? 'btn-primary' : 'btn-outline'}`}
                      >
                        {status === 'active' ? 'Participer maintenant' : 'Voir les détails'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Contests;
