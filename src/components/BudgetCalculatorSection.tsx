import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Calculator, TrendingUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { formatFcfaAmount } from '../data/schoolTuitionFees';

/** Exemples affichés en placeholder (champs vides au chargement) */
const PLACEHOLDER_VALUES = {
  tuitionYear: 1_500_000,
  housingMonth: 75_000,
  transportMonth: 20_000,
  foodMonth: 45_000,
  suppliesYear: 50_000,
  otherMonth: 15_000,
} as const;

const EMPTY_VALUES = {
  tuitionYear: 0,
  housingMonth: 0,
  transportMonth: 0,
  foodMonth: 0,
  suppliesYear: 0,
  otherMonth: 0,
} as const;

function parseFcfaInput(value: string): number {
  const digits = value.replace(/\D/g, '');
  if (!digits) return 0;
  const n = Number.parseInt(digits, 10);
  return Number.isFinite(n) ? n : 0;
}

function formatInputValue(amount: number, locale: 'fr' | 'en'): string {
  if (amount <= 0) return '';
  return amount.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US');
}

function computeAnnualBudget(values: typeof EMPTY_VALUES): number {
  const monthly =
    values.housingMonth +
    values.transportMonth +
    values.foodMonth +
    values.otherMonth;
  const annual = values.tuitionYear + values.suppliesYear;
  return monthly * 12 + annual;
}

type BudgetFieldKey = keyof typeof EMPTY_VALUES;

const FIELD_CONFIG: {
  key: BudgetFieldKey;
  labelFr: string;
  labelEn: string;
  periodFr: string;
  periodEn: string;
}[] = [
  { key: 'tuitionYear', labelFr: 'Scolarité', labelEn: 'Tuition', periodFr: '/ an', periodEn: '/ year' },
  { key: 'housingMonth', labelFr: 'Logement', labelEn: 'Housing', periodFr: '/ mois', periodEn: '/ month' },
  { key: 'transportMonth', labelFr: 'Transport', labelEn: 'Transport', periodFr: '/ mois', periodEn: '/ month' },
  { key: 'foodMonth', labelFr: 'Nourriture', labelEn: 'Food', periodFr: '/ mois', periodEn: '/ month' },
  { key: 'suppliesYear', labelFr: 'Fournitures', labelEn: 'Supplies', periodFr: '/ an', periodEn: '/ year' },
  { key: 'otherMonth', labelFr: 'Autres dépenses', labelEn: 'Other expenses', periodFr: '/ mois', periodEn: '/ month' },
];

const BudgetCalculatorSection = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const locale = isEn ? 'en' : 'fr';

  const [values, setValues] = useState({ ...EMPTY_VALUES });
  const [displayed, setDisplayed] = useState<Record<BudgetFieldKey, string>>(() =>
    Object.fromEntries(
      (Object.keys(EMPTY_VALUES) as BudgetFieldKey[]).map((key) => [key, ''])
    ) as Record<BudgetFieldKey, string>
  );
  const totalAnnual = useMemo(() => computeAnnualBudget(values), [values]);

  const handleFieldChange = (key: BudgetFieldKey, raw: string) => {
    const parsed = parseFcfaInput(raw);
    setDisplayed((prev) => ({ ...prev, [key]: raw }));
    setValues((prev) => ({ ...prev, [key]: parsed }));
  };

  const handleFieldBlur = (key: BudgetFieldKey) => {
    setDisplayed((prev) => ({
      ...prev,
      [key]: formatInputValue(values[key], locale),
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    (Object.keys(values) as BudgetFieldKey[]).forEach((key) => handleFieldBlur(key));
  };

  return (
    <section className="budget-calc-section" aria-labelledby="budget-calc-title">
      <div className="container">
        <span className="section-badge budget-calc-badge">
          <Calculator size={14} aria-hidden />
          {isEn ? 'Plan' : 'Planifier'}
        </span>
        <h2 id="budget-calc-title" className="budget-calc-title">
          {isEn ? 'Calculate your budget' : 'Calculer son budget'}
        </h2>
        <p className="budget-calc-subtitle">
          {isEn
            ? 'Estimate your monthly and annual expenses as a student in Senegal.'
            : 'Estimez vos dépenses mensuelles et annuelles en tant qu\'étudiant au Sénégal.'}
        </p>

        <form className="budget-calc-card" onSubmit={handleSubmit}>
          <div className="budget-calc-grid">
            {FIELD_CONFIG.map(({ key, labelFr, labelEn, periodFr, periodEn }) => (
              <label key={key} className="budget-calc-field">
                <span className="budget-calc-field-label">
                  {isEn ? labelEn : labelFr}
                  <span className="budget-calc-field-period">{isEn ? periodEn : periodFr}</span>
                </span>
                <span className="budget-calc-input-wrap">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={displayed[key]}
                    placeholder={formatInputValue(PLACEHOLDER_VALUES[key], locale)}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    onBlur={() => handleFieldBlur(key)}
                    aria-label={`${isEn ? labelEn : labelFr} ${isEn ? periodEn : periodFr}`}
                  />
                  <span className="budget-calc-currency" aria-hidden>
                    FCFA
                  </span>
                </span>
              </label>
            ))}
          </div>

          <div className="budget-calc-result" role="status" aria-live="polite">
            <div className="budget-calc-result-main">
              <span className="budget-calc-result-label">
                {isEn ? 'Estimated total budget' : 'Budget total estimé'}
              </span>
              <strong className="budget-calc-result-value">
                {formatFcfaAmount(totalAnnual, locale)}
                <span className="budget-calc-result-period">
                  {isEn ? ' / year' : ' / an'}
                </span>
              </strong>
            </div>
            <a href="#tuition-compare-title" className="budget-calc-scholarships-link">
              <TrendingUp size={16} aria-hidden />
              {isEn ? 'Available scholarships' : 'Bourses disponibles'}
            </a>
          </div>

          <button type="submit" className="btn btn-primary budget-calc-submit">
            {isEn ? 'Calculate my personalized budget' : 'Calculer mon budget personnalisé'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default BudgetCalculatorSection;
