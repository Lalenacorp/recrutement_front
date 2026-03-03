import type { ContestCreateRequest, ContestResponse } from '../types';
import { ApiError } from './authApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

/**
 * Crée un nouveau concours (brouillon)
 */
export async function createContest(request: ContestCreateRequest): Promise<ContestResponse> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new ApiError('Non authentifié', 401);
  }

  const response = await fetch(`${API_BASE_URL}/api/admin/contests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(errorText || 'Erreur lors de la création du concours', response.status);
  }

  return response.json();
}

/**
 * Publie un concours (change le statut de DRAFT à PUBLISHED)
 */
export async function publishContest(contestId: number): Promise<ContestResponse> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new ApiError('Non authentifié', 401);
  }

  const response = await fetch(`${API_BASE_URL}/api/admin/contests/${contestId}/publish`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(errorText || 'Erreur lors de la publication du concours', response.status);
  }

  return response.json();
}

/**
 * Archive un concours (change le statut à ARCHIVED)
 */
export async function archiveContest(contestId: number): Promise<ContestResponse> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new ApiError('Non authentifié', 401);
  }

  const response = await fetch(`${API_BASE_URL}/api/admin/contests/${contestId}/archive`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(errorText || 'Erreur lors de l\'archivage du concours', response.status);
  }

  return response.json();
}

/**
 * Liste tous les concours (admin)
 */
export async function listContestsAdmin(): Promise<ContestResponse[]> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new ApiError('Non authentifié', 401);
  }

  const response = await fetch(`${API_BASE_URL}/api/admin/contests`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(errorText || 'Erreur lors de la récupération des concours', response.status);
  }

  return response.json();
}

/**
 * Liste les concours publiés (accessible publiquement)
 */
export async function listPublicContests(): Promise<ContestResponse[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/contests`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Si l'endpoint public n'existe pas (404 ou 401), on retourne un tableau vide
      // plutôt que de faire planter l'application
      if (response.status === 404 || response.status === 401) {
        console.warn('Endpoint public /api/contests non disponible. Veuillez créer le ContestController côté backend.');
        return [];
      }
      const errorText = await response.text();
      throw new ApiError(errorText || 'Erreur lors de la récupération des concours', response.status);
    }

    return response.json();
  } catch (error) {
    // Si l'endpoint n'existe pas, on retourne un tableau vide
    if (error instanceof TypeError) {
      console.warn('Impossible de se connecter à l\'API des concours');
      return [];
    }
    throw error;
  }
}

/**
 * Récupère les détails publics d'un concours
 */
export async function getPublicContestDetails(contestId: number): Promise<ContestResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/contests/${contestId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const text = await response.text().catch(() => '');
      throw new ApiError(text || 'Erreur lors de la récupération du concours', response.status);
    }

    return response.json();
  } catch (err) {
    if (err instanceof TypeError) {
      console.warn('Impossible de se connecter à l\'API des concours');
      return null;
    }
    throw err;
  }
}
