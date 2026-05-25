import { ApiError } from './authApi';
import { authFetch } from './authFetch';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export interface SchoolResponse {
  id: number;
  name: string;
  typeFr: string;
  typeEn: string;
  city: string;
  region: string;
  domains: string[];
  imageUrl?: string | null;
  website?: string | null;
  descriptionFr: string;
  descriptionEn: string;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SchoolCreateRequest {
  name: string;
  typeFr: string;
  typeEn: string;
  city: string;
  region: string;
  domains: string[];
  imageUrl?: string;
  website?: string;
  descriptionFr: string;
  descriptionEn: string;
  published: boolean;
}

export async function listPublicSchools(): Promise<SchoolResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/public/schools`);
  if (!response.ok) {
    throw new ApiError('Impossible de charger les écoles', response.status);
  }
  return response.json();
}

export async function listAdminSchools(): Promise<SchoolResponse[]> {
  const response = await authFetch(`${API_BASE_URL}/api/admin/schools`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || errorData.error || 'Erreur lors du chargement des écoles',
      response.status,
      errorData.errors
    );
  }
  return response.json();
}

export async function createSchool(request: SchoolCreateRequest): Promise<SchoolResponse> {
  const response = await authFetch(`${API_BASE_URL}/api/admin/schools`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || errorData.error || "Erreur lors de l'ajout de l'école",
      response.status,
      errorData.errors
    );
  }
  return response.json();
}

export async function updateSchool(id: number, request: SchoolCreateRequest): Promise<SchoolResponse> {
  const response = await authFetch(`${API_BASE_URL}/api/admin/schools/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || errorData.error || 'Erreur lors de la mise à jour',
      response.status,
      errorData.errors
    );
  }
  return response.json();
}

export async function deleteSchool(id: number): Promise<void> {
  const response = await authFetch(`${API_BASE_URL}/api/admin/schools/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || errorData.error || 'Erreur lors de la suppression',
      response.status,
      errorData.errors
    );
  }
}
