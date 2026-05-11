import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sparkles, Trophy, Calendar, Clock, Award, TrendingUp, ArrowLeft } from 'lucide-react';
import type { ContestResponse } from '../types';
import { getPublicContestDetails } from '../api/contestApi';
import { useLanguage } from '../context/LanguageContext';
import { useSEO } from '../utils/useSEO';

const ContestDetails = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const { id } = useParams<{ id: string }>();
  const [contest, setContest] = useState<ContestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useSEO({
    title: contest?.title || (isEn ? 'Contest details' : 'Détails du concours'),
    description:
      (contest?.description || '').slice(0, 200) ||
      (isEn
        ? 'Contest details, requirements and registration on SNJobConnect.'
        : "Détails du concours, conditions d'inscription et calendrier sur SNJobConnect."),
    path: id ? `/contests/${id}` : '/contests',
    type: 'article',
  });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getPublicContestDetails(Number(id));
        if (!data) {
          setError(isEn ? 'Contest not found' : 'Concours introuvable');
        } else {
          setContest(data);
        }
      } catch (err: any) {
        console.error('Erreur fetching contest details:', err);
        setError(err?.message || (isEn ? 'Error while loading contest' : 'Erreur lors du chargement du concours'));
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
              <span>{isEn ? 'Contests & Challenges' : 'Concours & Défis'}</span>
            </div>
            <h1>{isEn ? 'Contest details' : 'Détails du concours'}</h1>
            <p className="header-subtitle">{isEn ? 'Information and registration terms' : 'Informations et modalités d\'inscription'}</p>
          </div>
        </div>
      </div>

      <div className="container">
        {loading && (
          <div className="loading-message">
            <div className="spinner" />
            <p>{isEn ? 'Loading contest...' : 'Chargement du concours...'}</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <Link to="/contests" className="btn btn-outline">{isEn ? 'Back' : 'Retour'}</Link>
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
                    <span>{isEn ? 'Active' : 'En cours'}</span>
                  </>
                ) : (
                  <>
                    <Clock size={16} />
                    <span>{isEn ? 'Soon' : 'Bientôt'}</span>
                  </>
                )}
              </div>
              <h2>{contest.title}</h2>
              
              {/* Métadonnées */}
              <div className="contest-meta-info">
                <div className="meta-info-item">
                  <Calendar size={18} />
                  <span>{isEn ? 'Published on' : 'Publié le'} {new Date(contest.createdAt).toLocaleDateString(isEn ? 'en-US' : 'fr-FR', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</span>
                </div>
                <div className="meta-info-item">
                  <Trophy size={18} />
                  <span>{isEn ? 'Open to everyone' : 'Concours ouvert à tous'}</span>
                </div>
                <div className="meta-info-item">
                  <Award size={18} />
                  <span>{isEn ? 'Rewards to win' : 'Récompenses à gagner'}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="contest-detail-section">
              <h3>
                <Trophy size={20} />
                <span>{isEn ? 'About this contest' : 'À propos du concours'}</span>
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
                {isEn ? 'Back to contests' : 'Retour aux concours'}
              </Link>
              {contest.status === 'PUBLISHED' && (
                <button className="btn btn-primary">
                  <Award size={18} />
                  {isEn ? 'Join now' : 'Participer maintenant'}
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
