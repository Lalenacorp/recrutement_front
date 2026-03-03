import type { JobDetails } from '../types';
import { ApiError } from './authApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const jobApi = {
  /**
   * Récupère toutes les offres d'emploi publiées (publiques)
   */
  async getPublishedJobs(): Promise<JobDetails[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/jobs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || errorData.error || 'Erreur lors de la récupération des offres',
          response.status,
          errorData.errors
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Erreur de connexion au serveur', 0);
    }
  },

  /**
   * Récupère les détails d'une offre d'emploi publiée
   */
  async getJobDetails(jobId: number): Promise<JobDetails> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/jobs/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || errorData.error || 'Erreur lors de la récupération des détails',
          response.status,
          errorData.errors
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Erreur de connexion au serveur', 0);
    }
  },
};
