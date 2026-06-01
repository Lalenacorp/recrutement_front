import { SCHOOL_TUITION_FEES } from '../data/schoolTuitionFees';
import { SENEGAL_SCHOOLS, type SenegalRegion } from '../data/senegalSchools';

export type EducationLevelChoice = 'bac' | 'licence' | 'master' | 'doctorat' | 'other';
export type CareerPriority = 'high' | 'medium' | 'low';

export type CompatibilityProfile = {
  educationLevel: EducationLevelChoice | '';
  desiredDomain: string;
  preferredRegion: SenegalRegion | '' | 'any';
  annualBudgetFcfa: number;
  careerPriority: CareerPriority | '';
};

export type CompatibilityBreakdown = {
  academic: number;
  budget: number;
  location: number;
  career: number;
  overall: number;
};

const HIGH_DEMAND_KEYWORDS = [
  'informatique',
  'digital',
  'data',
  'ingénierie',
  'ingenierie',
  'tech',
  'finance',
  'management',
  'marketing',
  'santé',
  'sante',
  'médecine',
  'medecine',
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function medianTuitionLicence(): number {
  const values = SCHOOL_TUITION_FEES.map((r) => r.licencePerYearFcfa).sort((a, b) => a - b);
  const mid = Math.floor(values.length / 2);
  return values.length % 2 === 0 ? (values[mid - 1] + values[mid]) / 2 : values[mid];
}

function scoreAcademic(profile: CompatibilityProfile): number {
  let score = 20;
  if (profile.educationLevel) score += 25;
  const domain = normalize(profile.desiredDomain);
  if (domain.length >= 2) {
    score += 20;
    const matchingSchools = SENEGAL_SCHOOLS.filter((s) =>
      s.domains.some((d) => {
        const nd = normalize(d);
        return nd.includes(domain) || domain.includes(nd);
      })
    );
    const ratio = matchingSchools.length / SENEGAL_SCHOOLS.length;
    score += Math.round(Math.min(35, ratio * 35 + 15));
  }
  return Math.min(100, score);
}

function scoreBudget(annualBudgetFcfa: number): number {
  if (annualBudgetFcfa <= 0) return 45;
  const minFee = Math.min(...SCHOOL_TUITION_FEES.map((r) => r.licencePerYearFcfa));
  const maxFee = Math.max(...SCHOOL_TUITION_FEES.map((r) => r.licencePerYearFcfa));
  const median = medianTuitionLicence();
  if (annualBudgetFcfa >= maxFee * 1.1) return 100;
  if (annualBudgetFcfa >= median) return 85;
  if (annualBudgetFcfa >= median * 0.75) return 72;
  if (annualBudgetFcfa >= minFee) return 58;
  return Math.max(25, Math.round((annualBudgetFcfa / minFee) * 50));
}

function scoreLocation(region: CompatibilityProfile['preferredRegion']): number {
  if (!region || region === 'any') return 70;
  const inRegion = SENEGAL_SCHOOLS.filter((s) => s.region === region).length;
  const ratio = inRegion / SENEGAL_SCHOOLS.length;
  return Math.min(100, Math.round(55 + ratio * 45));
}

function scoreCareer(profile: CompatibilityProfile): number {
  const domain = normalize(profile.desiredDomain);
  let base = 50;
  if (domain.length >= 2) {
    const isHighDemand = HIGH_DEMAND_KEYWORDS.some(
      (kw) => domain.includes(kw) || kw.includes(domain)
    );
    base = isHighDemand ? 78 : 62;
  }
  const priorityBoost =
    profile.careerPriority === 'high' ? 18 : profile.careerPriority === 'medium' ? 10 : 4;
  return Math.min(100, base + priorityBoost);
}

export function computeCompatibilityScores(profile: CompatibilityProfile): CompatibilityBreakdown {
  const academic = scoreAcademic(profile);
  const budget = scoreBudget(profile.annualBudgetFcfa);
  const location = scoreLocation(profile.preferredRegion);
  const career = scoreCareer(profile);

  const overall = Math.round(academic * 0.3 + budget * 0.25 + location * 0.25 + career * 0.2);

  return { academic, budget, location, career, overall };
}

export const DEMO_BREAKDOWN: CompatibilityBreakdown = {
  overall: 79,
  academic: 85,
  budget: 72,
  location: 90,
  career: 68,
};

export const COMPATIBILITY_PROFILE_STORAGE_KEY = 'compatibilityScoreProfile';

export function isProfileComplete(profile: CompatibilityProfile): boolean {
  return Boolean(
    profile.educationLevel &&
      profile.desiredDomain.trim().length >= 2 &&
      profile.preferredRegion &&
      profile.annualBudgetFcfa > 0 &&
      profile.careerPriority
  );
}
