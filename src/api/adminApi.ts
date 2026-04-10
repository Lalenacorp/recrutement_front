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

export type AdminUserType = 'EMPLOYEE' | 'EMPLOYER';

export interface AdminUserSummary {
  id: number;
  type: AdminUserType;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  companyName?: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export type PreInscriptionStatus = 'PENDING' | 'CONTACTED' | 'ARCHIVED';

export interface PreInscriptionSummary {
  id: number;
  createdAt: string;
  updatedAt: string;
  status: PreInscriptionStatus;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  formationPreview: string | null;
}

export interface PreInscriptionDetail extends PreInscriptionSummary {
  details: Record<string, unknown>;
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

  /**
   * Liste les utilisateurs (candidats et/ou employeurs) pour l'admin.
   * @param type "all" | "employee" | "employer"
   */
  async getUsers(type: 'all' | 'employee' | 'employer' = 'all'): Promise<AdminUserSummary[]> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new ApiError('Non authentifié', 401);
      }

      const params = new URLSearchParams();
      if (type && type !== 'all') {
        params.set('type', type);
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/users?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || errorData.error || 'Erreur lors de la récupération des utilisateurs',
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

  async listPreInscriptions(): Promise<PreInscriptionSummary[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new ApiError('Non authentifié', 401);
    }
    const response = await fetch(`${API_BASE_URL}/api/admin/pre-inscriptions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || errorData.error || 'Erreur lors du chargement des pré-inscriptions',
        response.status,
        errorData.errors
      );
    }
    return response.json();
  },

  async getPreInscription(id: number): Promise<PreInscriptionDetail> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new ApiError('Non authentifié', 401);
    }
    const response = await fetch(`${API_BASE_URL}/api/admin/pre-inscriptions/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || errorData.error || 'Dossier introuvable',
        response.status,
        errorData.errors
      );
    }
    return response.json();
  },

  async updatePreInscriptionStatus(
    id: number,
    status: PreInscriptionStatus
  ): Promise<PreInscriptionSummary> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new ApiError('Non authentifié', 401);
    }
    const response = await fetch(`${API_BASE_URL}/api/admin/pre-inscriptions/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || errorData.error || 'Impossible de mettre à jour le statut',
        response.status,
        errorData.errors
      );
    }
    return response.json();
  },
};
