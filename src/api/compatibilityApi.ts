import { ApiError } from './authApi';
import type {
  CareerPriority,
  CompatibilityBreakdown,
  CompatibilityProfile,
  EducationLevelChoice,
} from '../utils/compatibilityScore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export type SchoolMatchItem = {
  schoolId: number;
  schoolName: string;
  city: string;
  region: string;
  matchPercent: number;
  academicScore: number;
  budgetScore: number;
  locationScore: number;
  careerScore: number;
};

export type SchoolCompatibilityApiResponse = CompatibilityBreakdown & {
  schoolMatches: SchoolMatchItem[];
};

function toApiPayload(profile: CompatibilityProfile) {
  return {
    educationLevel: profile.educationLevel,
    desiredDomain: profile.desiredDomain.trim(),
    preferredRegion: profile.preferredRegion === '' ? 'any' : profile.preferredRegion,
    annualBudgetFcfa: profile.annualBudgetFcfa,
    careerPriority: profile.careerPriority,
  };
}

export async function computeSchoolCompatibility(
  profile: CompatibilityProfile
): Promise<SchoolCompatibilityApiResponse> {
  const response = await fetch(`${API_BASE_URL}/api/public/schools/compatibility`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toApiPayload(profile)),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      (errorData as { message?: string }).message ||
        (errorData as { error?: string }).error ||
        'Impossible de calculer le score de compatibilité',
      response.status
    );
  }

  const data = (await response.json()) as SchoolCompatibilityApiResponse;
  return {
    overall: data.overall,
    academic: data.academic,
    budget: data.budget,
    location: data.location,
    career: data.career,
    schoolMatches: data.schoolMatches ?? [],
  };
}

export type { EducationLevelChoice, CareerPriority };
