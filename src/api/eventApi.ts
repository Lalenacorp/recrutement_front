import type { EventCreateRequest, EventResponse } from '../types';
import { ApiError } from './authApi';
import { authFetch } from './authFetch';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

/**
 * Crée un nouveau événement (brouillon)
 */
export async function createEvent(request: EventCreateRequest): Promise<EventResponse> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new ApiError('Non authentifié', 401);
  }

  const response = await authFetch(`${API_BASE_URL}/api/admin/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new ApiError(errorText || 'Erreur lors de la création de l\'événement', response.status);
  }

  return response.json();
}

export async function updateEvent(id: number, request: EventCreateRequest): Promise<EventResponse> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new ApiError('Non authentifié', 401);
    }

    const response = await authFetch(`${API_BASE_URL}/api/admin/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || errorData.error || 'Erreur lors de la mise à jour de l\'événement',
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
}

export async function deleteEvent(id: number): Promise<void> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new ApiError('Non authentifié', 401);
    }

    const response = await authFetch(`${API_BASE_URL}/api/admin/events/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || errorData.error || 'Erreur lors de la suppression de l\'événement',
        response.status,
        errorData.errors
      );
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Erreur de connexion au serveur', 0);
  }
}

/**
 * Publie un événement (change le statut de DRAFT à PUBLISHED)
 */
export async function publishEvent(eventId: number): Promise<EventResponse> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new ApiError('Non authentifié', 401);
  }

  const response = await authFetch(`${API_BASE_URL}/api/admin/events/${eventId}/publish`, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(errorText || 'Erreur lors de la publication de l\'événement', response.status);
  }

  return response.json();
}

/**
 * Archive un événement (change le statut à ARCHIVED)
 */
export async function archiveEvent(eventId: number): Promise<EventResponse> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new ApiError('Non authentifié', 401);
  }

  const response = await authFetch(`${API_BASE_URL}/api/admin/events/${eventId}/archive`, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(errorText || 'Erreur lors de l\'archivage de l\'événement', response.status);
  }

  return response.json();
}

/**
 * Liste tous les événements (admin)
 */
export async function listEventsAdmin(): Promise<EventResponse[]> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new ApiError('Non authentifié', 401);
  }

  const response = await authFetch(`${API_BASE_URL}/api/admin/events`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(errorText || 'Erreur lors de la récupération des événements', response.status);
  }

  return response.json();
}

/**
 * Liste les événements publiés (accessible publiquement)
 */
export async function listPublicEvents(): Promise<EventResponse[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/events`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404 || response.status === 401) {
        console.warn('Endpoint public /api/events non disponible. Veuillez créer le EventController côté backend.');
        return [];
      }
      const errorText = await response.text();
      throw new ApiError(errorText || 'Erreur lors de la récupération des événements', response.status);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      console.warn('Impossible de se connecter à l\'API des événements');
      return [];
    }
    throw error;
  }
}

/**
 * Récupère les détails publics d'un événement
 */
export async function getPublicEventDetails(eventId: number): Promise<EventResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const text = await response.text().catch(() => '');
      throw new ApiError(text || 'Erreur lors de la récupération de l\'événement', response.status);
    }

    return response.json();
  } catch (err) {
    if (err instanceof TypeError) {
      console.warn('Impossible de se connecter à l\'API des événements');
      return null;
    }
    throw err;
  }
}
