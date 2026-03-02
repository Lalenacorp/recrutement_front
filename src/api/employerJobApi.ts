import type { JobCreateRequest, JobResponse, JobDetails } from '../types';
import { ApiError } from './authApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const employerJobApi = {
  /**
   * Crée une nouvelle offre d'emploi en mode brouillon
   */
  async createJob(request: JobCreateRequest): Promise<JobResponse> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new ApiError('Non authentifié', 401);
      }

      const response = await fetch(`${API_BASE_URL}/api/employers/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || errorData.error || 'Erreur lors de la création de l\'offre',
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
   * Publie une offre d'emploi (la rend visible publiquement)
   */
  async publishJob(jobId: number): Promise<JobResponse> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new ApiError('Non authentifié', 401);
      }

      const response = await fetch(`${API_BASE_URL}/api/employers/jobs/${jobId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || errorData.error || 'Erreur lors de la publication de l\'offre',
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
   * Liste toutes les offres d'emploi de l'employeur connecté
   */
  async listMyJobs(): Promise<JobResponse[]> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new ApiError('Non authentifié', 401);
      }

      const response = await fetch(`${API_BASE_URL}/api/employers/jobs`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
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
   * Récupère les détails complets d'une offre d'emploi
   */
  async getJobDetails(jobId: number): Promise<JobDetails> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new ApiError('Non authentifié', 401);
      }

      const response = await fetch(`${API_BASE_URL}/api/employers/jobs/${jobId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
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
