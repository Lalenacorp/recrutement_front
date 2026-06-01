import { useEffect, useId, useState } from 'react';
import type { FormEvent } from 'react';
import { Sparkles, Target } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCompatibilityProfile } from '../context/CompatibilityProfileContext';
import { SENEGAL_REGIONS } from '../data/senegalSchools';
import {
  DEMO_BREAKDOWN,
  isProfileComplete,
  type CareerPriority,
  type CompatibilityProfile,
  type EducationLevelChoice,
} from '../utils/compatibilityScore';

function parseFcfaInput(value: string): number {
  const digits = value.replace(/\D/g, '');
  if (!digits) return 0;
  const n = Number.parseInt(digits, 10);
  return Number.isFinite(n) ? n : 0;
}

type MetricKey = 'academic' | 'budget' | 'location' | 'career';

const METRIC_COLORS: Record<MetricKey, string> = {
  academic: '#10b981',
  budget: '#3b82f6',
  location: '#14b8a6',
  career: '#f59e0b',
};

function CircularGauge({ percent, label }: { percent: number; label: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;

  return (
    <div className="compat-gauge" role="img" aria-label={`${label}: ${percent}%`}>
      <svg className="compat-gauge-svg" viewBox="0 0 128 128" aria-hidden>
        <circle className="compat-gauge-track" cx="64" cy="64" r={radius} fill="none" strokeWidth="7" />
        <circle
          className="compat-gauge-progress"
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 64 64)"
        />
      </svg>
      <div className="compat-gauge-center">
        <strong>{percent}%</strong>
        <span>{label}</span>
      </div>
      <span className="compat-gauge-badge" aria-hidden>
        <Sparkles size={14} />
      </span>
    </div>
  );
}

