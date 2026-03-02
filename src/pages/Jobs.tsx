import { useState, useEffect } from 'react';
import JobCard from '../components/JobCard';
import type { JobDetails } from '../types';
import { jobApi } from '../api/jobApi';
import { Search, Briefcase, MapPin, Filter, TrendingUp, Users, Building2, Sparkles } from 'lucide-react';

const Jobs = () => {
  const [jobs, setJobs] = useState<JobDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobType, setJobType] = useState<string>('all');
  const [location, setLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'salary'>('recent');

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
      setError(err.message || 'Erreur lors du chargement des offres');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = jobType === 'all' || job.contractType === jobType;
    const matchesLocation = !location || 
                           job.companyName.toLowerCase().includes(location.toLowerCase()) ||
                           job.title.toLowerCase().includes(location.toLowerCase());
    
    return matchesSearch && matchesType && matchesLocation;
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

  return (
    <div className="jobs-page">
      {/* Enhanced Header */}
      <div className="jobs-header">
        <div className="container">
          <div className="jobs-header-content">
            <div className="header-badge">
              <Sparkles size={16} />
              <span>Explorer les opportunités</span>
            </div>
            <h1>Trouvez votre prochain emploi</h1>
            <p className="header-subtitle">
              Parcourez {jobs.length} offres d'emploi vérifiées de {stats.companies} entreprises partenaires
            </p>
            
            {/* Search Bar */}
            <div className="jobs-search">
              <div className="search-input">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Titre du poste, entreprise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="search-input">
                <MapPin size={20} />
                <input
                  type="text"
                  placeholder="Ville, région..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              
              <button 
                className="btn btn-primary search-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={18} />
                Filtres
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="advanced-filters">
                <div className="filter-group">
                  <label>Type de contrat</label>
                  <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
                    <option value="all">Tous les types</option>
                    <option value="FULL_TIME">Temps plein</option>
                    <option value="PART_TIME">Temps partiel</option>
                    <option value="CONTRACT">Contrat</option>
                    <option value="INTERNSHIP">Stage</option>
                    <option value="TEMPORARY">Temporaire</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Trier par</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'recent' | 'salary')}>
                    <option value="recent">Plus récentes</option>
                    <option value="salary">Salaire</option>
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
              <span><strong>{stats.total}</strong> Offres actives</span>
            </div>
            <div className="stat-badge">
              <Building2 size={18} />
              <span><strong>{stats.companies}</strong> Entreprises</span>
            </div>
            <div className="stat-badge">
              <TrendingUp size={18} />
              <span><strong>{stats.new24h}</strong> Nouvelles (24h)</span>
            </div>
            <div className="stat-badge">
              <Users size={18} />
              <span><strong>{stats.fullTime}</strong> Temps plein</span>
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
              <p>Chargement des offres...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button className="btn btn-primary" onClick={loadJobs}>Réessayer</button>
            </div>
          ) : (
            <>
              <div className="results-header">
                <div className="results-info">
                  <h2 className="results-count">
                    {sortedJobs.length} offre{sortedJobs.length > 1 ? 's' : ''} trouvée{sortedJobs.length > 1 ? 's' : ''}
                  </h2>
                  {(searchTerm || location || jobType !== 'all') && (
                    <button 
                      className="clear-filters"
                      onClick={() => {
                        setSearchTerm('');
                        setLocation('');
                        setJobType('all');
                      }}
                    >
                      Réinitialiser les filtres
                    </button>
                  )}
                </div>
              </div>
              
              <div className="jobs-grid">
                {sortedJobs.length === 0 ? (
                  <div className="empty-state">
                    <Briefcase size={48} />
                    <h3>Aucune offre trouvée</h3>
                    <p>Essayez de modifier vos critères de recherche</p>
                  </div>
                ) : (
                  sortedJobs.map(job => (
                    <JobCard key={job.id} job={job} />
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
