import type { ApplicationRequest, ApplicationResponse } from '../types';
import { ApiError } from './authApi';
import { authFetch } from './authFetch';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const applicationApi = {
  /**
   * Soumettre une candidature à une offre d'emploi avec CV optionnel
   */
  async submitApplication(request: ApplicationRequest, cvFile?: File): Promise<ApplicationResponse> {
    try {
      const formData = new FormData();
      
      // Ajouter les données de la candidature en tant que JSON blob
      const payload = {
        jobId: request.jobId,
        civility: request.civility,
        firstName: request.firstName,
        lastName: request.lastName,
        email: request.email,
        phone: request.phone,
        ...(request.coverLetter?.trim()
          ? { coverLetter: request.coverLetter.trim() }
          : {}),
      };
      
      formData.append('payload', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
      
      // Ajouter le CV si fourni
      if (cvFile) {
        formData.append('cv', cvFile);
      }

      const response = await fetch(`${API_BASE_URL}/api/public/applications`, {
        method: 'POST',
        body: formData,
        // Ne pas définir Content-Type - le navigateur le fera automatiquement avec boundary
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || errorData.error || 'Erreur lors de la soumission de la candidature',
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
   * Récupérer toutes les candidatures du candidat connecté
   */
  async getMyCandidateApplications(): Promise<ApplicationResponse[]> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new ApiError('Non authentifié', 401);
      }

      const response = await authFetch(`${API_BASE_URL}/api/candidates/applications`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || errorData.error || 'Erreur lors de la récupération des candidatures',
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
   * Récupérer toutes les candidatures reçues pour les offres de l'employeur connecté
   */
  async getMyEmployerApplications(): Promise<ApplicationResponse[]> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new ApiError('Non authentifié', 401);
      }

      const response = await authFetch(`${API_BASE_URL}/api/employers/applications`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || errorData.error || 'Erreur lors de la récupération des candidatures employeur',
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
