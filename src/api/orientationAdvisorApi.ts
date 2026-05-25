import { ApiError } from './authApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export type OrientationChatRole = 'user' | 'assistant';

export interface OrientationChatMessage {
  role: OrientationChatRole;
  content: string;
}

export interface OrientationChatResponse {
  reply: string;
  ragUsed: boolean;
  sources: string[];
}

export async function sendOrientationMessage(
  message: string,
  history: OrientationChatMessage[] = []
): Promise<OrientationChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/public/orientation-advisor/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || errorData.error || 'Impossible de contacter le conseiller IA',
      response.status,
      errorData.errors
    );
  }

  return response.json();
}
