import { useState, useEffect } from 'react';
import JobCard from '../components/JobCard';
import type { JobDetails, RemoteWorkType } from '../types';
import { jobApi } from '../api/jobApi';
import { Search, Briefcase, MapPin, Filter, TrendingUp, Users, Building2, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSEO } from '../utils/useSEO';

const SENEGAL_REGIONS = [
  'Dakar',
  'Diourbel',
  'Fatick',
  'Kaffrine',
  'Kaolack',
  'Kedougou',
  'Kolda',
  'Louga',
  'Matam',
  'Saint-Louis',
  'Sedhiou',
  'Tambacounda',
  'Thies',
  'Ziguinchor',
];

const Jobs = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [jobs, setJobs] = useState<JobDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useSEO({
    title: isEn ? 'Job offers in Senegal' : "Offres d'emploi au Sénégal",
    description: isEn
      ? 'Browse the latest job offers in Senegal — Dakar, Thies, Saint-Louis and more. Filter by sector, region and contract type on SNJobConnect.'
      : "Découvrez les dernières offres d'emploi au Sénégal : Dakar, Thiès, Saint-Louis et toutes les régions. Filtrez par secteur, région et type de contrat sur SNJobConnect.",
    path: '/jobs',
    keywords:
      "offres d'emploi Sénégal, emploi Dakar, recrutement, job Sénégal, CDI, CDD, stage, télétravail",
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [jobType, setJobType] = useState<string>('all');
  const [location, setLocation] = useState('');
  const [remoteType, setRemoteType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'salary'>('recent');
  const [savedJobs, setSavedJobs] = useState<number[]>(() => {
    const fromStorage = localStorage.getItem('savedJobs');
    if (!fromStorage) return [];
    const parsed = JSON.parse(fromStorage);
    return Array.isArray(parsed) ? parsed.filter((item): item is number => typeof item === 'number') : [];
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await jobApi.getPublishedJobs();
      setJobs(data);
    } catch (err: any) {
      setError(err.message || (isEn ? 'Error while loading job offers' : 'Erreur lors du chargement des offres'));
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.jobDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = jobType === 'all' || job.contractType === jobType;
    const normalizedLocation = location.toLowerCase().trim();
    const matchesLocation = !normalizedLocation ||
                           (job.location || '').toLowerCase().includes(normalizedLocation);
    const matchesRemoteType = remoteType === 'all' || (job.remoteWorkType ?? 'ON_SITE') === remoteType;
    
    return matchesSearch && matchesType && matchesLocation && matchesRemoteType;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });

  const stats = {
    total: jobs.length,
    fullTime: jobs.filter(j => j.contractType === 'FULL_TIME').length,
    companies: new Set(jobs.map(j => j.companyName)).size,
    new24h: jobs.filter(j => {
      const diff = Date.now() - new Date(j.createdAt).getTime();
      return diff < 24 * 60 * 60 * 1000;
    }).length
  };

  const getRemoteTypeLabel = (type: RemoteWorkType | 'all'): string => {
    switch (type) {
      case 'all': return isEn ? 'All modes' : 'Tous les modes';
      case 'ON_SITE': return isEn ? 'On-site' : 'Sur site';
      case 'HYBRID': return isEn ? 'Hybrid' : 'Hybride';
      case 'REMOTE': return isEn ? 'Remote' : '100% télétravail';
      default: return type;
    }
  };

  const toggleSavedJob = (jobId: number) => {
    setSavedJobs((previous) => {
      const next = previous.includes(jobId)
        ? previous.filter((id) => id !== jobId)
        : [...previous, jobId];
      localStorage.setItem('savedJobs', JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="jobs-page">
      {/* Enhanced Header */}
      <div className="jobs-header">
        <div className="container">
          <div className="jobs-header-content">
            <div className="header-badge">
              <Sparkles size={16} />
              <span>{isEn ? 'Explore opportunities' : 'Explorer les opportunités'}</span>
            </div>
            <h1>{isEn ? 'Find your next job' : 'Trouvez votre prochain emploi'}</h1>
            <p className="header-subtitle">
              {isEn
                ? `Browse ${jobs.length} verified job offers from ${stats.companies} partner companies`
                : `Parcourez ${jobs.length} offres d'emploi vérifiées de ${stats.companies} entreprises partenaires`}
            </p>
            
            {/* Search Bar */}
            <div className="jobs-search">
              <div className="search-input">
                <Search size={20} />
                <input
                  type="text"
                  placeholder={isEn ? 'Job title, company...' : 'Titre du poste, entreprise...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="search-input">
                <MapPin size={20} />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <option value="">{isEn ? 'All regions' : 'Toutes les regions'}</option>
                  {SENEGAL_REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
              
              <button 
                className="btn btn-primary search-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={18} />
                {isEn ? 'Filters' : 'Filtres'}
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="advanced-filters">
                <div className="filter-group">
                  <label>{isEn ? 'Contract type' : 'Type de contrat'}</label>
                  <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
                    <option value="all">{isEn ? 'All types' : 'Tous les types'}</option>
                    <option value="FULL_TIME">{isEn ? 'Full time' : 'Temps plein'}</option>
                    <option value="PART_TIME">{isEn ? 'Part time' : 'Temps partiel'}</option>
                    <option value="CONTRACT">{isEn ? 'Contract' : 'Contrat'}</option>
                    <option value="INTERNSHIP">{isEn ? 'Internship' : 'Stage'}</option>
                    <option value="TEMPORARY">{isEn ? 'Temporary' : 'Temporaire'}</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>{isEn ? 'Remote work' : 'Télétravail'}</label>
                  <select value={remoteType} onChange={(e) => setRemoteType(e.target.value)}>
                    <option value="all">{getRemoteTypeLabel('all')}</option>
                    <option value="ON_SITE">{getRemoteTypeLabel('ON_SITE')}</option>
                    <option value="HYBRID">{getRemoteTypeLabel('HYBRID')}</option>
                    <option value="REMOTE">{getRemoteTypeLabel('REMOTE')}</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>{isEn ? 'Sort by' : 'Trier par'}</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'recent' | 'salary')}>
                    <option value="recent">{isEn ? 'Most recent' : 'Plus récentes'}</option>
                    <option value="salary">{isEn ? 'Salary' : 'Salaire'}</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="jobs-stats-bar">
        <div className="container">
          <div className="stats-bar-content">
            <div className="stat-badge">
              <Briefcase size={18} />
              <span><strong>{stats.total}</strong> {isEn ? 'Active jobs' : 'Offres actives'}</span>
            </div>
            <div className="stat-badge">
              <Building2 size={18} />
              <span><strong>{stats.companies}</strong> {isEn ? 'Companies' : 'Entreprises'}</span>
            </div>
            <div className="stat-badge">
              <TrendingUp size={18} />
              <span><strong>{stats.new24h}</strong> {isEn ? 'New (24h)' : 'Nouvelles (24h)'}</span>
            </div>
            <div className="stat-badge">
              <Users size={18} />
              <span><strong>{stats.fullTime}</strong> {isEn ? 'Full time' : 'Temps plein'}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Results Section */}
      <div className="container">
        <div className="jobs-results">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>{isEn ? 'Loading jobs...' : 'Chargement des offres...'}</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button className="btn btn-primary" onClick={loadJobs}>{isEn ? 'Retry' : 'Réessayer'}</button>
            </div>
          ) : (
            <>
              <div className="results-header">
                <div className="results-info">
                  <h2 className="results-count">
                    {sortedJobs.length} {isEn
                      ? `job${sortedJobs.length > 1 ? 's' : ''} found`
                      : `offre${sortedJobs.length > 1 ? 's' : ''} trouvée${sortedJobs.length > 1 ? 's' : ''}`}
                  </h2>
                  {(searchTerm || location || jobType !== 'all' || remoteType !== 'all') && (
                    <button 
                      className="clear-filters"
                      onClick={() => {
                        setSearchTerm('');
                        setLocation('');
                        setJobType('all');
                        setRemoteType('all');
                      }}
                    >
                      {isEn ? 'Reset filters' : 'Réinitialiser les filtres'}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="jobs-grid">
                {sortedJobs.length === 0 ? (
                  <div className="empty-state">
                    <Briefcase size={48} />
                    <h3>{isEn ? 'No job found' : 'Aucune offre trouvée'}</h3>
                    <p>{isEn ? 'Try changing your filters' : 'Essayez de modifier vos critères de recherche'}</p>
                  </div>
                ) : (
                  sortedJobs.map(job => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSaved={savedJobs.includes(job.id)}
                      onToggleSave={toggleSavedJob}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
