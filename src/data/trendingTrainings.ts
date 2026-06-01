export type TrainingLevel = 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE';

export type TrainingRecommendation = {
  id: string;
  titleFr: string;
  titleEn: string;
  institution: string;
  durationMonths: number;
  level: TrainingLevel;
  trending: boolean;
  learnMoreUrl?: string;
  aiGenerated?: boolean;
};

export const TRENDING_TRAININGS_FALLBACK: TrainingRecommendation[] = [
  {
    id: 'fullstack-simplon',
    titleFr: 'Développement Web Full-Stack',
    titleEn: 'Full-Stack Web Development',
    institution: 'Simplon Dakar',
    durationMonths: 6,
    level: 'DEBUTANT',
    trending: true,
    learnMoreUrl: 'https://simplon.co/',
  },
  {
    id: 'marketing-ism',
    titleFr: 'Marketing Digital & Growth',
    titleEn: 'Digital Marketing & Growth',
    institution: 'ISM Dakar',
    durationMonths: 12,
    level: 'INTERMEDIAIRE',
    trending: true,
    learnMoreUrl: 'https://www.ism.edu.sn/',
  },
  {
    id: 'data-esp',
    titleFr: 'Data Science & IA',
    titleEn: 'Data Science & AI',
    institution: 'ESP Thiès',
    durationMonths: 18,
    level: 'AVANCE',
    trending: false,
    learnMoreUrl: 'https://www.esp.sn/',
  },
  {
    id: 'pmp-cesag',
    titleFr: 'Gestion de Projet PMP',
    titleEn: 'PMP Project Management',
    institution: 'CESAG',
    durationMonths: 4,
    level: 'INTERMEDIAIRE',
    trending: false,
    learnMoreUrl: 'https://www.cesag.sn/',
  },
  {
    id: 'compta-ucad',
    titleFr: 'Comptabilité SYSCOHADA',
    titleEn: 'SYSCOHADA Accounting',
    institution: 'UCAD - FASEG',
    durationMonths: 10,
    level: 'DEBUTANT',
    trending: false,
    learnMoreUrl: 'https://www.ucad.sn/',
  },
  {
    id: 'ux-volkeno',
    titleFr: 'Design UX/UI',
    titleEn: 'UX/UI Design',
    institution: 'Volkeno Academy',
    durationMonths: 5,
    level: 'DEBUTANT',
    trending: true,
    learnMoreUrl: 'https://www.volkeno.com/',
  },
];

export const ORIENTATION_ADVISOR_PREFILL_KEY = 'orientationAdvisorPrefill';

export function levelLabel(level: TrainingLevel, isEn: boolean): string {
  if (isEn) {
    switch (level) {
      case 'DEBUTANT':
        return 'Beginner';
      case 'INTERMEDIAIRE':
        return 'Intermediate';
      case 'AVANCE':
        return 'Advanced';
    }
  }
  switch (level) {
    case 'DEBUTANT':
      return 'Débutant';
    case 'INTERMEDIAIRE':
      return 'Intermédiaire';
    case 'AVANCE':
      return 'Avancé';
  }
}

export function formatDuration(months: number, isEn: boolean): string {
  if (isEn) {
    return months === 1 ? '1 month' : `${months} months`;
  }
  return months === 1 ? '1 mois' : `${months} mois`;
}
