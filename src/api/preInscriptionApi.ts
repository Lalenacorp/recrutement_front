import { ApiError } from './authApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export async function submitPreInscription(
  payload: Record<string, string>
): Promise<{ id: number }> {
  const response = await fetch(`${API_BASE_URL}/api/public/pre-inscriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || errorData.error || "Impossible d'envoyer la fiche",
      response.status,
      errorData.errors
    );
  }

  return response.json();
}