function MetricBar({
  label,
  percent,
  color,
}: {
  label: string;
  percent: number;
  color: string;
}) {
  return (
    <div className="compat-metric">
      <div className="compat-metric-header">
        <span>{label}</span>
        <strong>{percent}%</strong>
      </div>
      <div
        className="compat-metric-track"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="compat-metric-fill"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

const CompatibilityScoreSection = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const formId = useId();
  const {
    profile,
    setProfile,
    breakdown,
    schoolMatches,
    hasCalculated,
    loading,
    error,
    calculate,
    clearError,
  } = useCompatibilityProfile();

  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [budgetDisplay, setBudgetDisplay] = useState('');

  useEffect(() => {
    if (profile.annualBudgetFcfa > 0) {
      setBudgetDisplay(String(profile.annualBudgetFcfa));
    }
  }, [profile.annualBudgetFcfa]);

  const displayScores = breakdown ?? DEMO_BREAKDOWN;
  const topMatches = schoolMatches.slice(0, 5);

  const metricLabels: Record<MetricKey, string> = {
    academic: isEn ? 'Academic profile' : 'Profil académique',
    budget: isEn ? 'Budget fit' : 'Budget compatible',
    location: isEn ? 'Location' : 'Localisation',
    career: isEn ? 'Career prospects' : 'Débouchés métier',
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();
    if (!isProfileComplete(profile)) {
      setFormError(
        isEn
          ? 'Please fill in all fields to calculate your score.'
          : 'Veuillez remplir tous les champs pour calculer votre score.'
      );
      return;
    }
    await calculate(profile);
    setFormOpen(false);
  };

  const handleToggleForm = () => {
    setFormOpen((open) => !open);
    setFormError(null);
    clearError();
  };

  return (
    <section className="compat-score-section" aria-labelledby="compat-score-title">
      <div className="container">
        <span className="section-badge compat-score-badge">
          <Target size={14} aria-hidden />
          {isEn ? 'Evaluate' : 'Évaluer'}
        </span>
        <h2 id="compat-score-title" className="compat-score-title">
          {isEn ? 'View your compatibility score' : 'Voir son score de compatibilité'}
        </h2>
        <p className="compat-score-subtitle">
          {isEn
            ? 'Discover which schools best match your academic and personal profile.'
            : 'Découvrez quelles écoles correspondent le mieux à votre profil académique et personnel.'}
        </p>

        <div className="compat-score-card">
          <div className="compat-score-main">
            <CircularGauge
              percent={displayScores.overall}
              label={isEn ? 'Compatibility' : 'Compatibilité'}
            />
            <div className="compat-score-metrics">
              {(Object.keys(METRIC_COLORS) as MetricKey[]).map((key) => (
                <MetricBar
                  key={key}
                  label={metricLabels[key]}
                  percent={displayScores[key]}
                  color={METRIC_COLORS[key]}
                />
              ))}
            </div>
          </div>

          {error === 'offline' && (
            <p className="compat-score-offline-notice" role="status">
              {isEn
                ? 'Server unavailable — scores estimated locally. School rankings will appear when connected.'
                : 'Serveur indisponible — scores estimés localement. Le classement des écoles s’affichera une fois connecté.'}
            </p>
          )}

          {hasCalculated && topMatches.length > 0 && (
            <div className="compat-score-matches">
              <h3 className="compat-score-matches-title">
                {isEn ? 'Best matching schools' : 'Écoles les plus compatibles'}
              </h3>
              <ol className="compat-score-matches-list">
                {topMatches.map((match, index) => (
                  <li key={match.schoolId}>
                    <span className="compat-score-matches-rank">{index + 1}</span>
                    <span className="compat-score-matches-name">{match.schoolName}</span>
                    <span className="compat-score-matches-meta">
                      {match.city}, {match.region}
                    </span>
                    <span className="compat-score-matches-pill">{match.matchPercent}%</span>
                  </li>
                ))}
              </ol>
              <a href="#school-finder-title" className="compat-score-matches-link">
                {isEn ? 'See all schools in the finder →' : 'Voir toutes les écoles dans le finder →'}
              </a>
            </div>
          )}

          {formOpen && (
            <form
              id={formId}
              className="compat-score-form"
              onSubmit={handleSubmit}
              aria-label={isEn ? 'Compatibility questionnaire' : 'Questionnaire de compatibilité'}
            >
              {formError && (
                <p className="compat-score-form-error" role="alert">
                  {formError}
                </p>
              )}
              <div className="compat-score-form-grid">
                <label className="compat-score-field">
                  <span>{isEn ? 'Education level' : 'Niveau de formation'}</span>
                  <select
                    value={profile.educationLevel}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        educationLevel: e.target.value as EducationLevelChoice | '',
                      }))
                    }
                    required
                  >
                    <option value="" disabled>
                      {isEn ? 'Choose' : 'Choisir'}
                    </option>
                    <option value="bac">{isEn ? 'High school diploma' : 'Baccalauréat'}</option>
                    <option value="licence">{isEn ? "Bachelor's degree" : 'Licence'}</option>
                    <option value="master">{isEn ? "Master's degree" : 'Master'}</option>
                    <option value="doctorat">{isEn ? 'Doctorate' : 'Doctorat'}</option>
                    <option value="other">{isEn ? 'Other' : 'Autre'}</option>
                  </select>
                </label>

                <label className="compat-score-field">
                  <span>{isEn ? 'Desired field' : 'Filière souhaitée'}</span>
                  <input
                    type="text"
                    value={profile.desiredDomain}
                    onChange={(e) => setProfile((p) => ({ ...p, desiredDomain: e.target.value }))}
                    placeholder={
                      isEn ? 'e.g. IT, management, engineering' : 'ex. informatique, gestion, ingénierie'
                    }
                    required
                    minLength={2}
                  />
                </label>

                <label className="compat-score-field">
                  <span>{isEn ? 'Preferred region' : 'Région préférée'}</span>
                  <select
                    value={profile.preferredRegion}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        preferredRegion: e.target.value as CompatibilityProfile['preferredRegion'],
                      }))
                    }
                    required
                  >
                    <option value="" disabled>
                      {isEn ? 'Choose' : 'Choisir'}
                    </option>
                    <option value="any">{isEn ? 'No preference' : 'Sans préférence'}</option>
                    {SENEGAL_REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="compat-score-field">
                  <span>{isEn ? 'Annual study budget (FCFA)' : 'Budget annuel études (FCFA)'}</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={budgetDisplay}
                    onChange={(e) => {
                      setBudgetDisplay(e.target.value);
                      setProfile((p) => ({
                        ...p,
                        annualBudgetFcfa: parseFcfaInput(e.target.value),
                      }));
                    }}
                    placeholder={isEn ? 'e.g. 1,500,000' : 'ex. 1 500 000'}
                    required
                  />
                </label>

                <label className="compat-score-field compat-score-field-full">
                  <span>{isEn ? 'Career prospects priority' : 'Importance des débouchés métier'}</span>
                  <select
                    value={profile.careerPriority}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        careerPriority: e.target.value as CareerPriority | '',
                      }))
                    }
                    required
                  >
                    <option value="" disabled>
                      {isEn ? 'Choose' : 'Choisir'}
                    </option>
                    <option value="high">{isEn ? 'Very important' : 'Très important'}</option>
                    <option value="medium">{isEn ? 'Moderately important' : 'Assez important'}</option>
                    <option value="low">{isEn ? 'Secondary criterion' : 'Critère secondaire'}</option>
                  </select>
                </label>
              </div>
              <button type="submit" className="btn compat-score-form-submit" disabled={loading}>
                {loading
                  ? isEn
                    ? 'Calculating…'
                    : 'Calcul en cours…'
                  : isEn
                    ? 'Update my score'
                    : 'Mettre à jour mon score'}
              </button>
            </form>
          )}

          <button
            type="button"
            className="btn compat-score-cta"
            onClick={handleToggleForm}
            disabled={loading}
            aria-expanded={formOpen}
            aria-controls={formOpen ? formId : undefined}
          >
            {loading
              ? isEn
                ? 'Calculating…'
                : 'Calcul en cours…'
              : formOpen
                ? isEn
                  ? 'Hide questionnaire'
                  : 'Masquer le questionnaire'
                : hasCalculated
                  ? isEn
                    ? 'Recalculate my personalized score'
                    : 'Recalculer mon score personnalisé'
                  : isEn
                    ? 'Calculate my personalized score'
                    : 'Calculer mon score personnalisé'}
          </button>

          {!hasCalculated && !formOpen && (
            <p className="compat-score-hint">
              {isEn
                ? 'Sample scores shown. Complete the questionnaire for a score tailored to your profile.'
                : 'Scores indicatifs affichés. Remplissez le questionnaire pour un score adapté à votre profil.'}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default CompatibilityScoreSection;
