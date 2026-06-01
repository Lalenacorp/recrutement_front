import { ApiError } from './authApi';
import type { TrainingRecommendation } from '../data/trendingTrainings';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export type TrainingRecommendationsResponse = {
  trainings: TrainingRecommendation[];
  aiGenerated: boolean;
};

export async function fetchRecommendedTrainings(
  refresh = false
): Promise<TrainingRecommendationsResponse> {
  const query = refresh ? '?refresh=true' : '';
  const response = await fetch(`${API_BASE_URL}/api/public/trainings/recommended${query}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      (errorData as { message?: string }).message ||
        (errorData as { error?: string }).error ||
        'Impossible de charger les formations recommandées',
      response.status
    );
  }

  return response.json();
}
