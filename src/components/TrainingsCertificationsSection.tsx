import { useEffect, useState } from 'react';
import { BookOpen, Bookmark, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { fetchRecommendedTrainings } from '../api/trainingsApi';
import { useLanguage } from '../context/LanguageContext';
import {
  formatDuration,
  levelLabel,
  ORIENTATION_ADVISOR_PREFILL_KEY,
  TRENDING_TRAININGS_FALLBACK,
  type TrainingRecommendation,
} from '../data/trendingTrainings';

function TrainingCard({
  training,
  isEn,
  onLearnMore,
}: {
  training: TrainingRecommendation;
  isEn: boolean;
  onLearnMore: (training: TrainingRecommendation) => void;
}) {
  const title = isEn ? training.titleEn : training.titleFr;

  return (
    <article className="training-card">
      <div className="training-card-top">
        <span className="training-card-icon" aria-hidden>
          <BookOpen size={18} />
        </span>
        {training.trending && (
          <span className="training-card-trending">
            <TrendingUp size={14} aria-hidden />
            {isEn ? 'Trending' : 'Tendance'}
          </span>
        )}
      </div>
      <h3 className="training-card-title">{title}</h3>
      <p className="training-card-institution">{training.institution}</p>
      <div className="training-card-tags">
        <span className="training-card-tag">{formatDuration(training.durationMonths, isEn)}</span>
        <span className="training-card-tag">{levelLabel(training.level, isEn)}</span>
      </div>
      <button type="button" className="training-card-link" onClick={() => onLearnMore(training)}>
        {isEn ? 'Learn more →' : 'En savoir plus →'}
      </button>
    </article>
  );
}

const TrainingsCertificationsSection = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [trainings, setTrainings] = useState<TrainingRecommendation[]>(TRENDING_TRAININGS_FALLBACK);
  const [loading, setLoading] = useState(true);
  const [aiGenerated, setAiGenerated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchRecommendedTrainings();
        if (!cancelled && data.trainings.length > 0) {
          setTrainings(data.trainings);
          setAiGenerated(data.aiGenerated);
        }
      } catch {
        if (!cancelled) {
          setTrainings(TRENDING_TRAININGS_FALLBACK);
          setAiGenerated(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLearnMore = (training: TrainingRecommendation) => {
    const title = isEn ? training.titleEn : training.titleFr;
    if (training.learnMoreUrl?.trim()) {
      window.open(training.learnMoreUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    const question = isEn
      ? `Tell me more about the "${title}" training at ${training.institution} and career prospects in Senegal.`
      : `Parlez-moi de la formation « ${title} » à ${training.institution} et des débouchés au Sénégal.`;
    try {
      sessionStorage.setItem(ORIENTATION_ADVISOR_PREFILL_KEY, question);
    } catch {
      /* ignore */
    }
    document.getElementById('orientation-advisor-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="trainings-section" aria-labelledby="trainings-section-title">
      <div className="container">
        <span className="section-badge trainings-badge">
          <Bookmark size={14} aria-hidden />
          {isEn ? 'Recommended' : 'Recommandé'}
        </span>
        <h2 id="trainings-section-title" className="trainings-title">
          {isEn ? 'Training & certifications' : 'Formations & certifications'}
        </h2>
        <p className="trainings-subtitle">
          {isEn
            ? 'The most in-demand training programs on the Senegalese job market.'
            : 'Les formations les plus demandées sur le marché de l\'emploi sénégalais.'}
        </p>

        {aiGenerated && !loading && (
          <p className="trainings-ai-note">
            <Sparkles size={14} aria-hidden />
            {isEn
              ? 'Recommendations updated by our AI advisor.'
              : 'Recommandations mises à jour par notre conseiller IA.'}
          </p>
        )}

        {loading ? (
          <div className="trainings-grid trainings-grid-loading" role="status">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="training-card training-card-skeleton" aria-hidden>
                <Loader2 className="training-skeleton-spinner" size={24} />
              </div>
            ))}
            <span className="visually-hidden">
              {isEn ? 'Loading trainings…' : 'Chargement des formations…'}
            </span>
          </div>
        ) : (
          <div className="trainings-grid">
            {trainings.map((training) => (
              <TrainingCard
                key={training.id}
                training={training}
                isEn={isEn}
                onLearnMore={handleLearnMore}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TrainingsCertificationsSection;
