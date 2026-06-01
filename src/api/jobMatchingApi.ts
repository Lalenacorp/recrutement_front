import type {
  CandidateMatchingProfile,
  CvOptimizationResponse,
  EducationLevel,
  ExperienceLevel,
  JobContractType,
  JobMatchItem,
} from '../types';
import { ApiError } from './authApi';
import { authFetch } from './authFetch';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

function defaultApiErrorMessage(status: number): string {
  switch (status) {
    case 401:
      return 'Session expirée. Reconnectez-vous.';
    case 403:
      return 'Accès refusé par le serveur. En local, utilisez le backend sur le port 8080 (voir .env).';
    case 503:
      return "L'optimisation IA n'est pas activée sur le serveur (clé API manquante).";
    case 502:
      return 'Le fournisseur IA a renvoyé une erreur. Réessayez plus tard.';
    default:
      return 'Erreur serveur';
  }
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const raw = await response.text().catch(() => '');
    let msg = defaultApiErrorMessage(response.status);
    let fieldErrors: Record<string, string[]> | undefined;
    try {
      const errorData = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
      if (errorData.errors && typeof errorData.errors === 'object') {
        fieldErrors = errorData.errors as Record<string, string[]>;
      }
      if (typeof errorData.detail === 'string') msg = errorData.detail;
      else if (typeof errorData.message === 'string') msg = errorData.message;
      else if (typeof errorData.error === 'string') msg = errorData.error;
      else if (raw && !raw.startsWith('{')) msg = raw;
    } catch {
      if (raw) msg = raw;
    }
    throw new ApiError(msg, response.status, fieldErrors);
  }
  return response.json() as Promise<T>;
}

export type MatchingProfileUpdate = {
  profileExperienceLevel: ExperienceLevel | null;
  profileEducationLevel: EducationLevel | null;
  preferredContractTypes: JobContractType[];
  jobMatchKeywords: string | null;
  cvTextForMatching: string | null;
};

export const jobMatchingApi = {
  async getMatchingProfile(): Promise<CandidateMatchingProfile> {
    const response = await authFetch(`${API_BASE_URL}/api/candidates/matching-profile`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    return readJson<CandidateMatchingProfile>(response);
  },

  async updateMatchingProfile(body: MatchingProfileUpdate): Promise<CandidateMatchingProfile> {
    const response = await authFetch(`${API_BASE_URL}/api/candidates/matching-profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        profileExperienceLevel: body.profileExperienceLevel,
        profileEducationLevel: body.profileEducationLevel,
        preferredContractTypes: body.preferredContractTypes,
        jobMatchKeywords: body.jobMatchKeywords?.trim() || null,
        cvTextForMatching: body.cvTextForMatching?.trim() || null,
      }),
    });
    return readJson<CandidateMatchingProfile>(response);
  },

  async getJobMatches(): Promise<JobMatchItem[]> {
    const response = await authFetch(`${API_BASE_URL}/api/candidates/job-matches`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    return readJson<JobMatchItem[]>(response);
  },

  async optimizeCvForJob(jobId: number, currentCvText: string): Promise<CvOptimizationResponse> {
    const response = await authFetch(`${API_BASE_URL}/api/candidates/cv-optimizer/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        jobId,
        currentCvText: currentCvText.trim(),
      }),
    });
    return readJson<CvOptimizationResponse>(response);
  },
};
