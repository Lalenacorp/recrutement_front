import { BarChart3, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  formatFcfaAmount,
  SCHOOL_TUITION_FEES,
} from '../data/schoolTuitionFees';

const TuitionComparisonSection = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const locale = isEn ? 'en' : 'fr';

  return (
    <section className="tuition-compare-section" aria-labelledby="tuition-compare-title">
      <div className="container">
        <span className="section-badge tuition-compare-badge">
          <BarChart3 size={14} aria-hidden />
          {isEn ? 'Compare' : 'Comparer'}
        </span>
        <h2 id="tuition-compare-title" className="tuition-compare-title">
          {isEn ? 'Compare tuition fees' : 'Comparer les frais de scolarité'}
        </h2>
        <p className="tuition-compare-subtitle">
          {isEn
            ? 'Compare training costs between institutions to choose the option that best fits your budget.'
            : 'Comparez les coûts de formation entre établissements pour faire le choix le plus adapté à votre budget.'}
        </p>

        <div className="tuition-compare-table-wrap">
          <table className="tuition-compare-table">
            <thead>
              <tr>
                <th scope="col">{isEn ? 'School' : 'École'}</th>
                <th scope="col">{isEn ? "Bachelor's / year" : 'Licence / an'}</th>
                <th scope="col">{isEn ? "Master's / year" : 'Master / an'}</th>
                <th scope="col">{isEn ? 'Scholarship avail.' : 'Bourse dispo.'}</th>
              </tr>
            </thead>
            <tbody>
              {SCHOOL_TUITION_FEES.map((row) => (
                <tr key={row.schoolName}>
                  <th scope="row">{row.schoolName}</th>
                  <td>{formatFcfaAmount(row.licencePerYearFcfa, locale)}</td>
                  <td>{formatFcfaAmount(row.masterPerYearFcfa, locale)}</td>
                  <td>
                    {row.scholarshipAvailable ? (
                      <span className="tuition-compare-yes">
                        <Check size={16} strokeWidth={2.5} aria-hidden />
                        {isEn ? 'Yes' : 'Oui'}
                      </span>
                    ) : (
                      <span className="tuition-compare-no">{isEn ? 'No' : 'Non'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="tuition-compare-footnote">
          {isEn
            ? 'Indicative rates — 2025/2026 academic year. Contact schools for confirmation.'
            : 'Tarifs indicatifs — année 2025/2026. Contactez les écoles pour confirmation.'}
        </p>
      </div>
    </section>
  );
};

export default TuitionComparisonSection;
