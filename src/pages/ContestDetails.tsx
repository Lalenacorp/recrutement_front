import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sparkles, Trophy, Calendar, Clock, Award, TrendingUp, ArrowLeft } from 'lucide-react';
import type { ContestResponse } from '../types';
import { getPublicContestDetails } from '../api/contestApi';

const ContestDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [contest, setContest] = useState<ContestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getPublicContestDetails(Number(id));
        if (!data) {
          setError('Concours introuvable');
        } else {
          setContest(data);
        }
      } catch (err: any) {
        console.error('Erreur fetching contest details:', err);
        setError(err?.message || 'Erreur lors du chargement du concours');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <div className="contest-details-page">
      <div className="page-header">
        <div className="container">
          <div className="page-header-content">
            <div className="header-badge">
              <Sparkles size={16} />
              <span>Concours & Défis</span>
            </div>
            <h1>Détails du concours</h1>
            <p className="header-subtitle">Informations et modalités d'inscription</p>
          </div>
        </div>
      </div>

      <div className="container">
        {loading && (
          <div className="loading-message">
            <div className="spinner" />
            <p>Chargement du concours...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <Link to="/contests" className="btn btn-outline">Retour</Link>
          </div>
        )}

        {contest && (
          <div className="contest-detail-card">
            {/* Header avec image de couverture */}
            {contest.coverImageUrl && (
              <div className="contest-cover-full">
                <img src={contest.coverImageUrl} alt={contest.title} />
                <div className="contest-cover-overlay">
                  <Trophy size={48} />
                </div>
              </div>
            )}

            {/* En-tête du concours */}
            <div className="contest-detail-header">
              <div className="contest-status-badge">
                {contest.status === 'PUBLISHED' ? (
                  <>
                    <TrendingUp size={16} />
                    <span>En cours</span>
                  </>
                ) : (
                  <>
                    <Clock size={16} />
                    <span>Bientôt</span>
                  </>
                )}
              </div>
              <h2>{contest.title}</h2>
              
              {/* Métadonnées */}
              <div className="contest-meta-info">
                <div className="meta-info-item">
                  <Calendar size={18} />
                  <span>Publié le {new Date(contest.createdAt).toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</span>
                </div>
                <div className="meta-info-item">
                  <Trophy size={18} />
                  <span>Concours ouvert à tous</span>
                </div>
                <div className="meta-info-item">
                  <Award size={18} />
                  <span>Récompenses à gagner</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="contest-detail-section">
              <h3>
                <Trophy size={20} />
                <span>À propos du concours</span>
              </h3>
              <div 
                className="contest-description-rich" 
                dangerouslySetInnerHTML={{ __html: contest.description }} 
              />
            </div>

            {/* Actions */}
            <div className="contest-detail-actions">
              <Link to="/contests" className="btn btn-outline">
                <ArrowLeft size={18} />
                Retour aux concours
              </Link>
              {contest.status === 'PUBLISHED' && (
                <button className="btn btn-primary">
                  <Award size={18} />
                  Participer maintenant
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestDetails;
