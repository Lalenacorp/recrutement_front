import { useEffect, useMemo, useState } from 'react';
import { GraduationCap, MapPin, Search, X } from 'lucide-react';
import { listPublicSchools } from '../api/schoolApi';
import { useLanguage } from '../context/LanguageContext';
import {
  mapSchoolResponseToSenegalSchool,
  SENEGAL_REGIONS,
  SENEGAL_SCHOOLS,
  type SenegalSchool,
} from '../data/senegalSchools';

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function schoolInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return name.slice(0, 3).toUpperCase();
}

function hasSchoolImage(school: SenegalSchool): boolean {
  return Boolean(school.imageUrl?.trim());
}

function SchoolImagePlaceholder({ name, className }: { name: string; className?: string }) {
  return (
    <div className={`school-image-placeholder ${className ?? ''}`.trim()} aria-hidden>
      <GraduationCap size={36} strokeWidth={1.5} />
      <span>{schoolInitials(name)}</span>
    </div>
  );
}

function SchoolCardMedia({ school }: { school: SenegalSchool }) {
  const [imageFailed, setImageFailed] = useState(false);
  const usePlaceholder = !hasSchoolImage(school) || imageFailed;

  if (usePlaceholder) {
    return (
      <div className="school-card-image-wrap school-card-image-fallback">
        <SchoolImagePlaceholder name={school.name} />
      </div>
    );
  }

  return (
    <div className="school-card-image-wrap">
      <img
        src={school.imageUrl}
        alt=""
        className="school-card-image"
        loading="lazy"
        onError={() => setImageFailed(true)}
      />
    </div>
  );
}

const SchoolFinderSection = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [appliedRegion, setAppliedRegion] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<SenegalSchool | null>(null);
  const [modalImageFailed, setModalImageFailed] = useState(false);
  const [schools, setSchools] = useState<SenegalSchool[]>(SENEGAL_SCHOOLS);
  const [loadingSchools, setLoadingSchools] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadingSchools(true);
      try {
        const data = await listPublicSchools();
        if (!cancelled && data.length > 0) {
          setSchools(data.map(mapSchoolResponseToSenegalSchool));
        }
      } catch {
        if (!cancelled) {
          setSchools(SENEGAL_SCHOOLS);
        }
      } finally {
        if (!cancelled) {
          setLoadingSchools(false);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredSchools = useMemo(() => {
    const q = normalize(appliedQuery.trim());
    return schools.filter((school) => {
      if (appliedRegion && school.region !== appliedRegion) return false;
      if (!q) return true;
      const haystack = normalize(
        [school.name, school.typeFr, school.typeEn, school.city, school.region, ...school.domains].join(' ')
      );
      return haystack.includes(q);
    });
  }, [appliedQuery, appliedRegion, schools]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedQuery(query);
    setAppliedRegion(region);
  };

  return (
    <section className="school-finder-section" aria-labelledby="school-finder-title">
      <div className="container">
        <span className="section-badge school-finder-badge">
          <Search size={14} aria-hidden />
          {isEn ? 'Explore' : 'Explorer'}
        </span>
        <h2 id="school-finder-title" className="school-finder-title">
          {isEn ? 'Find a school' : 'Trouver une école'}
        </h2>
        <p className="school-finder-subtitle">
          {isEn
            ? 'Explore the best schools and universities in Senegal. Filter by field, region and budget.'
            : 'Explorez les meilleures écoles et universités du Sénégal. Filtrez par domaine, région et budget.'}
        </p>

        <form className="school-finder-search" onSubmit={handleSearch}>
          <label className="school-finder-search-field school-finder-search-query">
            <Search size={18} aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isEn ? 'Name or field…' : 'Nom ou domaine…'}
              aria-label={isEn ? 'School name or field' : 'Nom ou domaine'}
            />
          </label>
          <label className="school-finder-search-field school-finder-search-region">
            <MapPin size={18} aria-hidden />
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              aria-label={isEn ? 'Region' : 'Région'}
            >
              <option value="">{isEn ? 'All regions' : 'Toutes les régions'}</option>
              {SENEGAL_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn btn-primary school-finder-search-btn">
            {isEn ? 'Search' : 'Rechercher'}
          </button>
        </form>

        {loadingSchools ? (
          <p className="school-finder-empty" role="status">
            {isEn ? 'Loading schools…' : 'Chargement des écoles…'}
          </p>
        ) : filteredSchools.length === 0 ? (
          <p className="school-finder-empty" role="status">
            {isEn
              ? 'No school matches your criteria. Try another keyword or region.'
              : 'Aucune école ne correspond à vos critères. Essayez un autre mot-clé ou une autre région.'}
          </p>
        ) : (
          <div className="school-finder-grid">
            {filteredSchools.map((school) => (
              <article key={school.id} className="school-card">
                <SchoolCardMedia school={school} />
                <div className="school-card-body">
                  <h3 className="school-card-title">{school.name}</h3>
                  <p className="school-card-type">{isEn ? school.typeEn : school.typeFr}</p>
                  <ul className="school-card-meta">
                    <li>
                      <MapPin size={15} aria-hidden />
                      {school.city}, {school.region}
                    </li>
                  </ul>
                  <button
                    type="button"
                    className="school-card-profile-link"
                    onClick={() => {
                      setModalImageFailed(false);
                      setSelectedSchool(school);
                    }}
                  >
                    {isEn ? 'View more →' : 'Voir plus →'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {selectedSchool && (
        <div
          className="school-profile-modal-overlay"
          role="presentation"
          onClick={() => setSelectedSchool(null)}
        >
          <div
            className="school-profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="school-profile-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="school-profile-modal-close"
              onClick={() => setSelectedSchool(null)}
              aria-label={isEn ? 'Close' : 'Fermer'}
            >
              <X size={22} />
            </button>
            {hasSchoolImage(selectedSchool) && !modalImageFailed ? (
              <img
                src={selectedSchool.imageUrl}
                alt=""
                className="school-profile-modal-image"
                onError={() => setModalImageFailed(true)}
              />
            ) : (
              <div className="school-profile-modal-image school-profile-modal-image-fallback">
                <SchoolImagePlaceholder name={selectedSchool.name} className="school-image-placeholder--modal" />
              </div>
            )}
            <div className="school-profile-modal-content">
              <h3 id="school-profile-title">{selectedSchool.name}</h3>
              <p className="school-profile-type">
                {isEn ? selectedSchool.typeEn : selectedSchool.typeFr}
              </p>
              <p>{isEn ? selectedSchool.descriptionEn : selectedSchool.descriptionFr}</p>
              <ul className="school-card-meta">
                <li>
                  <MapPin size={15} aria-hidden />
                  {selectedSchool.city}, {selectedSchool.region}
                </li>
              </ul>
              {selectedSchool.website && (
                <a
                  href={selectedSchool.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary school-profile-website"
                >
                  {isEn ? 'Official website' : 'Site officiel'}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SchoolFinderSection;
