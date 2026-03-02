import type { EventCreateRequest, EventResponse } from '../types';
import { ApiError } from './authApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * Crée un nouveau événement (brouillon)
 */
export async function createEvent(request: EventCreateRequest): Promise<EventResponse> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new ApiError('Non authentifié', 401);
  }

  // Debug: log token payload to help diagnose 401 responses
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.debug('createEvent: token payload:', payload);
    } else {
      console.debug('createEvent: token present but not JWT-like');
    }
  } catch (e) {
    console.debug('createEvent: failed to decode token for debug', e);
  }

  const response = await fetch(`${API_BASE_URL}/api/admin/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    if (response.status === 401) {
      console.warn('createEvent: backend returned 401 Unauthorized. Response body:', errorText);
      throw new ApiError('Non autorisé — vérifiez le token ou les droits (ADMIN)', 401);
    }
    throw new ApiError(errorText || 'Erreur lors de la création de l\'événement', response.status);
  }

  return response.json();
}

/**
 * Publie un événement (change le statut de DRAFT à PUBLISHED)
 */
export async function publishEvent(eventId: number): Promise<EventResponse> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new ApiError('Non authentifié', 401);
  }

  const response = await fetch(`${API_BASE_URL}/api/admin/events/${eventId}/publish`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
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

  const response = await fetch(`${API_BASE_URL}/api/admin/events/${eventId}/archive`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
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

  const response = await fetch(`${API_BASE_URL}/api/admin/events`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
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
