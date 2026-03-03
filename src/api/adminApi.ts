import { ApiError } from './authApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export interface PlatformStats {
  totalUsers: number;
  totalEmployers: number;
  totalCandidates: number;
  totalJobOffers: number;
  totalApplications: number;
  publishedJobs: number;
  activeApplications: number;
  acceptedApplications: number;
}

export const adminApi = {
  /**
   * Récupérer les statistiques de la plateforme
   */
  async getPlatformStats(): Promise<PlatformStats> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new ApiError('Non authentifié', 401);
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || errorData.error || 'Erreur lors de la récupération des statistiques',
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
