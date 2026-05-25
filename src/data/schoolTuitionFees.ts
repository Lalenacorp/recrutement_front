export type SchoolTuitionRow = {
  schoolName: string;
  licencePerYearFcfa: number;
  masterPerYearFcfa: number;
  scholarshipAvailable: boolean;
};

/** Tarifs indicatifs — année 2025/2026 (établissements à Dakar) */
export const SCHOOL_TUITION_FEES: SchoolTuitionRow[] = [
  {
    schoolName: 'ISM Dakar',
    licencePerYearFcfa: 1_800_000,
    masterPerYearFcfa: 2_500_000,
    scholarshipAvailable: true,
  },
  {
    schoolName: 'IAM Dakar',
    licencePerYearFcfa: 1_500_000,
    masterPerYearFcfa: 2_200_000,
    scholarshipAvailable: true,
  },
  {
    schoolName: 'UCAD',
    licencePerYearFcfa: 50_000,
    masterPerYearFcfa: 75_000,
    scholarshipAvailable: true,
  },
  {
    schoolName: 'BEM Dakar',
    licencePerYearFcfa: 2_000_000,
    masterPerYearFcfa: 2_800_000,
    scholarshipAvailable: false,
  },
];

export function formatFcfaAmount(amount: number, locale: 'fr' | 'en'): string {
  const formatted = amount.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US');
  return `${formatted} FCFA`;
}
